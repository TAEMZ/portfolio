import { next } from "@vercel/edge";
import { AnswerEdge } from "@answeredge/sdk";

AnswerEdge.init({
  apiKey: process.env.ANSWEREDGE_API_KEY,
  endpoint: "https://notes-ranking-acquire-particle.trycloudflare.com",
});

export default async function middleware(request: Request) {
  await AnswerEdge.trackNow({
    userAgent: request.headers.get("user-agent"),
    path: new URL(request.url).pathname,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });
  return next();
}

export const config = { matcher: "/(.*)" };
