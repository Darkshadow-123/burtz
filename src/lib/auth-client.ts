import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const baseURL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

export const authClient = createAuthClient({
  baseURL,
  plugins: [usernameClient()],
});
