import type {
  ConversationRecord, ConversationNote, EventRecord, PersonRecord,
  TranscriptSegment, MemoryAnswer
} from "./index";

export const demoEvent: EventRecord = {
  id: "event-demo-001",
  name: "AI Builders Summit",
  venue: "Demo venue",
  startsAt: "2026-10-10T09:00:00+05:30",
  timezone: "Asia/Kolkata",
  notes: "Fictional sample event for interface development."
};

export const demoPeople: PersonRecord[] = [
  { id: "person-demo-alex", displayName: "Alex Morgan", company: "Unconfirmed", identityConfirmed: false },
  { id: "person-demo-maya", displayName: "Maya Chen", company: "Unconfirmed", identityConfirmed: false }
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
    summary: "Sample only: discussed agents that adapt to interface changes and the challenge of repeatable evaluations.",
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
    summary: "Sample only: discussed evaluation frameworks and reproducibility across model versions.",
    isDemo: true
  }
];

export const demoSegments: TranscriptSegment[] = [
  { id: "segment-demo-1", conversationId: "conversation-demo-alex", startMs: 12000, endMs: 18000, text: "What are you working on at the moment?", speakerLabel: "You", needsReview: false },
  { id: "segment-demo-2", conversationId: "conversation-demo-alex", startMs: 18000, endMs: 42000, text: "We're experimenting with AI agents that can run software tests and adapt when the interface changes.", speakerLabel: "Speaker 2 · unverified", needsReview: true },
  { id: "segment-demo-3", conversationId: "conversation-demo-alex", startMs: 42000, endMs: 49000, text: "How are you evaluating whether the agent is reliable?", speakerLabel: "You", needsReview: false },
  { id: "segment-demo-4", conversationId: "conversation-demo-alex", startMs: 49000, endMs: 65000, text: "We're working on repeatable evaluations and reducing flaky results.", speakerLabel: "Speaker 2 · unverified", needsReview: true }
];

export const demoNotes: ConversationNote[] = [
  {
    id: "note-demo-1",
    conversationId: "conversation-demo-alex",
    title: "Detailed conversation notes",
    body: "Sample only. The discussion covered AI agents for software testing, adapting to interface changes, repeatable evaluation, and flaky results. Verify details against the original audio before relying on this note.",
    sourceSegments: [
      { segmentId: "segment-demo-2", startMs: 18000, endMs: 42000 },
      { segmentId: "segment-demo-4", startMs: 49000, endMs: 65000 }
    ],
    editedByUser: false
  }
];

export const demoAnswer: MemoryAnswer = {
  answer: "In this sample conversation, the speaker described adapting tests when an interface changes and identified repeatable evaluation and flaky results as challenges.",
  citations: [{
    conversationId: "conversation-demo-alex",
    segmentId: "segment-demo-4",
    title: "AI agents for software testing",
    startMs: 49000,
    excerpt: "We're working on repeatable evaluations and reducing flaky results."
  }],
  insufficientEvidence: false,
  isDemo: true
};
