import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { auth } from "./auth.js";

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
