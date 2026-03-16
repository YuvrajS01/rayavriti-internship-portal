# Security Vulnerability Report (2026-03-17)

Scope reviewed: `src/app/api/**`, auth/session logic, rate limiting, and certificate rendering flow.

## 1) Stored XSS in certificate download HTML
- Severity: Critical
- Affected file: `src/app/api/certificates/[id]/download/route.ts`
- Evidence:
  - Unescaped user-controlled values are injected into raw HTML template literals:
    - `cert.userName` in `<title>` and body (`:49`, `:251`)
    - `cert.courseName` in body (`:257`)
- Why this is dangerous:
  - A malicious user can register with a payload in `name` (allowed by current validation), obtain a certificate, and trigger script execution when any user/admin opens the certificate download page.
  - This is a persistent (stored) XSS vector.
- Reproduction:
  1. Create a user with a name like `<img src=x onerror=alert(1)>`.
  2. Issue a certificate for that user.
  3. Open `/api/certificates/{certificateId}/download`.
  4. Payload executes in origin context.
- Recommended fix:
  - Escape all interpolated HTML values (`userName`, `courseName`, `certificateId`, and other dynamic strings) before injecting into template literals.
  - Prefer server-side templating with escaping defaults or render via React SSR where escaping is automatic.
  - Add CSP headers for defense in depth.

## 2) Missing authorization on admin settings read endpoint
- Severity: High
- Affected file: `src/app/api/admin/settings/route.ts`
- Evidence:
  - `GET` handler returns settings without `auth()` or role check (`:5-8`).
  - `PATCH` is admin-protected (`:17-21`), which indicates GET was intended to be privileged too.
- Why this is dangerous:
  - Unauthenticated users can fetch operational and payment settings, including `upiId`, merchant data, support contacts, and feature flags.
  - This is sensitive configuration exposure and increases phishing/recon risk.
- Reproduction:
  1. As an unauthenticated client, call `GET /api/admin/settings`.
  2. Observe full settings object is returned.
- Recommended fix:
  - Require authenticated admin role in GET, matching PATCH behavior.
  - Split public-safe settings to a separate endpoint if needed.

## 3) Weak OTP generation + bypassable/fragile rate limiting
- Severity: High
- Affected files:
  - `src/lib/email.ts`
  - `src/lib/ratelimit.ts`
- Evidence:
  - OTP uses `Math.random()` (`email.ts:41-43`), which is not cryptographically secure.
  - Rate limiter is in-memory and not shared across instances (`ratelimit.ts:1-7`, `:21-32`).
  - IP identity is derived from client-controlled forwarding headers (`ratelimit.ts:126-143`).
- Why this is dangerous:
  - OTP security depends heavily on strong randomness plus robust anti-bruteforce controls.
  - In-memory per-instance limiting and spoofable header identity can allow distributed or header-manipulated bypass, reducing protection for login/OTP endpoints.
- Recommended fix:
  - Generate OTP via `crypto.randomInt(100000, 1000000)` (Node crypto).
  - Move rate limiting to centralized storage (Redis/Upstash).
  - Use trusted proxy/IP extraction (platform-provided verified IP), not raw client-supplied forwarding headers.

## Additional note (important, lower confidence)
- `GET /api/certificates/[id]/download` has no auth/ownership check (`download/route.ts:8-25`).
- If certificate IDs leak or are guessable, this endpoint allows direct access to certificate artifacts for any valid ID.
- If public download is intentional, document that explicitly and ensure IDs are high-entropy and aggressively rate-limited.

## Recommended remediation order
1. Fix stored XSS in certificate rendering immediately.
2. Lock down `/api/admin/settings` GET to admin users.
3. Replace OTP RNG and deploy centralized/trusted rate limiting.
