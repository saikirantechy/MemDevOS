# MemDevOS Security & Privacy Specification

## 1. Threat Model & Design Boundaries

MemDevOS handles sensitive personal conversations, audio recordings, and relationship notes. The system is designed under a zero-trust model regarding client-provided IDs and third-party AI inferences.

### Key Security Guardrails:
1. **No Client Owner Trust**:
   - `owner_id` is always derived on the server from `auth.uid()`.
   - Database triggers enforce that referenced foreign keys (`event_id`, `person_id`, `conversation_id`, `segment_id`, `note_id`) belong to the exact same authenticated owner.
2. **Audio Asset Storage Isolation**:
   - Audio is stored in a private bucket (`conversation-audio`) with path names prefixed by `auth.uid()`.
   - Public access to audio is forbidden; playback requires short-lived signed URLs with a time-to-live of <= 300 seconds.
3. **Recording Consent Attestation**:
   - Capture cannot transition to an active recording state without completing consent checks (`validateRecordingConsent`).
   - The UI presents explicit multi-point attestations (notice, scope, vault isolation) before enabling the capture studio.
4. **Prompt Injection & Untrusted Transcript Defense**:
   - Transcripts are treated strictly as untrusted data passages.
   - When fed into AI retrieval pipelines, transcript content is isolated in data blocks and never interpreted as system directives or executable instructions.
5. **Secrets Hygiene**:
   - Only public client keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_*`) are exposed to client bundles.
   - Service-role keys (`SUPABASE_SERVICE_ROLE_KEY`) and AI/transcription provider API keys must never be committed to git or exposed to web/mobile clients.
6. **Auditability**:
   - Operations that mutate records or export data log immutable records into `public.audit_events`.

## 2. Pre-Production Security Verification Checklist

- [x] Initial schema includes RLS policies on all 11 user tables.
- [x] Cross-tenant foreign key spoofing prevented by `public.memdevos_check_related_owner()`.
- [x] Consent attestation validation unit tests added and passing.
- [ ] Connect live Supabase dev project and execute two-account RLS isolation test script.
- [ ] Provision private `conversation-audio` bucket with storage object policies.
- [ ] Audit secret configuration in production deployment pipelines.
