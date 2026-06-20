import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { auth, pool } from "./auth.js";
import { jwtVerify } from "jose";
import { hashPassword } from "better-auth/crypto";

const app = new Hono();

// CORS configuration to allow Next.js frontend (http://localhost:3000)
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Swagger JSON Spec
app.get("/swagger.json", (c) => {
  return c.json({
    openapi: "3.0.0",
    info: {
      title: "SWD392 Chatbot RAG - Hono Auth Service API",
      version: "1.0.0",
      description: "API Documentation for Better Auth and Session Management Service."
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Hono Auth Server"
      }
    ],
    paths: {
      "/health": {
        "get": {
          summary: "Health Check",
          description: "Checks if the Hono auth server is alive and responding.",
          responses: {
            "200": {
              description: "Server is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/auth/sign-up/email": {
        "post": {
          summary: "Sign Up (Register)",
          description: "Registers a new user account with username, email, display name, and password.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password", "name", "username"],
                  properties: {
                    email: { type: "string", format: "email", example: "user@example.com" },
                    password: { type: "string", format: "password", example: "password123" },
                    name: { type: "string", example: "John Doe" },
                    username: { type: "string", example: "johndoe" }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: { type: "string", example: "Nu8nX1AJDoTQ..." },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "uuid-1234..." },
                          email: { type: "string", example: "user@example.com" },
                          name: { type: "string", example: "John Doe" },
                          username: { type: "string", example: "johndoe" },
                          emailVerified: { type: "boolean", example: false },
                          image: { type: "string", nullable: true, example: null }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              description: "Bad Request / Email or Username already exists"
            }
          }
        }
      },
      "/api/auth/sign-in/email": {
        "post": {
          summary: "Sign In (Login)",
          description: "Authenticates user using email and password, returning a new session token.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email", example: "user@example.com" },
                    password: { type: "string", format: "password", example: "password123" }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: { type: "string", example: "SMjN48CQPYv..." },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "uuid-1234..." },
                          email: { type: "string", example: "user@example.com" },
                          name: { type: "string", example: "John Doe" }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              description: "Unauthorized / Invalid credentials"
            }
          }
        }
      },
      "/api/auth/get-session": {
        "get": {
          summary: "Get Current Session",
          description: "Retrieves active user session details based on session cookie or auth token.",
          responses: {
            "200": {
              description: "Session data, or null if unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    nullable: true,
                    properties: {
                      user: { type: "object" },
                      session: { type: "object" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/auth/sign-out": {
        "post": {
          summary: "Sign Out (Logout)",
          description: "Logs out the current user, invalidating the session token.",
          responses: {
            "200": {
              description: "Logout successful"
            }
          }
        }
      }
    }
  });
});

// Swagger UI Route
app.get("/swagger", swaggerUI({ url: "/swagger.json" }));

async function verifyAdmin(c: any) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// Admin Create User Route
app.post("/api/admin/users", async (c) => {
  const adminPayload = await verifyAdmin(c);
  if (!adminPayload) {
    return c.json({ error: "Unauthorized: Admins only" }, 401);
  }

  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { email, password, name, username, roleId } = body;
  if (!email || !password || !name || !username || !roleId) {
    return c.json({ error: "Missing required fields: email, password, name, username, roleId" }, 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if email or username already exists
    const userCheck = await client.query(
      "SELECT id FROM public.users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userCheck.rowCount && userCheck.rowCount > 0) {
      await client.query("ROLLBACK");
      return c.json({ error: "Email or username already exists" }, 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user - let UUID generator handle ID
    const userInsert = await client.query(
      `INSERT INTO public.users (email, name, username, role_id, is_active, is_blocked) 
       VALUES ($1, $2, $3, $4, true, false) RETURNING id`,
      [email, name, username, parseInt(roleId)]
    );

    const userId = userInsert.rows[0].id;

    // Insert account
    await client.query(
      `INSERT INTO public.account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt") 
       VALUES (gen_random_uuid(), $1, 'credential', $2, $3, NOW(), NOW())`,
      [userId, userId, hashedPassword]
    );

    await client.query("COMMIT");

    return c.json({
      message: "User created successfully",
      user: {
        id: userId,
        email,
        name,
        username,
        roleId,
      }
    }, 201);
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Failed to create user:", error);
    return c.json({ error: "Failed to create user: " + error.message }, 500);
  } finally {
    client.release();
  }
});

// Admin Update User Route
app.put("/api/admin/users/:id", async (c) => {
  const adminPayload = await verifyAdmin(c);
  if (!adminPayload) {
    return c.json({ error: "Unauthorized: Admins only" }, 401);
  }

  const userId = c.req.param("id");
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { email, name, username, roleId } = body;
  if (!email || !name || !username || !roleId) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if email or username already exists for other users
    const check = await client.query(
      "SELECT id FROM public.users WHERE (email = $1 OR username = $2) AND id != $3",
      [email, username, userId]
    );
    if (check.rowCount && check.rowCount > 0) {
      await client.query("ROLLBACK");
      return c.json({ error: "Email or username already exists" }, 400);
    }

    await client.query(
      `UPDATE public.users 
       SET email = $1, name = $2, username = $3, role_id = $4, "updatedAt" = NOW(), updated_at = NOW() 
       WHERE id = $5`,
      [email, name, username, parseInt(roleId), userId]
    );

    await client.query("COMMIT");
    return c.json({ message: "User updated successfully" });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Failed to update user:", error);
    return c.json({ error: "Failed to update user: " + error.message }, 500);
  } finally {
    client.release();
  }
});

// Admin Reset Password Route
app.put("/api/admin/users/:id/password", async (c) => {
  const adminPayload = await verifyAdmin(c);
  if (!adminPayload) {
    return c.json({ error: "Unauthorized: Admins only" }, 401);
  }

  const userId = c.req.param("id");
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { password } = body;
  if (!password || password.length < 6) {
    return c.json({ error: "Password must be at least 6 characters long" }, 400);
  }

  const hashedPassword = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE public.account 
       SET password = $1, "updatedAt" = NOW() 
       WHERE "userId" = $2 AND "providerId" = 'credential'`,
      [hashedPassword, userId]
    );
    return c.json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Failed to update password:", error);
    return c.json({ error: "Failed to update password: " + error.message }, 500);
  } finally {
    client.release();
  }
});

// Admin Delete User Route
app.delete("/api/admin/users/:id", async (c) => {
  const adminPayload = await verifyAdmin(c);
  if (!adminPayload) {
    return c.json({ error: "Unauthorized: Admins only" }, 401);
  }

  const userId = c.req.param("id");
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM public.users WHERE id = $1", [userId]);
    return c.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return c.json({ error: "Failed to delete user: " + error.message }, 500);
  } finally {
    client.release();
  }
});

// Route all auth requests to better-auth raw request handler
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
console.log(`Auth service is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: port,
});
