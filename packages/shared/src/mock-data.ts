import type {
  ConversationRecord,
  ConversationNote,
  EventRecord,
  PersonRecord,
  TranscriptSegment,
  MemoryAnswer,
  TaskRecord,
  CalendarRecord
} from "./index";

export const demoEvents: EventRecord[] = [
  {
    id: "event-demo-001",
    name: "AI Builders Summit",
    venue: "Bengaluru Tech Hub & Hybrid",
    startsAt: "2026-10-10T09:00:00+05:30",
    endsAt: "2026-10-10T18:00:00+05:30",
    timezone: "Asia/Kolkata",
    notes: "Fictional flagship summit on local memory, autonomous agents, and privacy."
  },
  {
    id: "event-demo-002",
    name: "Local Architecture & Security Sync",
    venue: "Room 4B / Studio",
    startsAt: "2026-10-12T14:30:00+05:30",
    endsAt: "2026-10-12T15:30:00+05:30",
    timezone: "Asia/Kolkata",
    notes: "Internal technical design sync on two-account RLS policy tests."
  }
];

export const demoEvent = demoEvents[0];

export const demoPeople: PersonRecord[] = [
  {
    id: "person-demo-alex",
    displayName: "Alex Morgan",
    company: "Synthetix AI",
    role: "Lead QA & Evaluation Architect",
    identityConfirmed: true,
    notes: "Expert in agentic evaluations and self-healing test automation."
  },
  {
    id: "person-demo-maya",
    displayName: "Maya Chen",
    company: "OpenBench Systems",
    role: "Founding ML Engineer",
    identityConfirmed: false,
    notes: "Building reproducible benchmark harnesses across multi-modal LLMs."
  },
  {
    id: "person-demo-elena",
    displayName: "Dr. Elena Rostova",
    company: "Crypton Security Lab",
    role: "Principal Cryptographer",
    identityConfirmed: true,
    notes: "Specializes in client-side encryption and Postgres Row Level Security."
  }
];

export const demoConversations: ConversationRecord[] = [
  {
    id: "conversation-demo-alex",
    title: "AI agents for software testing",
    eventId: demoEvent.id,
    personIds: ["person-demo-alex"],
    occurredAt: "2026-10-10T10:24:00+05:30",
    durationMs: 78000,
    status: "completed",
    consentStatus: "checks_completed",
    summary: "Discussed AI agents that adapt to dynamic UI mutations and solving flaky evaluations via deterministic seeding.",
    isDemo: true
  },
  {
    id: "conversation-demo-maya",
    title: "Open-source evaluation tools",
    eventId: demoEvent.id,
    personIds: ["person-demo-maya"],
    occurredAt: "2026-10-10T11:05:00+05:30",
    durationMs: 54000,
    status: "completed",
    consentStatus: "checks_completed",
    summary: "Examined benchmark drift across model versions and open-source evaluation metrics for retrieval pipelines.",
    isDemo: true
  },
  {
    id: "conversation-demo-elena",
    title: "Postgres RLS and Owner Isolation",
    eventId: "event-demo-002",
    personIds: ["person-demo-elena"],
    occurredAt: "2026-10-10T12:15:00+05:30",
    durationMs: 92000,
    status: "completed",
    consentStatus: "checks_completed",
    summary: "Reviewed same-owner foreign key triggers and zero-trust multi-tenant isolation patterns for personal audio vaults.",
    isDemo: true
  }
];

export const demoSegments: TranscriptSegment[] = [
  // Alex conversation
  {
    id: "segment-demo-1",
    conversationId: "conversation-demo-alex",
    startMs: 12000,
    endMs: 18000,
    text: "What are you working on at the moment?",
    speakerLabel: "You",
    needsReview: false
  },
  {
    id: "segment-demo-2",
    conversationId: "conversation-demo-alex",
    startMs: 18000,
    endMs: 42000,
    text: "We're experimenting with AI agents that can run software tests and adapt when the interface changes.",
    speakerLabel: "Alex Morgan",
    personId: "person-demo-alex",
    confidence: 0.96,
    needsReview: false
  },
  {
    id: "segment-demo-3",
    conversationId: "conversation-demo-alex",
    startMs: 42000,
    endMs: 49000,
    text: "How are you evaluating whether the agent is reliable?",
    speakerLabel: "You",
    needsReview: false
  },
  {
    id: "segment-demo-4",
    conversationId: "conversation-demo-alex",
    startMs: 49000,
    endMs: 65000,
    text: "We're working on repeatable evaluations and reducing flaky results by snapshotting initial state.",
    speakerLabel: "Alex Morgan",
    personId: "person-demo-alex",
    confidence: 0.94,
    needsReview: false
  },
  {
    id: "segment-demo-5",
    conversationId: "conversation-demo-alex",
    startMs: 65000,
    endMs: 78000,
    text: "Let's benchmark the whisper transcription latency together by next Tuesday.",
    speakerLabel: "Alex Morgan",
    personId: "person-demo-alex",
    confidence: 0.91,
    needsReview: false
  },
  // Maya conversation
  {
    id: "segment-demo-6",
    conversationId: "conversation-demo-maya",
    startMs: 8000,
    endMs: 22000,
    text: "Open-source evaluation frameworks are finally catching up with commercial suites for rag retrieval.",
    speakerLabel: "Maya Chen",
    personId: "person-demo-maya",
    confidence: 0.92,
    needsReview: false
  },
  {
    id: "segment-demo-7",
    conversationId: "conversation-demo-maya",
    startMs: 22000,
    endMs: 38000,
    text: "The main challenge is model drift between minor releases when prompts are held constant.",
    speakerLabel: "Maya Chen",
    personId: "person-demo-maya",
    confidence: 0.88,
    needsReview: true
  },
  {
    id: "segment-demo-8",
    conversationId: "conversation-demo-maya",
    startMs: 38000,
    endMs: 54000,
    text: "I recommend tracking embedding versioning alongside conversation metadata in the database.",
    speakerLabel: "Maya Chen",
    personId: "person-demo-maya",
    confidence: 0.95,
    needsReview: false
  },
  // Elena conversation
  {
    id: "segment-demo-9",
    conversationId: "conversation-demo-elena",
    startMs: 14000,
    endMs: 35000,
    text: "In MemDevOS, Row Level Security must be verified with two distinct authenticated test accounts.",
    speakerLabel: "Dr. Elena Rostova",
    personId: "person-demo-elena",
    confidence: 0.98,
    needsReview: false
  },
  {
    id: "segment-demo-10",
    conversationId: "conversation-demo-elena",
    startMs: 35000,
    endMs: 62000,
    text: "Never trust client owner_id values. The database triggers enforce that foreign keys share the exact authenticated uid.",
    speakerLabel: "Dr. Elena Rostova",
    personId: "person-demo-elena",
    confidence: 0.97,
    needsReview: false
  },
  {
    id: "segment-demo-11",
    conversationId: "conversation-demo-elena",
    startMs: 62000,
    endMs: 92000,
    text: "Also ensure signed audio URLs expire within 300 seconds so recordings are never permanently public.",
    speakerLabel: "Dr. Elena Rostova",
    personId: "person-demo-elena",
    confidence: 0.99,
    needsReview: false
  }
];

