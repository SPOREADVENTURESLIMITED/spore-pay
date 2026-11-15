import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/lib/auth";

export const runtime = "edge";

export async function GET(request: Request) {
  const authHandlers = toNextJsHandler(await createAuth());
  return authHandlers.GET(request);
}

export async function POST(request: Request) {
  const authHandlers = toNextJsHandler(await createAuth());
  return authHandlers.POST(request);
}
