import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  trustedOrigins: ["http://localhost:3000"],
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
    fields: {
      roleId: {
        type: "number",
        fieldName: "role_id",
        defaultValue: 3,
      },
      isActive: {
        type: "boolean",
        fieldName: "is_active",
        defaultValue: true,
      },
      isBlocked: {
        type: "boolean",
        fieldName: "is_blocked",
        defaultValue: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    username(),
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
});

export type Auth = typeof auth;