export const demoNotes: ConversationNote[] = [
  {
    id: "note-demo-1",
    conversationId: "conversation-demo-alex",
    title: "Testing Agent Architecture Notes",
    body: "The discussion covered AI agents for software testing, interface adaptability, and deterministic evaluation environments. Key takeaway: snapshot initial DOM states to eliminate flaky test runs.",
    sourceSegments: [
      { segmentId: "segment-demo-2", quote: "We're experimenting with AI agents that can run software tests...", startMs: 18000, endMs: 42000 },
      { segmentId: "segment-demo-4", quote: "We're working on repeatable evaluations and reducing flaky results...", startMs: 49000, endMs: 65000 }
    ],
    generatedAt: "2026-10-10T10:30:00+05:30",
    editedByUser: false
  },
  {
    id: "note-demo-2",
    conversationId: "conversation-demo-maya",
    title: "Benchmark & Evaluation Recommendations",
    body: "Reviewed open evaluation frameworks for retrieval pipelines. Maya recommended versioning vector embeddings with conversation records to detect benchmark drift across LLM releases.",
    sourceSegments: [
      { segmentId: "segment-demo-8", quote: "I recommend tracking embedding versioning alongside conversation metadata...", startMs: 38000, endMs: 54000 }
    ],
    generatedAt: "2026-10-10T11:15:00+05:30",
    editedByUser: true
  },
  {
    id: "note-demo-3",
    conversationId: "conversation-demo-elena",
    title: "Security & RLS Verification Checklist",
    body: "Comprehensive checklist for multi-tenant isolation: verify RLS with two separate accounts, enforce owner triggers on relations, and set signed audio URL expiry to <= 300 seconds.",
    sourceSegments: [
      { segmentId: "segment-demo-9", quote: "Row Level Security must be verified with two distinct authenticated test accounts.", startMs: 14000, endMs: 35000 },
      { segmentId: "segment-demo-11", quote: "ensure signed audio URLs expire within 300 seconds...", startMs: 62000, endMs: 92000 }
    ],
    generatedAt: "2026-10-10T12:20:00+05:30",
    editedByUser: false
  }
];

export const demoTasks: TaskRecord[] = [
  {
    id: "task-demo-1",
    title: "Benchmark Whisper transcription latency with Alex",
    dueAt: "2026-10-14T17:00:00+05:30",
    status: "open",
    sourceConversationId: "conversation-demo-alex"
  },
  {
    id: "task-demo-2",
    title: "Run automated two-account RLS policy isolation tests",
    dueAt: "2026-10-12T18:00:00+05:30",
    status: "open",
    sourceConversationId: "conversation-demo-elena"
  },
  {
    id: "task-demo-3",
    title: "Review embedding versioning migration with Maya",
    dueAt: "2026-10-16T12:00:00+05:30",
    status: "completed",
    sourceConversationId: "conversation-demo-maya"
  }
];

export const demoCalendars: CalendarRecord[] = [
  {
    id: "cal-demo-1",
    title: "AI Builders Summit Opening Keynote",
    startsAt: "2026-10-10T09:00:00+05:30",
    endsAt: "2026-10-10T10:00:00+05:30",
    sourceConversationId: "conversation-demo-alex"
  },
  {
    id: "cal-demo-2",
    title: "Security Architecture Review with Dr. Elena",
    startsAt: "2026-10-12T14:30:00+05:30",
    endsAt: "2026-10-12T15:30:00+05:30",
    sourceConversationId: "conversation-demo-elena"
  }
];

export const demoAnswer: MemoryAnswer = {
  answer: "In this sample conversation, Alex Morgan described experimenting with AI agents that run software tests and adapt to interface changes, noting that repeatable evaluations and reducing flaky results are their main focus.",
  citations: [{
    conversationId: "conversation-demo-alex",
    segmentId: "segment-demo-4",
    title: "AI agents for software testing",
    startMs: 49000,
    excerpt: "We're working on repeatable evaluations and reducing flaky results by snapshotting initial state."
  }],
  insufficientEvidence: false,
  isDemo: true
};
