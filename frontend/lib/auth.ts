import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: {
    type: "postgres",
    pool: pool,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    username({
      // Allow sign in with username or email
      allowUsernameOrEmail: true,
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
});

export type Auth = typeof auth;