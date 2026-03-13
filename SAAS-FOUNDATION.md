# Aeternum SaaS foundation map

This document maps **SAAS-ROADMAP.md** items to implementation status and file locations. Use it to refine and implement features incrementally.

---

## 1. User identity layer

| Status   | Notes |
|----------|--------|
| **Done** | Wallet + email (Supabase magic link). Profiles: `profiles` table, wallet linking on Account. |

**Files:** `supabase/schema.sql` (profiles), `lib/supabase*.ts`, `components/auth/SupabaseAuthProvider.tsx`, `app/login/page.tsx`, `app/auth/callback/`, `hooks/useUserProfile.ts`.

**Todo (refine):** OAuth providers, subscription_tier / API keys in profile or separate tables.

---

## 2. User-specific dashboards

| Status   | Notes |
|----------|--------|
| **Done** | Vault at `/vault`; proofs and evidence scoped by `user_id` / owner. Evidence list + metadata. |

**Files:** `app/vault/page.tsx`, `components/vault/EvidenceList.tsx`, `hooks/useSupabaseProofs.ts`, `hooks/useEvidenceMetadata.ts`, `app/api/proofs/route.ts`, `app/api/evidence/route.ts`.

**Todo (refine):** Search, filtering, tagging, folders (schema/UI).

---

## 3. Organization and team support

| Status   | Notes |
|----------|--------|
| **Scaffold** | Schema: `organizations`, `memberships` with roles. Placeholder UI. |

**Files:** `supabase/schema.sql` (organizations, memberships), `app/team/page.tsx`, `lib/rbac/roles.ts`.

**Todo:** Full RBAC at API + UI; shared evidence vaults; enforce roles on evidence/proofs.

---

## 4. Shareable verification links

| Status   | Notes |
|----------|--------|
| **Scaffold** | Public page: verification status, timestamp, commitment hash, certificate download. No file content. |

**Files:** `app/evidence/[proofId]/page.tsx`, `app/api/proofs/[id]/route.ts` (GET single proof by UUID).

**Todo:** Optional slug/alias; analytics; expiry if ever needed.

---

## 5. Public verification portal

| Status   | Notes |
|----------|--------|
| **Scaffold** | Dedicated page: verify by proof ID, file upload, or commitment hash. |

**Files:** `app/verify/page.tsx` (form + redirect to `/evidence/[proofId]` or show result).

**Todo:** Recompute hash from file; verify against chain; rate limiting.

---

## 6. Evidence metadata

| Status   | Notes |
|----------|--------|
| **Done** | Title, description, case_id, tags, notes. Stored and editable in EvidenceCard. |

**Files:** `app/api/evidence/route.ts`, `hooks/useEvidenceMetadata.ts`, `components/vault/EvidenceList.tsx`, `supabase/schema.sql` (evidence).

**Todo (refine):** Searchable/filterable in dashboard; tags UI.

---

## 7. Evidence timeline (chain-of-custody)

| Status   | Notes |
|----------|--------|
| **Done** | Events table; created/verified/certificate_downloaded; Activity list in EvidenceCard. |

**Files:** `app/api/events/route.ts`, `hooks/useEvidenceEvents.ts`, `supabase/schema.sql` (events).

**Todo (refine):** More event types; export timeline.

---

## 8. Certificate system improvements

| Status   | Notes |
|----------|--------|
| **Partial** | Client-side PDF (jsPDF); proof ID, file hash, timestamp, storage. |

**Files:** `utils/vault/certificatePdf.ts`, EvidenceList certificate button.

**Todo:** Verification URL in certificate; JSON export; legal-friendly wording; server-side PDF if needed.

---

## 9. Developer API platform

| Status   | Notes |
|----------|--------|
| **Scaffold** | API key table; optional auth helper; v1 route stubs (evidence, proofs, verify, certificate). |

**Files:** `supabase/schema.sql` (api_keys), `lib/api/withApiKey.ts`, `app/api/v1/` routes, `app/settings/page.tsx` (API keys section).

**Todo:** Full endpoints; rate limiting; usage tracking.

---

## 10. SaaS billing system

| Status   | Notes |
|----------|--------|
| **Scaffold** | Plans config (Free/Pro/Business/Enterprise); subscriptions table; Stripe placeholder; Settings link. |

**Files:** `lib/billing/plans.ts`, `supabase/schema.sql` (subscriptions), `app/settings/page.tsx` (Billing section), env: `STRIPE_*`.

**Todo:** Stripe integration; enforce limits (proofs, storage, API, team members).

---

## 11. Database layer

| Status   | Notes |
|----------|--------|
| **Done + extended** | PostgreSQL (Supabase): proofs, evidence, events, profiles. **Scaffold:** organizations, memberships, api_keys, subscriptions. |

**Files:** `supabase/schema.sql`.

**Todo:** Certificates table if storing issued certs; RLS for org/memberships; migrations for existing deploys.

---

## 12. Security hardening

| Status   | Notes |
|----------|--------|
| **Partial** | Server-only secrets (Pinata, Supabase service role); upload size limits; events API no longer trusts client userId. |

**Todo:** Input validation on all API routes; rate limiting (e.g. Vercel/Upstash); encryption key handling audit.

---

## 13. Infrastructure and deployment

| Status   | Notes |
|----------|--------|
| **Partial** | Vercel; env-based config. |

**Todo:** Env checklist in docs; Docker optional; CI/CD (e.g. GitHub Actions).

---

## 14. Observability

| Status   | Notes |
|----------|--------|
| **Scaffold** | Structured logger; placeholder for error tracking and metrics. |

**Files:** `lib/logger.ts`, optional `lib/observability.ts`.

**Todo:** Integrate Sentry/Vercel Analytics; API usage metrics; dashboards.

---

## Quick reference: new scaffold files

- `app/evidence/[proofId]/page.tsx` — shareable verification page
- `app/api/proofs/[id]/route.ts` — GET single proof by UUID
- `app/verify/page.tsx` — public verification portal
- `app/settings/page.tsx` — Account, API keys, Billing
- `app/team/page.tsx` — organizations/teams placeholder
- `lib/billing/plans.ts` — plan definitions and limits
- `lib/rbac/roles.ts` — role constants (Owner, Admin, Contributor, Viewer)
- `lib/api/withApiKey.ts` — API key auth helper for v1 routes
- `app/api/v1/*` — developer API stubs
- `lib/logger.ts` — structured logging

Refine each area in follow-up iterations without rewriting the core evidence engine.
