import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/lib/auth";

const authHandlers = toNextJsHandler(createAuth());

export async function GET(request: Request) {
  return authHandlers.GET(request);
}

export async function POST(request: Request) {
  return authHandlers.POST(request);
}
