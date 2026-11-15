import { createAuthClient } from "better-auth/react";
import type { createAuth } from "./auth";

type SporeAuth = ReturnType<typeof createAuth>;

export const authClient = createAuthClient<SporeAuth>();
