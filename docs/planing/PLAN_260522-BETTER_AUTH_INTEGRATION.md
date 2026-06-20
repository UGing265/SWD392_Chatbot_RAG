# Plan: Add Username to Docs + Better Auth Integration

## Context

User wants:
1. Add `username` field to documentation (ERD.txt and Architecture.md)
2. Integrate **Better Auth** in Next.js frontend (`frontend/` folder)
3. **Go backend stays unchanged** - just update JWT middleware to validate Better Auth tokens

## Architecture

```
Browser ──► Next.js (Better Auth) ──► Go Backend (JWT validated)
              │                            │
              ├── Register/Login           ├── Business logic
              ├── Session management       ├── RAG pipeline
              └── Serves JWT to client     └── Chat/Documents
```

Better Auth runs in `frontend/` alongside Next.js. Go backend JWT middleware is updated to accept Better Auth tokens (same HS256 algorithm, just different secret/claims).

---

## Phase 1: Add Username to Documentation

### Files modified:
1. `docs/ERD.txt` - Added `username` column to users table
2. `docs/Architecture.md` - Added `Username` field to User entity

---

## Phase 2: Install Better Auth in Frontend

### Files CREATED in `frontend/`:

| File | Purpose |
|------|---------|
| `package.json` | Dependencies including better-auth |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js config |
| `next.config.js` | Next.js config (alternative) |
| `.env.local` | BETTER_AUTH_SECRET, DATABASE_URL |
| `lib/auth.ts` | Better Auth server instance with username plugin |
| `lib/auth-client.ts` | Better Auth client for frontend |
| `app/api/auth/[...all]/route.ts` | Mount Better Auth API handlers |

### Files CREATED (auth pages):

| File | Purpose |
|------|---------|
| `app/(auth)/login/page.tsx` | Login with email or username |
| `app/(auth)/register/page.tsx` | Register with username, email, name, password |

---

## Phase 3: Update Go JWT Middleware (MINIMAL)

### Files modified in `backend/`:

| File | Change |
|------|--------|
| `pkg/jwt/jwt.go` | Updated Claims to handle Better Auth `sub` claim |
| `internal/interface/middleware/auth.go` | No changes needed - works as-is |

### Better Auth JWT Claims:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "username": "johndoe",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Files Changed Summary

### CREATE (frontend):
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/next.config.ts`
- `frontend/next.config.js`
- `frontend/.env.local`
- `frontend/lib/auth.ts`
- `frontend/lib/auth-client.ts`
- `frontend/app/api/auth/[...all]/route.ts`
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`

### MODIFY (docs):
- `docs/ERD.txt` - Added username field
- `docs/Architecture.md` - Added Username field

### MODIFY (backend):
- `backend/pkg/jwt/jwt.go` - Handle Better Auth tokens

---

## Verification Steps

1. `cd frontend && npm install`
2. Add BETTER_AUTH_SECRET to `frontend/.env.local` (must match Go JWT secret)
3. Run frontend: `npm run dev`
4. Test register with username: `POST /api/auth/sign-up/email` with email, password, name, username
5. Test login with username or email
6. Test Go backend with Better Auth JWTs
7. Verify protected routes work

---

## Key Implementation Details

### Better Auth Username Plugin
```ts
import { username } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    username({
      allowUsernameOrEmail: true,
    }),
  ],
});
```

### Go JWT Token Validation
Better Auth uses `sub` claim instead of `user_id`. The updated JWT service handles this:
- If `user_id` is nil but `sub` exists, parse `sub` as UUID and use it

---

## Next Steps

1. Generate Better Auth schema: `npx @better-auth/cli generate`
2. Import `backend/database/swd391_dangerous_malware.sql`
3. Ensure BETTER_AUTH_SECRET matches Go backend JWT secret
4. Test full auth flow
