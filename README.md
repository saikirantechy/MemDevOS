# MemDevOS

### Your Personal AI Memory Operating System

> **Remember every authorized conversation. Organize your knowledge. Retrieve what matters with verifiable evidence.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0-000020.svg)](https://expo.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ecf8e.svg)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest%20(13%20passed)-729b1a.svg)](https://vitest.dev/)

**MemDevOS** is an open personal AI memory operating system engineered to capture, preserve, organize, search, and recall conversations, discussions, and personal knowledge across Web and Mobile.

Instead of discarding original nuance through superficial AI summaries, MemDevOS preserves original audio assets, maintains timestamped verbatim transcripts, links notes to verifiable source segments, and grounds memory recall in exact timestamp citations.

---

## Table of Contents

1. [Project Vision & Philosophy](#1-project-vision--philosophy)
2. [Current Status vs. Roadmap Capabilities](#2-current-status-vs-roadmap-capabilities)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture & Data Flow](#4-system-architecture--data-flow)
5. [Repository Structure](#5-repository-structure)
6. [Installation & Setup](#6-installation--setup)
7. [Environment Variables](#7-environment-variables)
8. [Database Schema & Row Level Security](#8-database-schema--row-level-security)
9. [API Contract & Specifications](#9-api-contract--specifications)
10. [Security, Privacy & Consent](#10-security-privacy--consent)
11. [Testing & Verification](#11-testing--verification)
12. [Two-Developer Collaboration Workflow](#12-two-developer-collaboration-workflow)
13. [Milestone-Based Development Roadmap](#13-milestone-based-development-roadmap)
14. [Deployment & Release Preparation](#14-deployment--release-preparation)

---

## 1. Project Vision & Philosophy

Human memory is prone to forgetting promises, technical decisions, meeting takeaways, and casual agreements. MemDevOS acts as an auxiliary memory layer that bridges what you heard, what was decided, and what you committed to doing.

### Core Principles
1. **Preserve Information First**: Original audio and verbatim transcripts are source truth. AI notes and summaries are derived projections—never replace the source with an unverified summary.
2. **Evidence-Grounded Retrieval**: The AI memory assistant must cite exact conversation timestamps and excerpts. If evidence does not exist in the vault, the assistant explicitly reports insufficient evidence rather than hallucinating facts.
3. **Zero-Trust Privacy & Consent**: Capture is strictly consent-gated. All data belongs to the authenticated user and is isolated at the database boundary via PostgreSQL Row Level Security (RLS).
4. **Multi-Entity Interconnection**: Conversations do not exist in a vacuum; they connect to **People**, **Events**, **Notes**, and **Action Items / Tasks**.

---

## 2. Current Status vs. Roadmap Capabilities

To maintain documentation honesty, this matrix distinguishes verified, working features from simulated/mocked features and planned roadmap items.

| Capability | Status | Implementation Details |
| :--- | :--- | :--- |
| **Monorepo Foundation** | `VERIFIED IN DEVELOPMENT` | `pnpm` workspaces (`apps/web`, `apps/mobile`, `packages/shared`). Clean type-checking across all packages. |
| **Grounded Retrieval Engine** | `VERIFIED IN DEVELOPMENT` | Shared `answerMemoryQuestion` with term scoring, citation extraction, and insufficient evidence guard. |
| **Universal Multi-Entity Search** | `VERIFIED IN DEVELOPMENT` | Shared `searchMemories` across conversations, segments, notes, people, and events. |
| **Consent Validation Gate** | `VERIFIED IN DEVELOPMENT` | Shared `validateRecordingConsent` enforcing notice and scope before recording transitions. |
| **Automated Test Suite** | `VERIFIED IN DEVELOPMENT` | Vitest suite (`packages/shared/src/__tests__/memory-engine.test.ts`) with 13/13 passing unit tests. |
| **Web Dashboard & Navigation** | `VERIFIED IN DEVELOPMENT` | Next.js 15 App Router, dark obsidian UI, metrics, recent memory feed, quick search modal. |
| **Interactive Audio Player** | `VERIFIED IN DEVELOPMENT` (Simulated Stream) | Scrubber bar, playback speed selector (1x-2x), waveform animation, and click-to-seek segment sync. |
| **Capture Studio** | `VERIFIED IN DEVELOPMENT` (Simulated Mic) | Real-time visualizer animation, timer, 3-point consent checklist, participant tagging, and library saving. |
| **AI Memory Chat** | `VERIFIED IN DEVELOPMENT` | Grounded question-answering with citation cards and 1-click jump links to audio segments. |
| **Notes & Docs Workspace** | `VERIFIED IN DEVELOPMENT` | Markdown note reader and editor with live verbatim transcript quote backlinks. |
| **Tasks & Calendar Hub** | `VERIFIED IN DEVELOPMENT` | Extracted action items with checkbox completion toggling and upcoming event timeline. |
| **People & Events Workspaces** | `VERIFIED IN DEVELOPMENT` | Profiles with identity confirmation toggles and associated conversation trees. |
| **PostgreSQL Schema & RLS** | `IMPLEMENTED — NOT VERIFIED ON CLOUD` | 11 tables in `0001_initial_schema.sql` with RLS policies and `memdevos_check_related_owner()` trigger. |
| **Supabase Cloud Persistence** | `PLANNED (Milestone 2)` | Client state is currently reactive in-memory; live Supabase SDK synchronization is planned next. |
| **Hardware Microphone Capture** | `PLANNED (Milestone 4)` | Web MediaRecorder / Expo Audio capture and binary upload to private storage bucket. |
| **Serverless Transcription Worker** | `PLANNED (Milestone 5)` | Asynchronous Whisper STT background processing queue. |
| **Physical Mobile Device Run** | `PLANNED (Milestone 3)` | Expo mobile scaffold compiles via TypeScript; physical iOS/Android device checks pending. |

---

## 3. Technology Stack

### Monorepo & Tooling
- **Package Manager**: [pnpm 9.15.0](https://pnpm.io/)
- **Node.js**: Node 20+ (Verified on Node v24.20.0)
- **Language**: TypeScript 5.7+ / 5.9.3
- **Test Runner**: [Vitest 5.0.3](https://vitest.dev/)

### Web Application (`apps/web`)
- **Framework**: [Next.js 15.5.27](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.0.0](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom dark obsidian design tokens, glassmorphism, and keyframe animations

### Mobile Application (`apps/mobile`)
- **Framework**: [Expo 52.0.0](https://expo.dev/) (SDK 52)
- **Runtime**: [React Native 0.76.5](https://reactnative.dev/)
- **Routing**: [Expo Router 4.0.0](https://docs.expo.dev/router/introduction/)

### Shared Library (`packages/shared`)
- Pure TypeScript contracts and domain models
- Evidence-grounded retrieval and ranking logic
- Universal search indexer
- Design system tokens ([theme.ts](file:///c:/Dev%20Projects/MemDevOS/packages/shared/src/theme.ts))

### Backend & Storage (`supabase`)
- **Database**: PostgreSQL 15+ (Supabase)
- **Security**: Row Level Security (RLS) on all tables
- **Integrity**: PL/pgSQL same-owner foreign key verification triggers
- **Storage Target**: Private Supabase Storage bucket (`conversation-audio`) with signed download URLs (<= 300s TTL)

---

## 4. System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Capture Studio                        │
│             (Notice & Scope Consent Check Gate)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 ┌──────────────────────┐              ┌──────────────────────┐
 │     Audio Asset      │              │ Transcript Segments  │
 │  (Private S3 Bucket  │              │ (Timestamped, exact  │
 │   Signed URL <= 300s)│              │  speaker attribution)│
 └──────────┬───────────┘              └──────────┬───────────┘
            │                                     │
            │          ┌──────────────────────────┴───────────────┐
            │          ▼                                          ▼
            │ ┌───────────────────┐                    ┌──────────────────────┐
            │ │Source-Linked Notes│                    │   Evidence-Grounded  │
            │ │ (Verbatim quotes) │                    │   Retrieval Engine   │
            │ └───────────────────┘                    └──────────┬───────────┘
            │                                                     │
            ▼                                                     ▼
 ┌──────────────────────┐                              ┌──────────────────────┐
 │  Interactive Player  │◄─────────────────────────────┤ AI Memory Assistant  │
 │  (Waveform + Seek)   │   Jump to Timestamp (ms)     │(Verifiable Citations)│
 └──────────────────────┘                              └──────────────────────┘
```

---

## 5. Repository Structure

```
MemDevOS/
├── apps/
│   ├── web/                     # Next.js 15 Web Application
│   │   ├── app/
│   │   │   ├── globals.css      # Dark theme, glassmorphism, waveform animations
│   │   │   ├── layout.tsx       # Root layout & font definition
│   │   │   └── page.tsx         # Comprehensive interactive memory workspace
│   │   ├── next.config.ts       # Next.js config (transpiles @memdevos/shared)
│   │   └── package.json
│   └── mobile/                  # Expo / React Native Mobile Application
│       ├── app/
│       │   ├── _layout.tsx      # Mobile stack navigation & dark status bar
│       │   └── index.tsx        # Mobile capture & memory browsing screen
│       ├── app.json             # Expo configuration (slug: memdevos)
│       └── package.json
├── packages/
│   └── shared/                  # Monorepo Core Shared Package
│       ├── src/
│       │   ├── __tests__/       # Vitest test suite
│       │   │   └── memory-engine.test.ts
│       │   ├── index.ts         # Shared TypeScript interfaces & exports
│       │   ├── memory-engine.ts # Retrieval algorithms, search & consent logic
│       │   ├── mock-data.ts     # Realistic multi-conversation seed dataset
│       │   └── theme.ts         # Visual tokens (colors, spacing, radius)
│       └── package.json
├── supabase/
│   ├── migrations/
│   │   └── 0001_initial_schema.sql  # 11 PostgreSQL tables, RLS policies & triggers
│   └── seed.sql                 # Local development test seed template
├── docs/
│   ├── decisions/               # Architecture Decision Records (ADRs)
│   │   └── 0001-frontend-memory-engine-and-testing.md
│   ├── api-contract.md          # REST API endpoint specifications
│   ├── architecture.md          # System architecture & data flow specification
│   ├── implementation-status.md # Current verified implementation status log
│   └── security.md              # Threat model & zero-trust security checklist
├── .env.example                 # Public vs secret environment variable template
├── .gitignore                   # Ignores build artifacts, secrets, and caches
├── package.json                 # Monorepo root scripts & dev dependencies
├── pnpm-workspace.yaml          # pnpm workspace configuration
└── README.md                    # Project master documentation & roadmap
```

---

## 6. Installation & Setup

### Prerequisites
- **Node.js**: `v20.0.0` or later (`v24.20.0` tested)
- **Package Manager**: [pnpm](https://pnpm.io/) (`v9.15.0` or later)
- **Git**: Configured for your machine

### 1. Clone the Repository
```bash
git clone https://github.com/saikirantechy/MemDevOS.git
cd MemDevOS
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Verify System Health
Run the automated test suite and TypeScript type checks across all workspaces:
```bash
# Run unit tests
pnpm test

# Run TypeScript type check across web, mobile, and shared packages
pnpm typecheck
```

### 4. Start the Web Workspace
```bash
pnpm dev:web
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Start the Mobile Workspace
```bash
pnpm dev:mobile
```
Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with the Expo Go app.

---

## 7. Environment Variables

Create `.env.local` inside `apps/web/` and `apps/mobile/` based on [.env.example](file:///c:/Dev%20Projects/MemDevOS/.env.example).

```ini
# Web (Public client values only; safe for browser exposure)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Mobile (Public client values only; safe for app bundle exposure)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Server-Only Secrets (DEPLOYMENT ENVIRONMENT ONLY - NEVER IN CLIENT CODE)
# SUPABASE_SERVICE_ROLE_KEY=ey...
# TRANSCRIPTION_API_KEY=sk-...
# AI_PROVIDER_API_KEY=sk-...
```

> [!CAUTION]
> **Never commit `.env` or `.env.local` files to Git.** Service-role keys or AI provider API keys must never be imported into web or mobile client-side code.

---

## 8. Database Schema & Row Level Security

The complete relational schema is defined in [supabase/migrations/0001_initial_schema.sql](file:///c:/Dev%20Projects/MemDevOS/supabase/migrations/0001_initial_schema.sql).

### Core Tables
1. **`events`**: Event workspaces, summits, and meetings (`starts_at`, `ends_at`, `venue`, `timezone`).
2. **`people`**: Contacts, participants, roles, and identity confirmation status.
3. **`conversations`**: Core conversation records with duration, processing status, and consent status.
4. **`conversation_people`**: Many-to-many relationship linking participants to conversations.
5. **`audio_assets`**: Storage paths, checksums (SHA256), byte sizes, and duration.
6. **`consent_records`**: Audit records of user attestation or recorded permission.
7. **`transcript_segments`**: Timestamped text chunks (`start_ms`, `end_ms`, `speaker_label`, `confidence`, `needs_review`).
8. **`notes`**: User-authored and AI-generated notes with revision versioning.
9. **`note_sources`**: Many-to-many backlinks binding notes to specific transcript segments.
10. **`processing_jobs`**: Job tracking (`queued`, `running`, `completed`, `failed`) for async transcription/indexing.
11. **`audit_events`**: Immutable security logs for exports, permission changes, and deletions.

### Row Level Security (RLS)
All 11 user tables enable RLS. Each table uses an owner policy:
```sql
create policy <table_name>_owner_all on public.<table_name>
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
```

### Cross-Owner Relational Integrity
To prevent cross-tenant data manipulation (e.g. associating your conversation with another user's private person record), the `public.memdevos_check_related_owner()` trigger executes `BEFORE INSERT OR UPDATE` across all relational tables, rejecting any foreign key whose owner mismatches the authenticated user.

---

## 9. API Contract & Specifications

The design contract for the backend service endpoints is documented in [docs/api-contract.md](file:///c:/Dev%20Projects/MemDevOS/docs/api-contract.md).

### Core Endpoints

#### `POST /v1/conversations`
Creates a new conversation container prior to capture:
```json
{
  "title": "Agent Evaluation Deep Dive",
  "occurredAt": "2026-10-10T10:24:00+05:30",
  "eventId": "event-uuid-or-null",
  "consentStatus": "checks_completed",
  "consentScope": "technical interview capture"
}
```

#### `POST /v1/conversations/:id/audio`
Requests a short-lived signed upload target for raw audio. The server checks user ownership before generating the signed storage URL:
```json
{
  "uploadUrl": "https://...",
  "assetId": "asset-uuid",
  "expiresAt": "2026-10-10T10:30:00Z"
}
```

#### `POST /v1/ai/chat`
Evidence-grounded question answering:
```json
// Request
{
  "question": "What did Alex say about flaky evaluations?"
}

// Response
{
  "answer": "Alex Morgan noted that they are working on repeatable evaluations and reducing flaky results by snapshotting initial state.",
  "citations": [
    {
      "conversationId": "conversation-demo-alex",
      "segmentId": "segment-demo-4",
      "title": "AI agents for software testing",
      "startMs": 49000,
      "excerpt": "We're working on repeatable evaluations and reducing flaky results by snapshotting initial state."
    }
  ],
  "insufficientEvidence": false
}
```

---

## 10. Security, Privacy & Consent

1. **Server-Derived Ownership**: The server never trusts client-supplied `owner_id` parameters; it extracts the user ID directly from the validated Supabase JWT session (`auth.uid()`).
2. **Audio Vault Isolation**: Audio recordings are private by default. They are accessed only via pre-signed URLs with a time-to-live of <= 300 seconds.
3. **Consent Enforcement**: The UI requires positive user attestation before recording can begin. The shared function `validateRecordingConsent` validates that checks are completed.
4. **Prompt Injection Defense**: Transcripts are treated strictly as untrusted user content and isolated in structured data blocks during retrieval.
5. **No Hallucination Mandate**: The retrieval engine prioritizes truth over completeness. When evidence is ambiguous or missing, the system explicitly returns `insufficientEvidence: true`.

---

## 11. Testing & Verification

The project enforces automated test verification and type safety before code can be merged.

### Available Verification Commands
```bash
# Run Vitest test suite
pnpm test

# Run TypeScript checks across all monorepo packages
pnpm typecheck

# Run Next.js production build verification
pnpm build:web
```

### Test Suite Structure
Unit tests reside in [packages/shared/src/__tests__/](file:///c:/Dev%20Projects/MemDevOS/packages/shared/src/__tests__/). Test cases must cover:
- Universal search match precision and ranking
- Grounded citation attribution and start timestamps
- Insufficient-evidence handling for out-of-domain queries
- Consent validation state transitions

---

## 12. Two-Developer Collaboration Workflow

This project is structured for two engineers collaborating concurrently from separate machines using Git branches and pull requests.

```
                    ┌─────────────────────────┐
                    │       origin/main       │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌───────────────────────┐                   ┌───────────────────────┐
│   Developer A (Web)   │                   │ Developer B (Backend) │
│  feature/web-player   │                   │ feature/backend-crud  │
└───────────────────────┘                   └───────────────────────┘
```

### Suggested Ownership Split

#### Developer A — Web Experience & Interactive Features
- **Primary Focus**: `apps/web/`
- **Responsibilities**:
  - UI components, dark obsidian styling, micro-animations, responsive layout
  - Audio playback synchronization and waveform visualization
  - Capture Studio UX and recording controls
  - AI chat interface, citation presentation cards, and jump navigation
  - Notes editor and Task management screens

#### Developer B — Backend, Persistence & Mobile Foundation
- **Primary Focus**: `supabase/`, `apps/mobile/`, `packages/shared/`
- **Responsibilities**:
  - Supabase client integration, authentication state, and session management
  - Database migrations, RLS testing with multiple accounts
  - Audio upload handling and storage bucket policies
  - Mobile Expo screens, native audio recording permissions, and platform tests
  - Shared domain interfaces and retrieval algorithm optimization

### Collaborative Branching Rules
1. **Never commit directly to `main`**. All work begins on a feature branch:
   - Developer A: `feature/web-<feature-name>`
   - Developer B: `feature/backend-<feature-name>` or `feature/mobile-<feature-name>`
2. **Branch from fresh `main`**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/web-audio-scrubber
   ```
3. **Contract Changes Require Mutual Agreement**: Changes to [packages/shared/src/index.ts](file:///c:/Dev%20Projects/MemDevOS/packages/shared/src/index.ts) or [docs/api-contract.md](file:///c:/Dev%20Projects/MemDevOS/docs/api-contract.md) must be reviewed by both developers.
4. **Pre-PR Verification Checklist**:
   Before opening a pull request, verify locally:
   ```bash
   pnpm test
   pnpm typecheck
   pnpm build:web
   ```
5. **Pull Request Protocol**:
   - Every PR requires review from the other developer.
   - Squash-and-merge or rebase when merging to maintain a clean git history.

---

## 13. Milestone-Based Development Roadmap

MemDevOS is built incrementally through verified milestones. Do not claim a milestone is complete until automated checks and local verifications have passed.

### Completed Milestones

- [x] **Milestone 0: Repository Foundation**
  - Normalized official **MemDevOS** branding across all apps and packages.
  - Configured pnpm workspaces (`apps/web`, `apps/mobile`, `packages/shared`).
  - Added shared design tokens and domain TypeScript models.
  - Configured Vitest test runner with passing baseline tests.
- [x] **Milestone 1: Functional Web Foundation**
  - Built dark obsidian application shell with responsive sidebar.
  - Implemented interactive audio player simulation with scrub slider and playback speed selector.
  - Built consent-gated Capture Studio with animated frequency visualizer and timer.
  - Implemented evidence-grounded AI Memory Chat with verified citation cards.
  - Built Notes viewer/editor with transcript quote backlinks.
  - Built Tasks & Calendar hub with action item completion toggles.
  - Built Universal Search modal indexing all 5 entity types.

### Upcoming Milestones

- [ ] **Milestone 2: Authentication & Database Persistence** *(Next Priority)*
  - Link Supabase development project.
  - Initialize `@supabase/supabase-js` client in web and mobile.
  - Implement Supabase Auth (email/magic link login).
  - Connect web lists and forms to real database CRUD.
  - Verify RLS boundaries using two distinct test accounts to guarantee cross-user isolation.
- [ ] **Milestone 3: Mobile Application Foundation**
  - Wire mobile navigation to shared domain contracts.
  - Connect Supabase Auth to Expo application.
  - Implement mobile conversation browsing and detail view.
  - Test Expo Audio capture permissions on physical iOS and Android test devices.
- [ ] **Milestone 4: Audio Pipeline & Storage**
  - Provision private `conversation-audio` Supabase Storage bucket.
  - Configure storage object policies (`auth.uid()` path scoping).
  - Implement signed upload URL generation and client upload tracking.
  - Add retryable upload queue for handling network interruptions.
- [ ] **Milestone 5: Transcription & Automated Notes**
  - Integrate speech-to-text service (Whisper / whisper.cpp).
  - Build processing worker consuming `processing_jobs` table.
  - Persist timestamped transcript segments with confidence scores.
  - Generate source-linked notes citing exact transcript segment IDs.
- [ ] **Milestone 6: Search & AI Retrieval Hardening**
  - Implement hybrid full-text search (Postgres `tsvector`) and semantic embeddings (`pgvector`).
  - Implement strict prompt injection guards for untrusted transcript passages.
  - Benchmark retrieval accuracy against real test conversation sets.
- [ ] **Milestone 7: People & Event Intelligence**
  - Implement automatic entity recognition (associating people mentioned with conversations).
  - Cross-conversation query synthesis (e.g., "What has Maya mentioned across all summit sessions?").
- [ ] **Milestone 8: Productivity & Calendar Sync**
  - Automated action item extraction from transcripts.
  - External calendar synchronization (Google Calendar / Apple Calendar read-only sync).
  - Daily summary briefings and scheduled reminder notifications.
- [ ] **Milestone 9: Hardening, Security Audit & Release**
  - Full third-party security and RLS penetration review.
  - Data export and GDPR/CCPA deletion verification (verifying cascade deletion of audio and transcripts).
  - Production deployment to Vercel (Web) and EAS (Mobile).

---

## 14. Deployment & Release Preparation

### Web Deployment (Vercel)
1. Link repository to Vercel.
2. Set Framework Preset to **Next.js**.
3. Set Root Directory to `apps/web`.
4. Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5. Ensure build command is `pnpm --filter @memdevos/web build`.

### Mobile Deployment (Expo Application Services - EAS)
1. Install EAS CLI: `npm install -g eas-cli`.
2. Log in with `eas login`.
3. Configure `eas.json` inside `apps/mobile`.
4. Run preview build:
   ```bash
   eas build --profile preview --platform all
   ```

---

## License & Project Link

- **Official Project**: [MemDevOS on GitHub](https://github.com/saikirantechy/MemDevOS)
- **License**: Private / Proprietary (Personal Open Memory Architecture)
