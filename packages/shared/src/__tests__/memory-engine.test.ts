import { describe, it, expect } from "vitest";
import {
  searchMemories,
  answerMemoryQuestion,
  validateRecordingConsent,
  type MemoryDatabase
} from "../memory-engine";
import {
  demoConversations,
  demoSegments,
  demoNotes,
  demoPeople,
  demoEvents,
  demoTasks
} from "../mock-data";

const testDb: MemoryDatabase = {
  conversations: demoConversations,
  segments: demoSegments,
  notes: demoNotes,
  people: demoPeople,
  events: demoEvents,
  tasks: demoTasks
};

describe("MemDevOS Memory Engine", () => {
  describe("Universal Search", () => {
    it("returns empty array for whitespace query", () => {
      expect(searchMemories("   ", testDb)).toEqual([]);
    });

    it("matches conversations by title or summary keywords", () => {
      const results = searchMemories("software testing", testDb);
      expect(results.length).toBeGreaterThan(0);
      const conv = results.find(r => r.recordType === "conversation" && r.title.includes("testing"));
      expect(conv).toBeDefined();
    });

    it("matches transcript segments with timestamps and speaker attribution", () => {
      const results = searchMemories("repeatable evaluations", testDb);
      const segMatch = results.find(r => r.recordType === "segment");
      expect(segMatch).toBeDefined();
      expect(segMatch?.snippet).toContain("repeatable evaluations");
      expect(segMatch?.startMs).toBeDefined();
      expect(segMatch?.sourceConversationId).toBe("conversation-demo-alex");
    });

    it("matches people by company, role, or name", () => {
      const results = searchMemories("Cryptographer", testDb);
      const personMatch = results.find(r => r.recordType === "person");
      expect(personMatch).toBeDefined();
      expect(personMatch?.title).toBe("Dr. Elena Rostova");
    });

    it("matches notes with excerpt snippet", () => {
      const results = searchMemories("drift", testDb);
      const noteMatch = results.find(r => r.recordType === "note");
      expect(noteMatch).toBeDefined();
    });
  });

  describe("Evidence-Grounded Question Answering", () => {
    it("returns verifiable citations with exact timestamps when evidence exists", () => {
      const result = answerMemoryQuestion("What did someone say about flaky results?", testDb);
      expect(result.insufficientEvidence).toBe(false);
      expect(result.citations.length).toBeGreaterThan(0);
      const firstCitation = result.citations[0];
      expect(firstCitation.excerpt.toLowerCase()).toContain("flaky");
      expect(firstCitation.startMs).toBe(49000);
      expect(firstCitation.conversationId).toBe("conversation-demo-alex");
      expect(result.answer).toContain("flaky results");
    });

    it("cites RLS and two-account testing from Dr. Elena", () => {
      const result = answerMemoryQuestion("What is required for Row Level Security?", testDb);
      expect(result.insufficientEvidence).toBe(false);
      expect(result.citations.some(c => c.excerpt.includes("Row Level Security"))).toBe(true);
      expect(result.citations.some(c => c.startMs === 14000)).toBe(true);
    });

    it("honestly reports insufficient evidence rather than hallucinating unsupported facts", () => {
      const result = answerMemoryQuestion("What is the recipe for chocolate cake?", testDb);
      expect(result.insufficientEvidence).toBe(true);
      expect(result.citations).toHaveLength(0);
      expect(result.answer).toContain("No authorized memory evidence was found");
    });

    it("handles empty or blank prompt gracefully", () => {
      const result = answerMemoryQuestion("", testDb);
      expect(result.insufficientEvidence).toBe(true);
      expect(result.citations).toHaveLength(0);
    });
  });

  describe("Consent Verification Gate", () => {
    it("permits recording only when consent checks are completed", () => {
      const res = validateRecordingConsent({
        checkedAt: "2026-10-10T10:00:00Z",
        scope: "meeting recording",
        status: "checks_completed",
        method: "user_attestation"
      });
      expect(res.allowed).toBe(true);
    });

    it("blocks recording when status is blocked", () => {
      const res = validateRecordingConsent({
        checkedAt: "2026-10-10T10:00:00Z",
        scope: "meeting recording",
        status: "blocked",
        method: "user_attestation"
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("blocked");
    });

    it("blocks recording when consent was withdrawn", () => {
      const res = validateRecordingConsent({
        checkedAt: "2026-10-10T10:00:00Z",
        scope: "meeting recording",
        status: "withdrawn",
        method: "user_attestation"
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("withdrawn");
    });

    it("blocks recording if checks are not completed", () => {
      const res = validateRecordingConsent({
        checkedAt: "2026-10-10T10:00:00Z",
        scope: "meeting recording",
        status: "not_checked",
        method: "user_attestation"
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("must be completed");
    });
  });
});
