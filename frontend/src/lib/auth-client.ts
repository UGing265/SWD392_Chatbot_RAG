import { createAuthClient } from "better-auth/react";
import { usernameClient, jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000",
  plugins: [
    usernameClient(),
    jwtClient(),
  ],
});

export type AuthClient = typeof authClient;