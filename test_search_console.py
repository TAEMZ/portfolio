#!/usr/bin/env python3
"""
Google Search Console API test script using Python 3 standard library.

Authenticates via Service Account key.json (default if present) or OAuth 2.0
(GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET from .env), lists verified sites and
sitemaps, queries last-28-day search performance, and runs URL Inspection for
https://abiykibru.vercel.app/.
"""

import argparse
import base64
import datetime
import hashlib
import http.server
import json
import os
import secrets
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
DEFAULT_KEY_PATH = BASE_DIR / "key.json"
TOKEN_PATH = BASE_DIR / ".google_tokens" / "gsc_token.json"

OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"
GSC_SITES_URL = "https://www.googleapis.com/webmasters/v3/sites"
GSC_SITEMAPS_URL = "https://www.googleapis.com/webmasters/v3/sites/{site_url}/sitemaps"
GSC_ANALYTICS_URL = "https://www.googleapis.com/webmasters/v3/sites/{site_url}/searchAnalytics/query"
GSC_INSPECT_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"

SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
]


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        if key and key not in os.environ:
            os.environ[key] = value


def http_json(url: str, method: str = "GET", headers: dict | None = None, body: bytes | None = None) -> dict:
    req = urllib.request.Request(url, data=body, method=method)
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as err:
        err_body = err.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(err_body)
        except json.JSONDecodeError:
            parsed = {"raw": err_body}
        raise RuntimeError(f"HTTP {err.code} calling {url}:\n{json.dumps(parsed, indent=2)}") from err


def post_form(url: str, data: dict) -> dict:
    encoded = urllib.parse.urlencode(data).encode("utf-8")
    return http_json(
        url,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        body=encoded,
    )


def save_token(token_data: dict) -> None:
    TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
    TOKEN_PATH.write_text(json.dumps(token_data, indent=2), encoding="utf-8")
    os.chmod(TOKEN_PATH, 0o600)


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def build_pkce() -> tuple[str, str]:
    verifier = b64url(secrets.token_bytes(32))
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = b64url(digest)
    return verifier, challenge


def resolve_key_path(cli_key: str | None) -> Path | None:
    raw = (cli_key or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "")).strip()
    if raw:
        path = Path(raw).expanduser()
        if not path.is_file():
            raise RuntimeError(f"Service account key file not found: {path}")
        return path
    if DEFAULT_KEY_PATH.is_file():
        return DEFAULT_KEY_PATH
    for candidate in sorted(BASE_DIR.glob("project-*.json")):
        if candidate.is_file():
            return candidate
    return None


def get_service_account_token(key_path: Path, scopes: list[str]) -> tuple[str, str]:
    info = json.loads(key_path.read_text(encoding="utf-8"))
    if info.get("type") != "service_account":
        raise RuntimeError(f"{key_path} is not a service_account JSON key (type={info.get('type')!r}).")

    client_email = info.get("client_email", "")
    private_key = info.get("private_key", "")
    token_uri = info.get("token_uri") or OAUTH_TOKEN_URL
    if not client_email or not private_key:
        raise RuntimeError(f"{key_path} is missing client_email or private_key.")

    now = int(time.time())
    header = {"alg": "RS256", "typ": "JWT"}
    if info.get("private_key_id"):
        header["kid"] = info["private_key_id"]
    claims = {
        "iss": client_email,
        "scope": " ".join(scopes),
        "aud": token_uri,
        "exp": now + 3600,
        "iat": now,
    }
    signing_input = (
        b64url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
        + "."
        + b64url(json.dumps(claims, separators=(",", ":")).encode("utf-8"))
    ).encode("ascii")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".pem", delete=False) as tf:
            tmp_path = tf.name
            tf.write(private_key)
        os.chmod(tmp_path, 0o600)
        proc = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", tmp_path],
            input=signing_input,
            capture_output=True,
            check=False,
        )
        if proc.returncode != 0:
            raise RuntimeError(f"openssl JWT signing failed: {proc.stderr.decode('utf-8', errors='replace').strip()}")
        sig_b64 = b64url(proc.stdout)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    assertion = f"{signing_input.decode('ascii')}.{sig_b64}"
    token_resp = post_form(
        token_uri,
        {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion,
        },
    )
    return token_resp["access_token"], client_email


