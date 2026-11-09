const crypto = require('crypto');

const SESSION_COOKIE_NAME = 'portfolio_admin_session';
const UNLOCK_COOKIE_NAME = 'portfolio_admin_unlock';
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const UNLOCK_TTL_SECONDS = 60 * 15; // 15 minutes

function getSigningKey() {
    if (process.env.ADMIN_SESSION_SECRET) {
        return crypto
            .createHash('sha256')
            .update(process.env.ADMIN_SESSION_SECRET)
            .digest();
    }
    if (process.env.POSTGRES_URL) {
        return crypto
            .createHmac('sha256', process.env.POSTGRES_URL)
            .update('portfolio-admin-session-key-v1')
            .digest();
    }
    throw new Error('Server signing secret is not configured.');
}

function safeEqualStrings(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
}

function signToken(payload, ttlSeconds) {
    const data = {
        ...payload,
        exp: Date.now() + ttlSeconds * 1000,
        jti: crypto.randomBytes(12).toString('hex'),
    };
    const encoded = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
    const sig = crypto
        .createHmac('sha256', getSigningKey())
        .update(encoded)
        .digest('base64url');
    return `${encoded}.${sig}`;
}

function verifyToken(token, expectedScope) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, providedSig] = parts;
    if (!encoded || !providedSig) return null;

    const expectedSig = crypto
        .createHmac('sha256', getSigningKey())
        .update(encoded)
        .digest('base64url');

    if (!safeEqualStrings(providedSig, expectedSig)) return null;

    try {
        const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
        if (!payload || typeof payload.exp !== 'number' || payload.exp <= Date.now()) {
            return null;
        }
        if (expectedScope && payload.scope !== expectedScope) {
            return null;
        }
        return payload;
    } catch {
        return null;
    }
}

function parseCookies(req) {
    const header = req.headers?.cookie;
    const cookies = {};
    if (!header || typeof header !== 'string') return cookies;
    for (const part of header.split(';')) {
        const idx = part.indexOf('=');
        if (idx === -1) continue;
        const key = part.slice(0, idx).trim();
        const val = part.slice(idx + 1).trim();
        if (key) {
            try {
                cookies[key] = decodeURIComponent(val);
            } catch {
                cookies[key] = val;
            }
        }
    }
    return cookies;
}

function isSecureRequest(req) {
    const proto = req.headers?.['x-forwarded-proto'];
    if (typeof proto === 'string' && proto.split(',')[0].trim() === 'https') {
        return true;
    }
    return Boolean(req.socket?.encrypted || process.env.VERCEL === '1');
}

function buildCookie(name, value, maxAgeSeconds, req) {
    const parts = [
        `${name}=${encodeURIComponent(value)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${maxAgeSeconds}`,
    ];
    if (isSecureRequest(req)) {
        parts.push('Secure');
    }
    return parts.join('; ');
}

function appendSetCookie(res, cookieStrings) {
    const existing = res.getHeader('Set-Cookie');
    const list = Array.isArray(existing)
        ? existing
        : existing
            ? [String(existing)]
            : [];
    res.setHeader('Set-Cookie', [...list, ...cookieStrings]);
}

function setUnlockCookie(req, res) {
    const token = signToken({ scope: 'unlock' }, UNLOCK_TTL_SECONDS);
    appendSetCookie(res, [buildCookie(UNLOCK_COOKIE_NAME, token, UNLOCK_TTL_SECONDS, req)]);
}

function setSessionCookie(req, res) {
    const token = signToken({ scope: 'admin' }, SESSION_TTL_SECONDS);
    appendSetCookie(res, [
        buildCookie(SESSION_COOKIE_NAME, token, SESSION_TTL_SECONDS, req),
        buildCookie(UNLOCK_COOKIE_NAME, '', 0, req),
    ]);
}

function clearAuthCookies(req, res) {
    appendSetCookie(res, [
        buildCookie(SESSION_COOKIE_NAME, '', 0, req),
        buildCookie(UNLOCK_COOKIE_NAME, '', 0, req),
    ]);
}

function isUnlocked(req) {
    const cookies = parseCookies(req);
    return Boolean(verifyToken(cookies[UNLOCK_COOKIE_NAME], 'unlock'));
}

function isAdminAuthenticated(req) {
    const cookies = parseCookies(req);
    return Boolean(verifyToken(cookies[SESSION_COOKIE_NAME], 'admin'));
}

function requireAdminSession(req, res) {
    try {
        if (!isAdminAuthenticated(req)) {
            res.status(401).json({ error: 'Unauthorized: admin session required' });
            return false;
        }
        return true;
    } catch {
        res.status(500).json({ error: 'Authentication configuration error' });
        return false;
    }
}

module.exports = {
    safeEqualStrings,
    setUnlockCookie,
    setSessionCookie,
    clearAuthCookies,
    isUnlocked,
    isAdminAuthenticated,
    requireAdminSession,
};

