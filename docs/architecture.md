# MemDevOS System Architecture

## 1. System Topology

MemDevOS is structured as a TypeScript monorepo using pnpm workspaces:

```
memdevos/
├── apps/
│   ├── web/        # Next.js 15 (App Router), React 19, Tailwind CSS v4
│   └── mobile/     # Expo 52, React Native 0.76.5, Expo Router v4
├── packages/
│   └── shared/     # Domain types, memory retrieval engine, theme tokens, mock data
├── supabase/
│   └── migrations/ # Postgres DDL, Row Level Security, same-owner triggers
└── docs/           # Specifications, API contracts, security reviews, ADRs
```

## 2. Core Architectural Principles

1. **Information Preservation over AI Editing**:
   Original captured audio assets and verbatim transcript segments are preserved intact. AI summaries and synthesized notes are treated as secondary, derivative projections that cite verbatim source segments.

2. **Zero Fabrication & Strict Grounding**:
   The memory assistant (`answerMemoryQuestion`) answers questions strictly from authorized stored segments. If no evidence exists in the vault, the engine returns `insufficientEvidence: true` rather than inventing speculative answers.

3. **Multi-Entity Universal Retrieval**:
   The hybrid search engine indexes conversations, timestamped transcript passages, notes, people records, and event workspaces, enabling instant jumping between high-level summaries and exact audio timestamps.

4. **Defense-in-Depth Authorization Boundary**:
   All database tables enforce Row Level Security (`owner_id = auth.uid()`). A database trigger (`public.memdevos_check_related_owner()`) prevents cross-user relational manipulation by verifying that foreign keys (such as `event_id`, `person_id`, and `conversation_id`) belong to the exact same authenticated user.

## 3. Data Flow

```
[Capture Studio]
       │
       ▼ (Consent Attestation Gate)
[Audio Capture & Metadata] ──────────► [Audio Vault (Private Storage)]
       │                                        │
       ▼                                        ▼ (Signed URL, <= 300s)
[Transcript Segments] ───────────────► [Interactive Player & Waveform]
       │
       ├───────────────────────────────┐
       ▼                               ▼
[Source-Linked Notes]        [Evidence Grounding Engine]
                                       │
                                       ▼ (With Citations & Timestamps)
                             [AI Memory Chat Assistant]
```

## 4. Platform Contracts

- **Shared (`@memdevos/shared`)**: Pure TypeScript library containing contracts, theme tokens, universal search, citation algorithms, and consent validation. Contains no browser- or mobile-specific binary code.
- **Web (`@memdevos/web`)**: Next.js 15 application providing the full desktop and responsive tablet workspace.
- **Mobile (`@memdevos/mobile`)**: Expo-managed React Native app optimized for on-the-go capture, audio consent verification, and lightweight memory lookup.
