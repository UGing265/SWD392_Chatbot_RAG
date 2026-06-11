import { betterAuth } from "better-auth";
import { jwt, username } from "better-auth/plugins";
import dotenv from "dotenv";
import { SignJWT } from "jose";
import pg from "pg";

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
    additionalFields: {
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
    minPasswordLength: 6,
  },
  plugins: [
    username(),
    jwt({
      jwks: {
        remoteUrl: "http://localhost:5000/api/auth/jwks",
        keyPairConfig: {
          alg: "ES256",
        },
      },
      jwt: {
        expirationTime: "1h",
        definePayload: ({ user }) => {
          // @ts-ignore
          const roleId = user.roleId;
          const role =
            roleId === 1 ? "admin" : roleId === 2 ? "lecturer" : "student";
          return {
            sub: user.id,
            role: role,
          };
        },
        sign: async (payload) => {
          const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET,
          );
          return await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setExpirationTime("1h")
            .sign(secret);
        },
      },
    }),
  ],
  secret: process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET!,
});

export type Auth = typeof auth;
