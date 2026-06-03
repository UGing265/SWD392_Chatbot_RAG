import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  user: {
    modelName: "users",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    username({
      allowUsernameOrEmail: true,
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
});

export type Auth = typeof auth;
