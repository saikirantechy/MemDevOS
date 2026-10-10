'use client';

import { useState, useMemo, useEffect, useRef } from "react";
import {
  demoConversations as initialConversations,
  demoSegments as initialSegments,
  demoNotes as initialNotes,
  demoPeople as initialPeople,
  demoEvents as initialEvents,
  demoTasks as initialTasks,
  demoCalendars as initialCalendars
} from "@memdevos/shared/src/mock-data";
import {
  searchMemories,
  answerMemoryQuestion,
  validateRecordingConsent,
  type MemoryDatabase
} from "@memdevos/shared/src/memory-engine";
import type {
  ConversationRecord,
  TranscriptSegment,
  ConversationNote,
  PersonRecord,
  EventRecord,
  TaskRecord,
  SearchResult,
  MemoryAnswer
} from "@memdevos/shared/src/index";

type TabName =
  | "Dashboard"
  | "Capture"
  | "Conversations"
  | "AI Chat"
  | "People"
  | "Events"
  | "Notes"
  | "Tasks";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  answerMeta?: MemoryAnswer;
  timestamp: string;
}

export default function HomePage() {
  // Domain State (Interactive memory database)
  const [conversations, setConversations] = useState<ConversationRecord[]>(initialConversations);
  const [segments, setSegments] = useState<TranscriptSegment[]>(initialSegments);
  const [notes, setNotes] = useState<ConversationNote[]>(initialNotes);
  const [people, setPeople] = useState<PersonRecord[]>(initialPeople);
  const [events, setEvents] = useState<EventRecord[]>(initialEvents);
  const [tasks, setTasks] = useState<TaskRecord[]>(initialTasks);

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<TabName>("Dashboard");
  const [selectedConvId, setSelectedConvId] = useState<string>(initialConversations[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Audio Player Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(12000);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [transcriptFilter, setTranscriptFilter] = useState("");

  // Capture Studio State
  const [captureStatus, setCaptureStatus] = useState<"idle" | "recording" | "processing">("idle");
  const [captureElapsedSec, setCaptureElapsedSec] = useState(0);
  const [captureTitle, setCaptureTitle] = useState("");
  const [captureSpeaker, setCaptureSpeaker] = useState(initialPeople[0].id);
  const [captureConsentChecks, setCaptureConsentChecks] = useState({
    notice: false,
    scope: false,
    vault: false
  });

  // AI Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Welcome to MemDevOS Memory Assistant. I retrieve answers strictly from your authorized recorded conversations and provide exact timestamp citations.",
      timestamp: "10:30 AM"
    }
  ]);

  // Notes state
  const [selectedNoteId, setSelectedNoteId] = useState<string>(initialNotes[0].id);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editNoteBody, setEditNoteBody] = useState("");

  // Current Database bundle
  const memoryDb: MemoryDatabase = useMemo(() => ({
    conversations,
    segments,
    notes,
    people,
    events,
    tasks
  }), [conversations, segments, notes, people, events, tasks]);

  // Universal search results
  const universalSearchResults: SearchResult[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchMemories(searchQuery, memoryDb);
  }, [searchQuery, memoryDb]);

  // Current selected conversation
  const currentConv = useMemo(() => {
    return conversations.find(c => c.id === selectedConvId) ?? conversations[0];
  }, [conversations, selectedConvId]);

  // Current conversation segments
  const convSegments = useMemo(() => {
    return segments
      .filter(s => s.conversationId === currentConv.id)
      .filter(s => transcriptFilter ? s.text.toLowerCase().includes(transcriptFilter.toLowerCase()) : true);
  }, [segments, currentConv.id, transcriptFilter]);

  // Audio Player Simulation Interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeMs(prev => {
        const max = currentConv.durationMs ?? 78000;
        if (prev >= max) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 500 * playbackSpeed;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentConv]);

  // Recording Timer Interval
  useEffect(() => {
    if (captureStatus !== "recording") return;
    const interval = setInterval(() => {
      setCaptureElapsedSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [captureStatus]);

  // Helper: jump to segment in audio player
  const jumpToSegment = (convId: string, startMs: number) => {
    setSelectedConvId(convId);
    setCurrentTimeMs(startMs);
    setIsPlaying(true);
    setActiveTab("Conversations");
    setShowSearchModal(false);
  };

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: t.status === "completed" ? "open" : "completed" };
      }
      return t;
    }));
  };

  // Toggle person identity confirmation
  const toggleIdentity = (personId: string) => {
    setPeople(prev => prev.map(p => {
      if (p.id === personId) {
        return { ...p, identityConfirmed: !p.identityConfirmed };
      }
      return p;
    }));
  };

  // Toggle segment needsReview flag
  const toggleSegmentReview = (segmentId: string) => {
    setSegments(prev => prev.map(s => {
      if (s.id === segmentId) {
        return { ...s, needsReview: !s.needsReview };
      }
      return s;
    }));
  };

  // Submit AI Chat Query
  const handleSendChat = (queryText?: string) => {
    const q = (queryText ?? chatInput).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const answerResult = answerMemoryQuestion(q, memoryDb);

    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      sender: "assistant",
      text: answerResult.answer,
      answerMeta: answerResult,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg, botMsg]);
    if (!queryText) setChatInput("");
  };

  // Complete capture and save to local memory store
  const handleFinishCapture = () => {
    setCaptureStatus("processing");
    setTimeout(() => {
      const newId = `conversation-captured-${Date.now()}`;
      const person = people.find(p => p.id === captureSpeaker);
      const title = captureTitle.trim() || `Session with ${person?.displayName ?? "Guest"}`;
      const duration = Math.max(captureElapsedSec * 1000, 45000);

      const newConv: ConversationRecord = {
        id: newId,
        title,
        eventId: events[0].id,
        personIds: [captureSpeaker],
        occurredAt: new Date().toISOString(),
        durationMs: duration,
        status: "completed",
        consentStatus: "checks_completed",
        summary: `Preserved conversation regarding personal notes and technical roadmap with ${person?.displayName ?? "participant"}.`,
        isDemo: true
      };

      const newSeg1: TranscriptSegment = {
        id: `seg-${Date.now()}-1`,
        conversationId: newId,
        startMs: 4000,
        endMs: 16000,
        text: `Starting capture session. Consent attestation scope confirmed for technical review.`,
        speakerLabel: "You",
        needsReview: false
      };

      const newSeg2: TranscriptSegment = {
        id: `seg-${Date.now()}-2`,
        conversationId: newId,
        startMs: 16000,
        endMs: duration,
        text: `We walked through the architectural implementation, RLS test boundaries, and memory retrieval benchmarks.`,
        speakerLabel: person?.displayName ?? "Speaker 2",
        personId: captureSpeaker,
        confidence: 0.95,
        needsReview: false
      };

      const newNote: ConversationNote = {
        id: `note-${Date.now()}`,
        conversationId: newId,
        title: `${title} - Summary Notes`,
        body: `Automated source-linked notes for ${title}. Covered roadmap details and action items. Verify against audio playback before publishing.`,
        sourceSegments: [
          { segmentId: newSeg2.id, quote: newSeg2.text, startMs: newSeg2.startMs, endMs: newSeg2.endMs }
        ],
        generatedAt: new Date().toISOString(),
        editedByUser: false
      };

      setConversations(prev => [newConv, ...prev]);
      setSegments(prev => [...prev, newSeg1, newSeg2]);
      setNotes(prev => [newNote, ...prev]);

      // Reset capture form
      setCaptureStatus("idle");
      setCaptureElapsedSec(0);
      setCaptureTitle("");
      setCaptureConsentChecks({ notice: false, scope: false, vault: false });
      setSelectedConvId(newId);
      setActiveTab("Conversations");
    }, 900);
  };

  const allConsentChecked = captureConsentChecks.notice && captureConsentChecks.scope && captureConsentChecks.vault;

  return (
    <div className="shell">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✳</div>
          <div>
            <div>MemDevOS</div>
            <div className="subtle" style={{ fontSize: 10, letterSpacing: "0.08em" }}>AI MEMORY OS · v0.1.0</div>
          </div>
        </div>

        {/* Universal Search trigger button */}
        <button
          className="btn"
          style={{ width: "100%", justifyContent: "flex-start", marginBottom: 16, background: "rgba(13,15,23,0.7)" }}
          onClick={() => setShowSearchModal(true)}
        >
          <span style={{ color: "var(--accent)" }}>🔍</span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Quick search memory…</span>
        </button>

        <div className="nav-wrap">
          <button className={`nav ${activeTab === "Dashboard" ? "active" : ""}`} onClick={() => setActiveTab("Dashboard")}>
            <span>📊</span> Dashboard
          </button>
          <button className={`nav ${activeTab === "Capture" ? "active" : ""}`} onClick={() => setActiveTab("Capture")}>
            <span>🎙️</span> Capture Studio
          </button>
          <button className={`nav ${activeTab === "Conversations" ? "active" : ""}`} onClick={() => setActiveTab("Conversations")}>
            <span>💬</span> Conversations
          </button>
          <button className={`nav ${activeTab === "AI Chat" ? "active" : ""}`} onClick={() => setActiveTab("AI Chat")}>
            <span>🧠</span> AI Memory Chat
          </button>
          <button className={`nav ${activeTab === "Notes" ? "active" : ""}`} onClick={() => setActiveTab("Notes")}>
            <span>📝</span> Notes & Docs
          </button>
          <button className={`nav ${activeTab === "Tasks" ? "active" : ""}`} onClick={() => setActiveTab("Tasks")}>
            <span>✅</span> Tasks & Calendar
          </button>
          <button className={`nav ${activeTab === "People" ? "active" : ""}`} onClick={() => setActiveTab("People")}>
            <span>👥</span> People Context
          </button>
          <button className={`nav ${activeTab === "Events" ? "active" : ""}`} onClick={() => setActiveTab("Events")}>
            <span>🏛️</span> Events
          </button>
        </div>

        {/* Privacy & RLS status card */}
        <div className="panel" style={{ marginTop: "auto", padding: 14, background: "rgba(20,23,36,0.6)" }}>
          <div className="spread">
            <span className="eyebrow">RLS Isolation</span>
            <span className="pill success" style={{ fontSize: 9 }}>Active</span>
          </div>
          <p className="muted" style={{ fontSize: 11, margin: "6px 0 0", lineHeight: 1.4 }}>
            Zero-trust owner triggers enforce strict memory boundary. Demo mode active.
          </p>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="main">
        {/* Top Header bar */}
        <div className="spread" style={{ marginBottom: 24 }}>
          <div>
            <div className="eyebrow">Personal AI Memory Vault</div>
            <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800 }}>{activeTab}</h1>
          </div>
          <div className="row">
            <span className="pill neutral">
              <span className="pulsing-dot" style={{ width: 6, height: 6, background: "var(--success)" }} />
              Storage Verified
            </span>
            <span className="pill">SAMPLE VAULT</span>
          </div>
        </div>

        {/* ---------------- 1. DASHBOARD VIEW ---------------- */}
        {activeTab === "Dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Metric Highlights */}
            <div className="grid">
              <div className="panel panel-interactive">
                <div className="spread">
                  <span className="eyebrow">Indexed Memory</span>
                  <span style={{ fontSize: 20 }}>🎙️</span>
                </div>
                <h2 style={{ fontSize: 32, margin: "10px 0 4px", fontWeight: 800 }}>{conversations.length}</h2>
                <div className="muted" style={{ fontSize: 13 }}>
                  Recorded conversations · {segments.length} timestamped passages
                </div>
              </div>

              <div className="panel panel-interactive">
                <div className="spread">
                  <span className="eyebrow">People & Relations</span>
                  <span style={{ fontSize: 20 }}>👥</span>
                </div>
                <h2 style={{ fontSize: 32, margin: "10px 0 4px", fontWeight: 800 }}>{people.length}</h2>
                <div className="muted" style={{ fontSize: 13 }}>
                  Active profiles · {people.filter(p => p.identityConfirmed).length} confirmed identities
                </div>
              </div>

              <div className="panel panel-interactive">
                <div className="spread">
                  <span className="eyebrow">Action Items</span>
                  <span style={{ fontSize: 20 }}>⚡</span>
                </div>
                <h2 style={{ fontSize: 32, margin: "10px 0 4px", fontWeight: 800 }}>
                  {tasks.filter(t => t.status === "open").length}
                </h2>
                <div className="muted" style={{ fontSize: 13 }}>
                  Extracted from conversation commitments
                </div>
              </div>

              <div className="panel panel-interactive">
                <div className="spread">
                  <span className="eyebrow">Current Summit</span>
                  <span style={{ fontSize: 20 }}>🏛️</span>
                </div>
                <h2 style={{ fontSize: 22, margin: "10px 0 4px", fontWeight: 800 }}>{events[0].name}</h2>
                <div className="muted" style={{ fontSize: 13 }}>
                  {events[0].venue} · {events[0].timezone}
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="panel" style={{ background: "linear-gradient(135deg, rgba(163,156,248,0.1), rgba(20,23,36,0.8))" }}>
              <div className="spread">
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Quick Memory Actions</h3>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    Record a new conversation, ask an evidence-grounded query, or manage action items.
                  </p>
                </div>
                <div className="row">
                  <button className="btn primary" onClick={() => setActiveTab("Capture")}>
                    🎙️ Start Capture
                  </button>
                  <button className="btn outline-accent" onClick={() => setActiveTab("AI Chat")}>
                    🧠 Ask Memory
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Conversations List */}
            <div className="panel">
              <div className="spread" style={{ marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Recent Recorded Conversations</h3>
                <button className="btn" onClick={() => setActiveTab("Conversations")} style={{ fontSize: 12 }}>
                  View All ({conversations.length}) →
                </button>
              </div>

              {conversations.map(c => {
                const person = people.find(p => c.personIds.includes(p.id));
                return (
                  <div
                    key={c.id}
                    className="list-item spread"
                    onClick={() => { setSelectedConvId(c.id); setActiveTab("Conversations"); }}
                  >
                    <div>
                      <div className="row" style={{ gap: 8 }}>
                        <strong>{c.title}</strong>
                        <span className="pill success" style={{ fontSize: 10 }}>{c.status}</span>
                      </div>
                      <p className="muted" style={{ fontSize: 13, margin: "4px 0 0" }}>
                        {new Date(c.occurredAt).toLocaleString()} · Participant: {person?.displayName ?? "Guest"}
                      </p>
                      <p className="subtle" style={{ fontSize: 12, margin: "4px 0 0" }}>{c.summary}</p>
                    </div>
                    <button className="btn outline-accent" style={{ padding: "6px 12px", fontSize: 12 }}>
                      Inspect →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- 2. CAPTURE STUDIO VIEW ---------------- */}
        {activeTab === "Capture" && (
          <div className="panel" style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="spread" style={{ marginBottom: 16 }}>
              <div>
                <span className="eyebrow">Consent-Gated Capture Studio</span>
                <h2 style={{ margin: "6px 0 0", fontSize: 24 }}>
                  {captureStatus === "recording"
                    ? "🔴 Recording in Progress"
                    : captureStatus === "processing"
                    ? "⏳ Indexing & Generating Notes…"
                    : "Ready to Capture Conversation"}
                </h2>
              </div>
              {captureStatus === "recording" && (
                <div className="pill" style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "rgba(248,113,113,0.15)" }}>
                  <span className="pulsing-dot" />
                  {Math.floor(captureElapsedSec / 60).toString().padStart(2, "0")}:
                  {(captureElapsedSec % 60).toString().padStart(2, "0")}
                </div>
              )}
            </div>

            {/* Simulated Live Audio Visualizer */}
            <div className="waveform-bars" style={{ height: 60, marginBottom: 20 }}>
              {Array.from({ length: 42 }).map((_, i) => (
                <div
                  key={i}
                  className="bar"
                  style={{
                    height: captureStatus === "recording"
                      ? `${Math.max(8, ((i * 7 + captureElapsedSec * 13) % 46))}px`
                      : "6px",
                    opacity: captureStatus === "recording" ? 0.9 : 0.3
                  }}
                />
              ))}
            </div>

            {/* Capture Metadata Form */}
            {captureStatus === "idle" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                <div>
                  <label className="subtle" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                    Conversation Title / Topic
                  </label>
                  <input
                    className="field"
                    placeholder="e.g., Evaluation benchmark deep dive"
                    value={captureTitle}
                    onChange={e => setCaptureTitle(e.target.value)}
                  />
                </div>

                <div className="grid">
                  <div>
                    <label className="subtle" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                      Primary Participant
                    </label>
                    <select
                      className="field"
                      value={captureSpeaker}
                      onChange={e => setCaptureSpeaker(e.target.value)}
                    >
                      {people.map(p => (
                        <option key={p.id} value={p.id}>{p.displayName} ({p.company})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="subtle" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                      Event Workspace
                    </label>
                    <input className="field" value={events[0].name} disabled />
                  </div>
                </div>

                {/* Consent Checklist */}
                <div className="panel" style={{ background: "rgba(13,15,23,0.6)", padding: 16 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Required Consent Attestation</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label className="row" style={{ alignItems: "flex-start", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={captureConsentChecks.notice}
                        onChange={e => setCaptureConsentChecks(prev => ({ ...prev, notice: e.target.checked }))}
                        style={{ marginTop: 3 }}
                      />
                      <span style={{ fontSize: 13, lineHeight: 1.4 }}>
                        I attest that all participants have received clear notice and authorized audio capture.
                      </span>
                    </label>

                    <label className="row" style={{ alignItems: "flex-start", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={captureConsentChecks.scope}
                        onChange={e => setCaptureConsentChecks(prev => ({ ...prev, scope: e.target.checked }))}
                        style={{ marginTop: 3 }}
                      />
                      <span style={{ fontSize: 13, lineHeight: 1.4 }}>
                        The recording scope is bounded strictly to personal memory and agreed technical synthesis.
                      </span>
                    </label>

                    <label className="row" style={{ alignItems: "flex-start", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={captureConsentChecks.vault}
                        onChange={e => setCaptureConsentChecks(prev => ({ ...prev, vault: e.target.checked }))}
                        style={{ marginTop: 3 }}
                      />
                      <span style={{ fontSize: 13, lineHeight: 1.4 }}>
                        I understand this recording will be stored privately with Row Level Security under my account.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="spread">
              <div className="muted" style={{ fontSize: 12 }}>
                {allConsentChecked ? "✓ Consent prerequisites satisfied" : "⚠ All consent checks must be checked to enable capture"}
              </div>
              <div className="row">
                {captureStatus === "idle" && (
                  <button
                    className="btn primary"
                    disabled={!allConsentChecked}
                    onClick={() => { setCaptureStatus("recording"); setCaptureElapsedSec(1); }}
                  >
                    🎙️ Start Recording
                  </button>
                )}

                {captureStatus === "recording" && (
                  <button
                    className="btn primary"
                    onClick={handleFinishCapture}
                  >
                    ⏹️ Stop & Save to Vault
                  </button>
                )}

                {captureStatus === "processing" && (
                  <button className="btn" disabled>
                    Processing Audio & Indexes…
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 3. CONVERSATIONS & AUDIO DETAIL VIEW ---------------- */}
        {activeTab === "Conversations" && (
          <div className="grid" style={{ gridTemplateColumns: "320px minmax(0, 1fr)", gap: 20 }}>
            {/* Conversation Selector List */}
            <div>
              <input
                className="field"
                placeholder="Filter conversations…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "75vh", overflowY: "auto" }}>
                {conversations
                  .filter(c => searchQuery ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) : true)
                  .map(c => {
                    const person = people.find(p => c.personIds.includes(p.id));
                    return (
                      <div
                        key={c.id}
                        className={`list-item ${selectedConvId === c.id ? "selected" : ""}`}
                        onClick={() => { setSelectedConvId(c.id); setCurrentTimeMs(0); setIsPlaying(false); }}
                      >
                        <div className="spread">
                          <strong style={{ fontSize: 14 }}>{c.title}</strong>
                          <span className="pill success" style={{ fontSize: 9 }}>{c.status}</span>
                        </div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                          {person?.displayName ?? "Guest"} · {Math.floor((c.durationMs ?? 60000) / 1000)}s
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Conversation Detail & Interactive Player */}
            <div className="panel">
              <div className="spread">
                <div>
                  <span className="eyebrow">Conversation Record</span>
                  <h2 style={{ margin: "4px 0", fontSize: 22 }}>{currentConv.title}</h2>
                  <div className="muted" style={{ fontSize: 13 }}>
                    Recorded on {new Date(currentConv.occurredAt).toLocaleString()} · Event: {events[0].name}
                  </div>
                </div>
                <span className="pill success">Consent Verified</span>
              </div>

              {/* Interactive Audio Player & Waveform */}
              <div className="audio-player-bar">
                <div className="spread">
                  <div className="row">
                    <button
                      className="btn primary"
                      style={{ width: 40, height: 40, borderRadius: "50%", padding: 0 }}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? "⏸️" : "▶️"}
                    </button>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>
                        {Math.floor(currentTimeMs / 1000)}s / {Math.floor((currentConv.durationMs ?? 78000) / 1000)}s
                      </span>
                      <div className="subtle" style={{ fontSize: 11 }}>Private Audio Stream (Signed URL)</div>
                    </div>
                  </div>

                  {/* Playback speed selector */}
                  <div className="row">
                    <span className="subtle" style={{ fontSize: 12 }}>Speed:</span>
                    {[1, 1.25, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        className={`btn ${playbackSpeed === speed ? "primary" : ""}`}
                        style={{ padding: "4px 8px", fontSize: 11 }}
                        onClick={() => setPlaybackSpeed(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrubber slider */}
                <input
                  type="range"
                  className="slider"
                  min={0}
                  max={currentConv.durationMs ?? 78000}
                  value={currentTimeMs}
                  onChange={e => setCurrentTimeMs(Number(e.target.value))}
                />

                {/* Mini Waveform visualization */}
                <div className="waveform-bars" style={{ height: 32, padding: "2px 8px" }}>
                  {Array.from({ length: 50 }).map((_, i) => {
                    const progress = currentTimeMs / (currentConv.durationMs ?? 78000);
                    const isPassed = (i / 50) <= progress;
                    return (
                      <div
                        key={i}
                        className="bar"
                        style={{
                          height: `${10 + ((i * 11) % 22)}px`,
                          background: isPassed ? "var(--accent)" : "var(--border)",
                          opacity: isPassed ? 1 : 0.4
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="panel" style={{ background: "rgba(13,15,23,0.5)", padding: 14, marginBottom: 16 }}>
                <span className="eyebrow">AI Executive Summary</span>
                <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5 }}>
                  {currentConv.summary}
                </p>
              </div>

              {/* Transcript Segments */}
              <div className="spread" style={{ marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Timestamped Transcript Segments</h3>
                <input
                  className="field"
                  placeholder="Filter transcript words…"
                  value={transcriptFilter}
                  onChange={e => setTranscriptFilter(e.target.value)}
                  style={{ width: 220, padding: "6px 10px", fontSize: 12 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto" }}>
                {convSegments.map(seg => {
                  const isActive = currentTimeMs >= seg.startMs && currentTimeMs <= seg.endMs;
                  return (
                    <div
                      key={seg.id}
                      className={`segment ${isActive ? "active-segment" : ""}`}
                      onClick={() => { setCurrentTimeMs(seg.startMs); setIsPlaying(true); }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="spread">
                        <div className="row" style={{ gap: 8 }}>
                          <span className="pill neutral" style={{ fontSize: 10 }}>
                            {seg.speakerLabel}
                          </span>
                          <span className="subtle" style={{ fontSize: 11 }}>
                            {Math.floor(seg.startMs / 1000)}s — {Math.floor(seg.endMs / 1000)}s
                          </span>
                        </div>
                        <div className="row">
                          <button
                            className="btn"
                            style={{ padding: "2px 8px", fontSize: 11 }}
                            onClick={(e) => { e.stopPropagation(); toggleSegmentReview(seg.id); }}
                          >
                            {seg.needsReview ? "⚠️ Needs Review" : "✓ Verified"}
                          </button>
                        </div>
                      </div>
                      <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5 }}>
                        {seg.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 4. AI MEMORY CHAT VIEW ---------------- */}
        {activeTab === "AI Chat" && (
          <div className="panel" style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", height: "78vh" }}>
            <div className="spread" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 14 }}>
              <div>
                <span className="eyebrow">Evidence-Grounded Assistant</span>
                <h2 style={{ margin: "4px 0 0", fontSize: 20 }}>Ask Your Memory Vault</h2>
              </div>
              <span className="pill success">Hallucination Guard Active</span>
            </div>

            {/* Quick Starter Query Prompts */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
              {[
                "What did Alex say about flaky results?",
                "What did Maya recommend regarding vector embeddings?",
                "What are the rules for Row Level Security?",
                "What is the recipe for chocolate cake?"
              ].map(q => (
                <button
                  key={q}
                  className="btn"
                  style={{ fontSize: 11, whiteSpace: "nowrap", padding: "6px 12px" }}
                  onClick={() => handleSendChat(q)}
                >
                  💡 {q}
                </button>
              ))}
            </div>

            {/* Chat Messages Log */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingRight: 6 }}>
              {chatHistory.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    background: msg.sender === "user" ? "var(--elevated)" : "rgba(20,23,36,0.9)",
                    border: "1px solid",
                    borderColor: msg.sender === "user" ? "var(--accent)" : "var(--border)",
                    borderRadius: 14,
                    padding: "14px 18px"
                  }}
                >
                  <div className="spread" style={{ marginBottom: 6 }}>
                    <span className="eyebrow" style={{ fontSize: 10 }}>
                      {msg.sender === "user" ? "You" : "MemDevOS Memory Engine"}
                    </span>
                    <span className="subtle" style={{ fontSize: 10 }}>{msg.timestamp}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{msg.text}</p>

                  {/* Verifiable Citations */}
                  {msg.answerMeta && msg.answerMeta.citations.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                      <span className="eyebrow" style={{ fontSize: 10 }}>Source Evidence Citations</span>
                      {msg.answerMeta.citations.map((c, i) => (
                        <div key={i} className="citation-card spread">
                          <div>
                            <div className="row" style={{ gap: 6 }}>
                              <strong style={{ fontSize: 12 }}>{c.title}</strong>
                              <span className="pill neutral" style={{ fontSize: 9 }}>
                                {Math.floor((c.startMs ?? 0) / 1000)}s
                              </span>
                            </div>
                            <div className="muted" style={{ fontSize: 12, fontStyle: "italic", marginTop: 4 }}>
                              "{c.excerpt}"
                            </div>
                          </div>
                          <button
                            className="btn outline-accent"
                            style={{ fontSize: 11, padding: "4px 8px" }}
                            onClick={() => jumpToSegment(c.conversationId, c.startMs ?? 0)}
                          >
                            Play Segment →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Insufficient Evidence Notice */}
                  {msg.answerMeta && msg.answerMeta.insufficientEvidence && (
                    <div style={{ marginTop: 8 }} className="pill warning">
                      ⚠ Unsubstantiated Query — No Fabricated Response Created
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="spread" style={{ marginTop: 14, gap: 10 }}>
              <input
                className="field"
                placeholder="Ask about what was discussed, promised, or decided…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSendChat(); }}
              />
              <button
                className="btn primary"
                disabled={!chatInput.trim()}
                onClick={() => handleSendChat()}
                style={{ padding: "10px 20px" }}
              >
                Query
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 5. NOTES & DOCUMENTS VIEW ---------------- */}
        {activeTab === "Notes" && (
          <div className="grid" style={{ gridTemplateColumns: "300px minmax(0, 1fr)", gap: 20 }}>
            <div>
              <div className="spread" style={{ marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Notes & Summaries</h3>
                <span className="pill neutral">{notes.length} notes</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {notes.map(n => (
                  <div
                    key={n.id}
                    className={`list-item ${selectedNoteId === n.id ? "selected" : ""}`}
                    onClick={() => { setSelectedNoteId(n.id); setIsEditingNote(false); }}
                  >
                    <strong style={{ fontSize: 13 }}>{n.title}</strong>
                    <p className="muted" style={{ fontSize: 11, margin: "4px 0 0" }}>
                      {n.editedByUser ? "User edited" : "AI generated"} · {new Date(n.generatedAt ?? "").toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Reader & Editor */}
            {(() => {
              const currentNote = notes.find(n => n.id === selectedNoteId) ?? notes[0];
              return (
                <div className="panel">
                  <div className="spread" style={{ marginBottom: 14 }}>
                    <div>
                      <span className="eyebrow">Document & Verifiable Sources</span>
                      <h2 style={{ margin: "4px 0", fontSize: 20 }}>{currentNote.title}</h2>
                    </div>
                    <div className="row">
                      <button
                        className="btn"
                        onClick={() => {
                          if (isEditingNote) {
                            // save
                            setNotes(prev => prev.map(n => n.id === currentNote.id ? { ...n, body: editNoteBody, editedByUser: true } : n));
                            setIsEditingNote(false);
                          } else {
                            setEditNoteBody(currentNote.body);
                            setIsEditingNote(true);
                          }
                        }}
                      >
                        {isEditingNote ? "💾 Save Changes" : "✏️ Edit Note"}
                      </button>
                    </div>
                  </div>

                  {isEditingNote ? (
                    <textarea
                      className="field"
                      rows={10}
                      value={editNoteBody}
                      onChange={e => setEditNoteBody(e.target.value)}
                    />
                  ) : (
                    <div className="panel" style={{ background: "rgba(13,15,23,0.5)", lineHeight: 1.6, fontSize: 14 }}>
                      {currentNote.body}
                    </div>
                  )}

                  <h3 style={{ fontSize: 15, margin: "20px 0 10px" }}>Source Transcript Quotes</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {currentNote.sourceSegments.map((src, idx) => (
                      <div key={idx} className="citation-card spread">
                        <div>
                          <div className="subtle" style={{ fontSize: 11 }}>
                            Timestamp: {Math.floor((src.startMs ?? 0) / 1000)}s — {Math.floor((src.endMs ?? 0) / 1000)}s
                          </div>
                          <div style={{ fontSize: 13, marginTop: 4 }}>
                            "{src.quote}"
                          </div>
                        </div>
                        <button
                          className="btn outline-accent"
                          style={{ fontSize: 11, padding: "4px 8px" }}
                          onClick={() => jumpToSegment(currentNote.conversationId, src.startMs ?? 0)}
                        >
                          Jump to Source →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ---------------- 6. TASKS & CALENDAR VIEW ---------------- */}
        {activeTab === "Tasks" && (
          <div className="grid">
            {/* Extracted Tasks Hub */}
            <div className="panel">
              <div className="spread" style={{ marginBottom: 14 }}>
                <div>
                  <span className="eyebrow">Action Items</span>
                  <h2 style={{ margin: "4px 0", fontSize: 20 }}>Commitments & Follow-ups</h2>
                </div>
                <span className="pill success">{tasks.filter(t => t.status === "open").length} open</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tasks.map(t => {
                  const parent = conversations.find(c => c.id === t.sourceConversationId);
                  return (
                    <div key={t.id} className="list-item spread">
                      <div className="row" style={{ gap: 12 }}>
                        <input
                          type="checkbox"
                          checked={t.status === "completed"}
                          onChange={() => toggleTask(t.id)}
                          style={{ width: 18, height: 18, cursor: "pointer" }}
                        />
                        <div>
                          <div style={{
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: t.status === "completed" ? "line-through" : "none",
                            color: t.status === "completed" ? "var(--muted)" : "var(--text)"
                          }}>
                            {t.title}
                          </div>
                          <div className="subtle" style={{ fontSize: 11, marginTop: 4 }}>
                            Due: {new Date(t.dueAt ?? "").toLocaleDateString()} · Origin: {parent?.title ?? "Conversation"}
                          </div>
                        </div>
                      </div>
                      <span className={`pill ${t.status === "completed" ? "neutral" : "warning"}`} style={{ fontSize: 10 }}>
                        {t.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Calendar Timeline */}
            <div className="panel">
              <div className="spread" style={{ marginBottom: 14 }}>
                <div>
                  <span className="eyebrow">Schedule</span>
                  <h2 style={{ margin: "4px 0", fontSize: 20 }}>Upcoming Calendar Events</h2>
                </div>
                <span className="pill neutral">{initialCalendars.length} items</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {initialCalendars.map(cal => (
                  <div key={cal.id} className="panel" style={{ background: "rgba(13,15,23,0.5)", padding: 14 }}>
                    <div className="spread">
                      <strong style={{ fontSize: 14 }}>{cal.title}</strong>
                      <span className="pill neutral" style={{ fontSize: 10 }}>
                        {new Date(cal.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                      {new Date(cal.startsAt).toLocaleDateString()} · Asia/Kolkata
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 7. PEOPLE CONTEXT VIEW ---------------- */}
        {activeTab === "People" && (
          <div className="grid">
            {people.map(person => {
              const linkedConvs = conversations.filter(c => c.personIds.includes(person.id));
              return (
                <div key={person.id} className="panel panel-interactive">
                  <div className="spread">
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>{person.displayName}</h3>
                      <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                        {person.role} · {person.company}
                      </div>
                    </div>
                    <button
                      className={`btn ${person.identityConfirmed ? "primary" : ""}`}
                      style={{ padding: "4px 10px", fontSize: 11 }}
                      onClick={() => toggleIdentity(person.id)}
                    >
                      {person.identityConfirmed ? "✓ Confirmed" : "Unverified"}
                    </button>
                  </div>

                  <p className="subtle" style={{ fontSize: 12, margin: "14px 0 10px", lineHeight: 1.4 }}>
                    {person.notes}
                  </p>

                  <div className="spread" style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 10 }}>
                    <span className="subtle" style={{ fontSize: 12 }}>
                      {linkedConvs.length} linked conversation{linkedConvs.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      className="btn outline-accent"
                      style={{ fontSize: 11, padding: "4px 8px" }}
                      onClick={() => {
                        if (linkedConvs[0]) {
                          setSelectedConvId(linkedConvs[0].id);
                          setActiveTab("Conversations");
                        }
                      }}
                    >
                      Inspect Memory →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ---------------- 8. EVENTS WORKSPACES VIEW ---------------- */}
        {activeTab === "Events" && (
          <div className="grid">
            {events.map(ev => {
              const eventConvs = conversations.filter(c => c.eventId === ev.id);
              return (
                <div key={ev.id} className="panel panel-interactive">
                  <div className="spread">
                    <div>
                      <span className="eyebrow">{ev.timezone}</span>
                      <h3 style={{ margin: "4px 0 0", fontSize: 18 }}>{ev.name}</h3>
                    </div>
                    <span className="pill neutral">{eventConvs.length} recordings</span>
                  </div>

                  <p className="muted" style={{ fontSize: 13, margin: "10px 0" }}>
                    📍 {ev.venue}
                  </p>
                  <p className="subtle" style={{ fontSize: 12, margin: "0 0 14px", lineHeight: 1.4 }}>
                    {ev.notes}
                  </p>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                    <span className="eyebrow" style={{ fontSize: 10 }}>Associated Conversations</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                      {eventConvs.map(c => (
                        <div
                          key={c.id}
                          className="spread"
                          style={{ padding: "6px 8px", background: "rgba(13,15,23,0.4)", borderRadius: 6, cursor: "pointer" }}
                          onClick={() => { setSelectedConvId(c.id); setActiveTab("Conversations"); }}
                        >
                          <span style={{ fontSize: 12 }}>{c.title}</span>
                          <span className="subtle" style={{ fontSize: 11 }}>→</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Universal Search Modal */}
      {showSearchModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20
          }}
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="panel"
            style={{ width: "100%", maxWidth: 640, maxHeight: "80vh", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="spread" style={{ marginBottom: 12 }}>
              <span className="eyebrow">Universal Memory Search</span>
              <button className="btn" style={{ padding: "2px 8px" }} onClick={() => setShowSearchModal(false)}>✕</button>
            </div>

            <input
              autoFocus
              className="field"
              placeholder="Search conversations, quotes, notes, people, and topics…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontSize: 16, padding: "12px 16px" }}
            />

            <div style={{ marginTop: 14, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {universalSearchResults.length === 0 && searchQuery.trim() && (
                <div className="muted" style={{ textAlign: "center", padding: 24, fontSize: 13 }}>
                  No matching memory records found for "{searchQuery}".
                </div>
              )}

              {universalSearchResults.map((res, i) => (
                <div
                  key={i}
                  className="list-item spread"
                  onClick={() => {
                    if (res.sourceConversationId) {
                      jumpToSegment(res.sourceConversationId, res.startMs ?? 0);
                    } else if (res.recordType === "conversation") {
                      setSelectedConvId(res.recordId);
                      setActiveTab("Conversations");
                      setShowSearchModal(false);
                    } else if (res.recordType === "person") {
                      setActiveTab("People");
                      setShowSearchModal(false);
                    } else if (res.recordType === "note") {
                      setActiveTab("Notes");
                      setShowSearchModal(false);
                    } else if (res.recordType === "event") {
                      setActiveTab("Events");
                      setShowSearchModal(false);
                    }
                  }}
                >
                  <div>
                    <div className="row" style={{ gap: 8 }}>
                      <span className="pill neutral" style={{ fontSize: 9 }}>{res.recordType}</span>
                      <strong style={{ fontSize: 13 }}>{res.title}</strong>
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                      {res.snippet}
                    </div>
                  </div>
                  <span className="subtle" style={{ fontSize: 12 }}>Jump →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
