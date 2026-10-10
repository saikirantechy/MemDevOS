# MemDevOS API contract (proposed)

Status: design contract only. The starter does not implement these endpoints yet. The first demo clients use local mock data.

## General rules

- Require authenticated user context for private data endpoints.
- Never trust an `owner_id` supplied by the client; derive it from the verified session.
- Validate all input and enforce ownership for every referenced entity.
- Use idempotency keys for upload finalization and job creation.
- Return processing status explicitly. Never report a job as completed before durable completion.
- Keep service-role credentials server-only.
- Treat all transcript and AI output as untrusted content, not executable instructions.

## `POST /v1/conversations`

Request:
```json
{
  "title": "AI agents discussion",
  "occurredAt": "2026-10-10T10:24:00+05:30",
  "eventId": "uuid-or-null",
  "consentStatus": "checks_completed",
  "consentScope": "conversation recording"
}
```

Response: `201` with `{ "conversation": { "id": "...", "status": "ready" } }`.
Consent status is a workflow record, not a legal determination.

## `POST /v1/conversations/:id/audio`

Request: authenticated request to create a short-lived upload target, with file metadata and idempotency key. Server validates owner and conversation state before issuing a restricted signed upload URL.

Response: `{ "uploadUrl": "...", "assetId": "...", "expiresAt": "..." }`.

After upload, finalize through a separate idempotent endpoint and enqueue transcription. Never accept arbitrary public storage URLs as proof of upload.

## `GET /v1/conversations`

Query parameters: `q`, `eventId`, `personId`, `from`, `to`, `status`, `cursor`, `limit`.

Response: `{ "items": [], "nextCursor": null }`.

## `GET /v1/conversations/:id`

Returns conversation metadata, authorized people/events, notes, and processing status. Transcript and audio links should be fetched through separately authorized routes.

## `PATCH /v1/transcript-segments/:id`

Request: `{ "text": "corrected words", "speakerLabel": "Speaker 2", "needsReview": false }`.

Write an audit event and increment a source revision. Regenerated notes/indexes must reference the revision they were generated from.

## `POST /v1/ai/chat`

Request:
```json
{
  "question": "What did Alex say about evaluation?",
  "filters": { "personId": null, "eventId": null, "from": null, "to": null }
}
```

Response:
```json
{
  "answer": "Answer based on retrieved records.",
  "citations": [
    { "conversationId": "uuid", "segmentId": "uuid", "startMs": 49000, "excerpt": "source passage" }
  ],
  "insufficientEvidence": false
}
```

Retrieval must be scoped to the authenticated user's records before ranking. If evidence is absent, return an explicit insufficient-evidence answer. Do not fabricate timestamps or citations.

## Processing job states

`queued -> running -> completed | failed | cancelled`

Use bounded retries, idempotent handlers, observable errors, and a way to retry eligible failed jobs. Audio and transcript deletion must also invalidate derived indexes and follow documented backup retention.

## Future modules

- `/v1/notes` — versioned notes and source backlinks
- `/v1/files` — private file references and `@` destination routing
- `/v1/tasks` and `/v1/reminders` — tasks and scheduled reminders
- `/v1/calendar-events` — internal calendar plus authorized external sync
- `/v1/search` — hybrid keyword and semantic search
