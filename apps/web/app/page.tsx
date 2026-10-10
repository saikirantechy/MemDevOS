'use client';

import { useMemo, useState } from "react";
import { demoConversations, demoEvent, demoNotes, demoPeople, demoSegments } from "@memdevos/shared/src/mock-data";

const navItems = ["Home", "Capture", "Conversations", "People", "Events", "AI Chat", "Notes & Files", "Calendar & Tasks"];

export default function HomePage() {
  const [screen, setScreen] = useState("Home");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(demoConversations[0].id);
  const [question, setQuestion] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<"idle" | "mock-recording" | "stopped">("idle");
  const selected = demoConversations.find(c => c.id === selectedId) ?? demoConversations[0];
  const filtered = useMemo(() => demoConversations.filter(c =>
    `${c.title} ${c.summary ?? ""} ${c.occurredAt}`.toLowerCase().includes(query.toLowerCase())
  ), [query]);

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon">✳</span><span>MemDevOS<br/><small className="muted">PERSONAL WORKSPACE</small></span></div>
      <div className="nav-wrap">{navItems.map(item =>
        <button key={item} className={`nav ${screen === item ? "active" : ""}`} onClick={() => setScreen(item)}>{item}</button>
      )}</div>
      <div style={{marginTop:28}} className="panel">
        <div className="eyebrow">Privacy first</div>
        <p className="muted" style={{fontSize:13, lineHeight:1.5}}>Capture is a demo state only. No microphone is accessed by this web scaffold.</p>
      </div>
    </aside>
    <main className="main">
      <div className="spread">
        <div><div className="eyebrow">Personal memory</div><h1 style={{margin:"8px 0"}}>{screen}</h1></div>
        <span className="pill">SAMPLE DATA</span>
      </div>

      {screen === "Home" && <>
        <p className="muted">Your conversations, connected knowledge, and next actions.</p>
        <div className="grid">
          <div className="panel"><div className="eyebrow">Sample conversations</div><h2>{demoConversations.length}</h2><span className="muted">Fictional seed records</span></div>
          <div className="panel"><div className="eyebrow">Current event</div><h2>{demoEvent.name}</h2><span className="muted">Example event</span></div>
        </div>
        <h2 style={{marginTop:28}}>Recent conversations</h2>
        {demoConversations.map(c => <div key={c.id} className="list-item" onClick={() => {setSelectedId(c.id);setScreen("Conversations");}}>
          <div className="spread"><strong>{c.title}</strong><span className="pill">{c.status}</span></div>
          <p className="muted">{new Date(c.occurredAt).toLocaleString()} · {c.summary}</p>
        </div>)}
      </>}

      {screen === "Capture" && <div className="panel" style={{maxWidth:620, marginTop:18}}>
        <div className="eyebrow">Consent-aware capture · UI mock only</div>
        <h2>{captureStatus === "mock-recording" ? "Demo recording state" : captureStatus === "stopped" ? "Demo stopped" : "Ready to capture"}</h2>
        <p className="muted">This scaffold does not access a microphone or create an audio file.</p>
        <label className="row" style={{alignItems:"flex-start",margin:"18px 0"}}>
          <input type="checkbox" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} />
          <span>I have completed the appropriate consent checks for this capture. This is a user attestation, not legal verification.</span>
        </label>
        {captureStatus === "mock-recording"
          ? <button className="btn" onClick={() => setCaptureStatus("stopped")}>Stop demo state</button>
          : <button className="btn primary" disabled={!consentChecked} onClick={() => setCaptureStatus("mock-recording")}>Preview mock state</button>}
        <p className="muted" style={{fontSize:12}}>Real recording must wait for native permission and required consent checks; OS restrictions must not be bypassed.</p>
      </div>}

      {screen === "Conversations" && <div className="grid" style={{gridTemplateColumns:"minmax(220px,.85fr) minmax(0,1.5fr)", marginTop:18}}>
        <section>
          <input className="field" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations"/>
          {filtered.map(c => <div key={c.id} className={`list-item ${selectedId === c.id ? "selected" : ""}`} onClick={() => setSelectedId(c.id)}>
            <strong>{c.title}</strong><p className="muted" style={{fontSize:13}}>{c.status}</p>
          </div>)}
        </section>
        <section className="panel">
          <div className="eyebrow">Conversation detail · demo</div><h2>{selected.title}</h2><p className="muted">{selected.summary}</p>
          <h3>Transcript segments</h3>
          {demoSegments.filter(s => s.conversationId === selected.id).map(s => <div className="segment" key={s.id}>
            <div className="spread"><span className="pill">{s.speakerLabel}</span><span className="muted">{Math.floor(s.startMs/1000)}s</span></div>
            <p>{s.text}</p>{s.needsReview && <span className="muted">Speaker/segment needs review</span>}
          </div>)}
          <h3>Linked notes</h3><p className="muted">{demoNotes.find(n => n.conversationId === selected.id)?.body ?? "No sample note for this conversation."}</p>
        </section>
      </div>}

      {screen === "People" && <div style={{marginTop:18}}>{demoPeople.map(p => <div className="list-item" key={p.id}><strong>{p.displayName}</strong><p className="muted">{p.company} · {p.identityConfirmed ? "Confirmed" : "Identity unverified"}</p></div>)}</div>}
      {screen === "Events" && <div className="panel" style={{marginTop:18}}><h2>{demoEvent.name}</h2><p className="muted">{demoEvent.venue} · {demoEvent.timezone}</p><p>{demoConversations.length} sample conversations linked.</p></div>}
      {screen === "AI Chat" && <div className="panel" style={{marginTop:18}}><div className="eyebrow">Mock assistant · no retrieval backend</div><h2>Ask your memory</h2><textarea className="field" rows={3} value={question} onChange={e => setQuestion(e.target.value)} placeholder="What did someone say about…?"/><p className="muted">A production answer must retrieve authorized source segments and cite them. No real model call is connected.</p><button className="btn primary" onClick={() => alert("Mock only. Connect the retrieval API before using this as a factual memory answer.")} disabled={!question.trim()}>Preview question</button></div>}
      {screen === "Notes & Files" && <div className="panel" style={{marginTop:18}}><h2>Notes & files</h2><p className="muted">Future module: versioned notes, private file storage, @ routing, source links, and undo.</p></div>}
      {screen === "Calendar & Tasks" && <div className="panel" style={{marginTop:18}}><h2>Calendar, tasks & reminders</h2><p className="muted">Future module: scheduling, timers, reminders, notifications, and external calendar sync.</p></div>}
    </main>
  </div>;
}