def get_access_token(
    client_id: str,
    client_secret: str,
    host: str,
    port: int,
    redirect_uri_override: str | None,
    manual: bool,
    reset_auth: bool,
) -> str:
    if reset_auth and TOKEN_PATH.exists():
        TOKEN_PATH.unlink()

    if TOKEN_PATH.is_file():
        cached = json.loads(TOKEN_PATH.read_text(encoding="utf-8"))
        if cached.get("access_token") and cached.get("expires_at", 0) > time.time() + 60:
            return cached["access_token"]
        if cached.get("refresh_token"):
            refreshed = post_form(
                OAUTH_TOKEN_URL,
                {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "refresh_token": cached["refresh_token"],
                    "grant_type": "refresh_token",
                },
            )
            cached["access_token"] = refreshed["access_token"]
            cached["expires_at"] = time.time() + int(refreshed.get("expires_in", 3600))
            save_token(cached)
            return cached["access_token"]

    redirect_uri = (redirect_uri_override or os.environ.get("GOOGLE_REDIRECT_URI") or f"http://{host}:{port}/").strip()
    state = secrets.token_urlsafe(24)
    verifier, challenge = build_pkce()

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    auth_url = f"{OAUTH_AUTH_URL}?{urllib.parse.urlencode(params)}"

    print("\nAuthorize Google Search Console access in your browser:")
    print(auth_url)

    code = None
    if manual:
        raw_redirect = input("\nAfter approving, paste the full redirected URL (or code) here: ").strip()
        if raw_redirect.startswith("http"):
            qs = urllib.parse.parse_qs(urllib.parse.urlparse(raw_redirect).query)
            if qs.get("state", [None])[0] != state:
                raise RuntimeError("OAuth state mismatch; aborting.")
            code = qs.get("code", [None])[0]
        else:
            code = raw_redirect
    else:
        auth_result: dict[str, str | None] = {"code": None, "error": None}

        class CallbackHandler(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                parsed = urllib.parse.urlparse(self.path)
                qs = urllib.parse.parse_qs(parsed.query)
                if qs.get("error"):
                    auth_result["error"] = qs["error"][0]
                elif qs.get("state", [None])[0] != state:
                    auth_result["error"] = "OAuth state mismatch"
                else:
                    auth_result["code"] = qs.get("code", [None])[0]

                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                msg = (
                    "<h2>Authorization received. You can close this tab and return to the terminal.</h2>"
                    if auth_result["code"]
                    else f"<h2>Authorization error: {auth_result['error']}</h2>"
                )
                self.wfile.write(msg.encode("utf-8"))

            def log_message(self, format, *args):
                return

        bind_host = "127.0.0.1" if host in ("127.0.0.1", "localhost") else host
        server = http.server.HTTPServer((bind_host, port), CallbackHandler)
        server.timeout = 180
        print(f"\nListening for OAuth callback on {redirect_uri} (timeout: 180s)...")
        webbrowser.open(auth_url)

        deadline = time.time() + 180
        while time.time() < deadline and auth_result["code"] is None and auth_result["error"] is None:
            server.handle_request()
        server.server_close()

        if auth_result["error"]:
            raise RuntimeError(f"OAuth authorization failed: {auth_result['error']}")
        code = auth_result["code"]

    if not code:
        raise RuntimeError("No authorization code received.")

    token_resp = post_form(
        OAUTH_TOKEN_URL,
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "code_verifier": verifier,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
    )
    token_resp["expires_at"] = time.time() + int(token_resp.get("expires_in", 3600))
    save_token(token_resp)
    return token_resp["access_token"]


def query_search_analytics(
    encoded_site: str,
    headers: dict,
    start_date: datetime.date,
    end_date: datetime.date,
    dimensions: list[str] | None = None,
    row_limit: int = 25,
) -> list[dict]:
    payload: dict = {
        "startDate": start_date.isoformat(),
        "endDate": end_date.isoformat(),
        "dataState": "all",
        "rowLimit": row_limit,
    }
    if dimensions:
        payload["dimensions"] = dimensions
    resp = http_json(
        GSC_ANALYTICS_URL.format(site_url=encoded_site),
        method="POST",
        headers=headers,
        body=json.dumps(payload).encode("utf-8"),
    )
    return resp.get("rows", [])


def print_breakdown_table(
    title: str,
    rows: list[dict],
    key_label: str,
    empty_msg: str,
    uppercase_key: bool = False,
    max_key_len: int = 38,
) -> None:
    print(f"\n{title}:")
    if not rows:
        print(f"  ({empty_msg})")
        return
    width = max(len(key_label), min(max_key_len, max(len((r.get("keys") or ["-"])[0]) for r in rows)))
    print(f"  {key_label:<{width}} | Clicks | Impr. |   CTR  | Pos.")
    print(f"  {'-' * width}-+--------+-------+--------+------")
    for row in rows:
        raw_key = (row.get("keys") or ["TOTAL"])[0]
        if uppercase_key and raw_key != "TOTAL":
            raw_key = raw_key.upper()
        key_text = raw_key[:width]
        clicks = int(row.get("clicks", 0))
        impr = int(row.get("impressions", 0))
        ctr = float(row.get("ctr", 0.0)) * 100.0
        pos = float(row.get("position", 0.0))
        print(f"  {key_text:<{width}} | {clicks:>6} | {impr:>5} | {ctr:>5.1f}% | {pos:>4.1f}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Test Google Search Console API access.")
    parser.add_argument("--site", help="Search Console property URL (overrides GSC_SITE_URL in .env)")
    parser.add_argument("--inspect-url", help="Specific URL to inspect (defaults to --site or https://abiykibru.vercel.app/)")
    parser.add_argument("--days", type=int, default=90, help="Trailing days for Performance data (default: 90)")
    parser.add_argument("--key", help="Path to Service Account JSON key (defaults to key.json or project-*.json)")
    parser.add_argument("--host", default="127.0.0.1", help="OAuth callback host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8080, help="OAuth callback port (default: 8080)")
    parser.add_argument("--redirect-uri", help="Exact OAuth redirect URI override (overrides --host/--port)")
    parser.add_argument("--manual", action="store_true", help="Paste redirected URL manually instead of using local callback server")
    parser.add_argument("--reset-auth", action="store_true", help="Clear cached OAuth token and re-authenticate")
    args = parser.parse_args()

    load_dotenv(ENV_PATH)
    key_path = resolve_key_path(args.key)
    if key_path:
        access_token, sa_email = get_service_account_token(key_path, SCOPES)
        print(f"Service account authentication succeeded ({sa_email} via {key_path.name}).")
    else:
        client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
        client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "").strip()
        if not client_id or not client_secret:
            print(
                "ERROR: No Service Account key.json found and GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set in .env.",
                file=sys.stderr,
            )
            return 1

        access_token = get_access_token(
            client_id, client_secret, args.host, args.port, args.redirect_uri, args.manual, args.reset_auth
        )
        print("OAuth authentication succeeded.")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    # 1. List verified sites
    sites_resp = http_json(GSC_SITES_URL, headers=headers)
    site_entries = sites_resp.get("siteEntry", [])
    print("\nVerified Search Console Sites:")
    if not site_entries:
        print("  (none returned for this Google account)")
    for entry in site_entries:
        print(f"  - {entry.get('siteUrl')} ({entry.get('permissionLevel')})")

    site_url = (args.site or os.environ.get("GSC_SITE_URL") or "https://abiykibru.vercel.app/").strip()
    known_urls = [e.get("siteUrl") for e in site_entries if e.get("siteUrl")]
    if known_urls and site_url not in known_urls:
        site_url = known_urls[0]
        print(f"\nUsing matched verified site: {site_url}")

    encoded_site = urllib.parse.quote(site_url, safe="")

    # 2. List sitemaps
    print(f"\nSitemaps for {site_url}:")
    sitemaps_resp = http_json(GSC_SITEMAPS_URL.format(site_url=encoded_site), headers=headers)
    sitemaps = sitemaps_resp.get("sitemap", [])
    if not sitemaps:
        print("  (no sitemaps found)")
    for sm in sitemaps:
        print(
            f"  - {sm.get('path')} | lastDownloaded={sm.get('lastDownloaded')} "
            f"| errors={sm.get('errors')} | warnings={sm.get('warnings')}"
        )

    # 3. Search Console Performance breakdowns (Overview, Devices, Countries, Pages, Queries, Dates)
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=max(1, args.days))
    window_label = f"{start_date} -> {end_date} ({args.days}d, dataState=all)"

    total_rows = query_search_analytics(encoded_site, headers, start_date, end_date, dimensions=None, row_limit=1)
    print_breakdown_table(
        f"Performance Overview ({window_label})",
        total_rows,
        "Scope",
        "0 total clicks/impressions in window",
    )

    device_rows = query_search_analytics(encoded_site, headers, start_date, end_date, dimensions=["device"], row_limit=10)
    print_breakdown_table(
        f"Devices ({window_label})",
        device_rows,
        "Device",
        "0 device rows returned",
    )

    country_rows = query_search_analytics(encoded_site, headers, start_date, end_date, dimensions=["country"], row_limit=20)
    print_breakdown_table(
        f"Countries ({window_label})",
        country_rows,
        "Country",
        "0 country rows returned",
        uppercase_key=True,
    )

    page_rows = query_search_analytics(encoded_site, headers, start_date, end_date, dimensions=["page"], row_limit=20)
    print_breakdown_table(
        f"Pages ({window_label})",
        page_rows,
        "Page URL",
        "0 page rows returned",
        max_key_len=55,
    )

    query_rows = query_search_analytics(encoded_site, headers, start_date, end_date, dimensions=["query"], row_limit=25)
    print_breakdown_table(
        f"Top Search Queries ({window_label})",
        query_rows,
        "Query",
        "0 query rows returned",
    )

    date_rows = query_search_analytics(encoded_site, headers, start_date, end_date, dimensions=["date"], row_limit=31)
    print_breakdown_table(
        f"Daily Performance ({window_label})",
        sorted(date_rows, key=lambda r: (r.get("keys") or [""])[0]),
        "Date",
        "0 daily rows returned",
    )

    # 4. URL Inspection
    inspect_target = (args.inspect_url or ("https://abiykibru.vercel.app/" if site_url.startswith("sc-domain:") else site_url)).strip()
    print(f"\nURL Inspection for {inspect_target}:")
    try:
        inspect_resp = http_json(
            GSC_INSPECT_URL,
            method="POST",
            headers=headers,
            body=json.dumps({"inspectionUrl": inspect_target, "siteUrl": site_url}).encode("utf-8"),
        )
        idx = inspect_resp.get("inspectionResult", {}).get("indexStatusResult", {})
        print(f"  Verdict         : {idx.get('verdict')}")
        print(f"  Coverage State  : {idx.get('coverageState')}")
        print(f"  Last Crawl Time : {idx.get('lastCrawlTime')}")
        print(f"  Crawled As      : {idx.get('crawledAs')}")
        print(f"  User Canonical  : {idx.get('userCanonical')}")
        print(f"  Google Canonical: {idx.get('googleCanonical')}")
        print(f"  Sitemaps        : {idx.get('sitemap')}")
    except RuntimeError as err:
        print(f"  URL Inspection call failed:\n{err}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

