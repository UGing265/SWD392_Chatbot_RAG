"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    try {
      const { data, error } = await authClient.signUp.email(
        {
          email: email,
          password: password,
          name: name,
          username: username,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
        }
      );

      if (error) {
        setError(error.message || "An error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center" }}>
          Register
        </h1>

        {error && (
          <div style={{ padding: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "0.5rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="username" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "0.375rem" }}
            />
          </div>

          <div>
            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "0.375rem" }}
            />
          </div>

          <div>
            <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "0.375rem" }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "0.375rem" }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "0.75rem",
              backgroundColor: isLoading ? "#9ca3af" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              fontWeight: "500",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", textAlign: "center", color: "#6b7280" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
}