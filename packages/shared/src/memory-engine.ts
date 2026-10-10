import type {
  UUID,
  ConversationRecord,
  ConversationNote,
  EventRecord,
  PersonRecord,
  TranscriptSegment,
  SearchResult,
  MemoryAnswer,
  TaskRecord,
  RecordingConsentCheck
} from "./index";

export interface MemoryDatabase {
  conversations: ConversationRecord[];
  segments: TranscriptSegment[];
  notes: ConversationNote[];
  people: PersonRecord[];
  events: EventRecord[];
  tasks?: TaskRecord[];
}

/**
 * Universal search across conversations, people, events, notes, and transcript segments.
 */
export function searchMemories(query: string, db: MemoryDatabase): SearchResult[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const results: SearchResult[] = [];
  const terms = clean.split(/\s+/).filter(Boolean);

  // 1. Search conversations
  for (const c of db.conversations) {
    const text = `${c.title} ${c.summary ?? ""}`.toLowerCase();
    if (terms.some(t => text.includes(t))) {
      results.push({
        recordType: "conversation",
        recordId: c.id,
        title: c.title,
        snippet: c.summary ?? "Recorded conversation",
        isDemo: c.isDemo
      });
    }
  }

  // 2. Search transcript segments
  for (const s of db.segments) {
    const text = s.text.toLowerCase();
    if (terms.some(t => text.includes(t))) {
      const parentConv = db.conversations.find(c => c.id === s.conversationId);
      results.push({
        recordType: "segment",
        recordId: s.id,
        title: `${parentConv?.title ?? "Conversation"} (${s.speakerLabel} at ${Math.floor(s.startMs / 1000)}s)`,
        snippet: s.text,
        sourceConversationId: s.conversationId,
        startMs: s.startMs,
        isDemo: parentConv?.isDemo ?? true
      });
    }
  }

  // 3. Search notes
  for (const n of db.notes) {
    const text = `${n.title} ${n.body}`.toLowerCase();
    if (terms.some(t => text.includes(t))) {
      const parentConv = db.conversations.find(c => c.id === n.conversationId);
      results.push({
        recordType: "note",
        recordId: n.id,
        title: n.title,
        snippet: n.body.slice(0, 160) + (n.body.length > 160 ? "..." : ""),
        sourceConversationId: n.conversationId,
        isDemo: parentConv?.isDemo ?? true
      });
    }
  }

  // 4. Search people
  for (const p of db.people) {
    const text = `${p.displayName} ${p.company ?? ""} ${p.role ?? ""} ${p.notes ?? ""}`.toLowerCase();
    if (terms.some(t => text.includes(t))) {
      results.push({
        recordType: "person",
        recordId: p.id,
        title: p.displayName,
        snippet: `${p.role ?? "Contact"} · ${p.company ?? "Unassigned"}`,
        isDemo: true
      });
    }
  }

  // 5. Search events
  for (const e of db.events) {
    const text = `${e.name} ${e.venue ?? ""} ${e.notes ?? ""}`.toLowerCase();
    if (terms.some(t => text.includes(t))) {
      results.push({
        recordType: "event",
        recordId: e.id,
        title: e.name,
        snippet: `${e.venue ?? "Venue"} · ${e.timezone ?? "UTC"}`,
        isDemo: true
      });
    }
  }

  return results;
}

const STOP_WORDS = new Set([
  "what", "did", "someone", "say", "about", "the", "a", "an", "is", "are", "was",
  "were", "in", "on", "at", "by", "for", "with", "about", "against", "between",
  "into", "through", "during", "before", "after", "above", "below", "to", "from",
  "up", "down", "of", "and", "or", "so", "as", "if", "than", "then", "this",
  "that", "these", "those", "you", "your", "they", "them", "their", "we", "our",
  "how", "why", "when", "where", "who", "which", "can", "could", "would", "should",
  "have", "has", "had", "be", "been", "being", "do", "does"
]);

/**
 * Evidence-grounded memory question answering engine.
 * Never hallucinates or invents facts. Returns source citations with exact timestamps.
 */
export function answerMemoryQuestion(question: string, db: MemoryDatabase): MemoryAnswer {
  const cleanQ = question.trim().toLowerCase();
  if (!cleanQ) {
    return {
      answer: "Please ask a question about your stored memories.",
      citations: [],
      insufficientEvidence: true,
      isDemo: true
    };
  }

  // Extract content query words (filter stopwords and single/double character tokens)
  const allTokens = cleanQ.replace(/[^a-z0-9_\s]/g, " ").split(/\s+/).filter(Boolean);
  const contentTerms = allTokens.filter(t => t.length > 2 && !STOP_WORDS.has(t));

  // If user only typed stopwords (e.g. "what is that"), fall back to any non-trivial tokens
  const searchTerms = contentTerms.length > 0 ? contentTerms : allTokens.filter(t => t.length > 2);

  if (searchTerms.length === 0) {
    return {
      answer: `No specific topic or entity was recognized in your question. Please include keywords such as people names, topics, or events.`,
      citations: [],
      insufficientEvidence: true,
      isDemo: true
    };
  }

  // Match segments that contain the relevant keywords
  const matchedSegments: Array<{ segment: TranscriptSegment; score: number }> = [];

  for (const s of db.segments) {
    const textLower = s.text.toLowerCase();
    let score = 0;
    for (const term of searchTerms) {
      if (textLower.includes(term)) {
        // Boost exact word match vs substring
        const isWordMatch = new RegExp(`\\b${term}\\b`, "i").test(textLower);
        score += isWordMatch ? 5 : 2;
      }
    }
    if (score > 0) {
      matchedSegments.push({ segment: s, score });
    }
  }

  matchedSegments.sort((a, b) => b.score - a.score);

  if (matchedSegments.length === 0) {
    return {
      answer: `No authorized memory evidence was found to answer: "${question}". MemDevOS only synthesizes verified records to prevent fabrication.`,
      citations: [],
      insufficientEvidence: true,
      isDemo: true
    };
  }

  const topMatches = matchedSegments.slice(0, 3);
  const citations = topMatches.map(m => {
    const parent = db.conversations.find(c => c.id === m.segment.conversationId);
    return {
      conversationId: m.segment.conversationId,
      segmentId: m.segment.id,
      title: parent?.title ?? "Recorded conversation",
      startMs: m.segment.startMs,
      excerpt: m.segment.text
    };
  });

  const excerpts = topMatches.map(m => `"${m.segment.text}" (${m.segment.speakerLabel} at ${Math.floor(m.segment.startMs / 1000)}s)`).join(" ");
  const answer = `Based on stored conversation evidence: ${excerpts}`;

  return {
    answer,
    citations,
    insufficientEvidence: false,
    isDemo: true
  };
}

/**
 * Validates recording consent checks before state transition.
 */
export function validateRecordingConsent(check: RecordingConsentCheck): { allowed: boolean; reason?: string } {
  if (check.status === "blocked") {
    return { allowed: false, reason: "Recording is blocked due to policy or missing permission." };
  }
  if (check.status === "withdrawn") {
    return { allowed: false, reason: "Consent was explicitly withdrawn." };
  }
  if (check.status !== "checks_completed") {
    return { allowed: false, reason: "Consent attestation checks must be completed before recording." };
  }
  return { allowed: true };
}
