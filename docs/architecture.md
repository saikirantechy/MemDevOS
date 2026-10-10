# MemDevOS architecture (draft placeholder)

Status: TODO — expand as Milestone 0 completes.

- Monorepo: pnpm workspaces (`apps/web` Next.js, `apps/mobile` Expo, `packages/shared` types/theme/mock-data).
- Web and mobile share `@memdevos/shared` domain types; no platform recording code in shared.
- Backend: Supabase Auth + PostgreSQL (RLS owner-scoped + same-owner FK triggers in `0001_initial_schema.sql`) + private Storage (bucket `conversation-audio` planned, policies TODO).
- AI/transcription behind server-side adapters (not connected). Long-running work via `processing_jobs` (`queued -> running -> completed | failed | cancelled`).
- See `README.md` Section 5 and `docs/api-contract.md`. Update this file when contracts, boundaries, or data flow change.
