import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/lib/auth";

function handlers(request: Request) {
  return toNextJsHandler(createAuth(new URL(request.url).origin));
}

export async function GET(request: Request) {
  return handlers(request).GET(request);
}

export async function POST(request: Request) {
  return handlers(request).POST(request);
}
