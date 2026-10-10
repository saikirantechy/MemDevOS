export type UUID = string;
export type ISODateTime = string;

export type ProcessingStatus =
  | "draft"
  | "awaiting_consent"
  | "ready"
  | "recording"
  | "upload_pending"
  | "transcribing"
  | "indexing"
  | "completed"
  | "needs_review"
  | "failed";

export type ConsentStatus =
  | "not_checked"
  | "checks_completed"
  | "blocked"
  | "withdrawn";

export interface EventRecord {
  id: UUID;
  ownerId?: UUID;
  name: string;
  venue?: string;
  startsAt?: ISODateTime;
  endsAt?: ISODateTime;
  timezone?: string;
  notes?: string;
}

export interface PersonRecord {
  id: UUID;
  ownerId?: UUID;
  displayName: string;
  company?: string;
  role?: string;
  identityConfirmed: boolean;
  notes?: string;
}

export interface TranscriptSegment {
  id: UUID;
  conversationId: UUID;
  startMs: number;
  endMs: number;
  text: string;
  speakerLabel: string;
  personId?: UUID;
  confidence?: number;
  needsReview: boolean;
}

export interface NoteSource {
  segmentId: UUID;
  quote?: string;
  startMs?: number;
  endMs?: number;
}

export interface ConversationNote {
  id: UUID;
  conversationId: UUID;
  title: string;
  body: string;
  sourceSegments: NoteSource[];
  generatedAt?: ISODateTime;
  editedByUser: boolean;
}

export interface ConversationRecord {
  id: UUID;
  ownerId?: UUID;
  title: string;
  eventId?: UUID;
  personIds: UUID[];
  occurredAt: ISODateTime;
  durationMs?: number;
  status: ProcessingStatus;
  consentStatus: ConsentStatus;
  audioAssetId?: UUID;
  summary?: string;
  isDemo: boolean;
}

export interface RecordingConsentCheck {
  checkedAt: ISODateTime;
  scope: string;
  status: ConsentStatus;
  method: "user_attestation" | "recorded_permission" | "other";
  notes?: string;
}

export interface SearchResult {
  recordType: "conversation" | "person" | "event" | "note" | "segment";
  recordId: UUID;
  title: string;
  snippet: string;
  sourceConversationId?: UUID;
  startMs?: number;
  isDemo: boolean;
}

export interface MemoryAnswer {
  answer: string;
  citations: Array<{
    conversationId: UUID;
    segmentId?: UUID;
    title: string;
    startMs?: number;
    excerpt: string;
  }>;
  insufficientEvidence: boolean;
  isDemo: boolean;
}

/** Reserved extension points for future modules. */
export interface TaskRecord {
  id: UUID;
  title: string;
  dueAt?: ISODateTime;
  status: "open" | "completed" | "cancelled";
  sourceConversationId?: UUID;
}

export interface FileReference {
  id: UUID;
  name: string;
  mimeType?: string;
  linkedRecordIds: UUID[];
}

export interface CalendarRecord {
  id: UUID;
  title: string;
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  sourceConversationId?: UUID;
}
