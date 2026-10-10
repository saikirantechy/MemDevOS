# MemDevOS security (draft placeholder)

Status: TODO — full review required before real personal use. Not production-ready.

- Auth required for private data; derive owner from verified session, never trust client `owner_id`.
- RLS enabled on all user tables with owner policies + `memdevos_check_related_owner()` triggers; still needs two-account verification.
- Storage: private bucket only, short-lived signed URLs, paths scoped by `auth.uid()` — bucket + object policies TODO.
- Secrets: `.env.example` lists public keys only. Never bundle service-role or AI provider keys in web/mobile. Real `.env*` files stay out of git.
- Recording: OS permissions + consent attestation required; no bypass, no hidden indicators. Checkbox is attestation, not legal proof.
- AI: scope retrieval to owner's records, cite real segments only, treat transcripts as untrusted data.
- See `README.md` Section 7. Record audits for export/deletion/permission changes without logging private content.
