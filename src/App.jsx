
import { useState } from "react";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzUSF12H4kyMrG_fPY3HutB8eu6npjjC37vb6K7HlQfs-P7f8unck-LJ0Y9y8IvILhApA/exec";

const theme = {
  bg: "#0f0e17",
  surface: "#1a1828",
  card: "#221f35",
  border: "#2e2b45",
  accent: "#7c6af7",
  accentLight: "#a394ff",
  accentGlow: "rgba(124,106,247,0.18)",
  success: "#3ecf8e",
  danger: "#f06565",
  text: "#e8e6f5",
  muted: "#8b87a8",
  gold: "#f5c842",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${theme.bg}; font-family: 'DM Sans', sans-serif; color: ${theme.text}; min-height: 100vh; }
  input, textarea, select {
    background: ${theme.surface};
    border: 1.5px solid ${theme.border};
    color: ${theme.text};
    border-radius: 10px;
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  input:focus, textarea:focus, select:focus {
    border-color: ${theme.accent};
    box-shadow: 0 0 0 3px ${theme.accentGlow};
  }
  select option { background: ${theme.card}; }
  textarea { resize: vertical; min-height: 90px; }
  label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; color: ${theme.muted}; text-transform: uppercase; margin-bottom: 7px; }
  ::placeholder { color: ${theme.muted}; opacity: 0.6; }
`;

function OrbitDecor() {
  return (
    <svg style={{ position: "fixed", top: 0, right: 0, width: 520, height: 520, opacity: 0.12, pointerEvents: "none", zIndex: 0 }} viewBox="0 0 520 520">
      <circle cx="420" cy="100" r="300" fill="none" stroke={theme.accent} strokeWidth="1.5" />
      <circle cx="420" cy="100" r="200" fill="none" stroke={theme.accentLight} strokeWidth="0.8" />
      <circle cx="420" cy="100" r="120" fill="none" stroke={theme.accent} strokeWidth="0.5" />
      <circle cx="420" cy="100" r="8" fill={theme.accent} />
    </svg>
  );
}

function Badge({ children, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 12px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.06em",
      background: color === "accent" ? theme.accentGlow : color === "success" ? "rgba(62,207,142,0.15)" : "rgba(240,101,101,0.15)",
      color: color === "accent" ? theme.accentLight : color === "success" ? theme.success : theme.danger,
      border: `1px solid ${color === "accent" ? theme.accent : color === "success" ? theme.success : theme.danger}`,
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, loading, type = "button" }) {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${theme.accent}, #5b4fe0)`, color: "#fff", border: "none" },
    success: { background: `linear-gradient(135deg, ${theme.success}, #29a86e)`, color: "#fff", border: "none" },
    danger: { background: "transparent", color: theme.danger, border: `1.5px solid ${theme.danger}` },
    ghost: { background: "transparent", color: theme.muted, border: `1.5px solid ${theme.border}` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        padding: "12px 28px",
        borderRadius: 10,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: 14,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
        letterSpacing: "0.02em",
      }}
    >
      {loading ? "Submitting…" : children}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: theme.muted, marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: 18,
      padding: "32px 36px",
      position: "relative",
      zIndex: 1,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── STEP 1: TEAM LEAD FORM ──────────────────────────────────────────────────

function TeamLeadForm({ onSubmitted }) {
  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    teamLeadName: "",
    meetingDate: new Date().toISOString().slice(0, 10),
    connectType: "One-on-One",
    feedbackGiven: "",
    opportunityArea: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const required = ["userName", "userEmail", "teamLeadName", "feedbackGiven", "opportunityArea"];
    if (required.some((k) => !form[k].trim())) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        action: "managerReview",
        ...form,
        submittedAt: new Date().toISOString(),
      };
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
      });
      // no-cors mode: we trust success if no throw
      onSubmitted({ ...form, submittedAt: payload.submittedAt });
    } catch (e) {
      setError("Submission failed. Check your Apps Script URL.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
      <OrbitDecor />
      <div style={{ marginBottom: 36, position: "relative", zIndex: 1 }}>
        <Badge color="accent">Team Lead Portal</Badge>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 38, marginTop: 12, lineHeight: 1.15 }}>
          1-on-1 Feedback<br /><em style={{ color: theme.accentLight }}>Review Form</em>
        </h1>
        <p style={{ color: theme.muted, marginTop: 10, fontSize: 15 }}>
          Document your team member's performance, share feedback, and highlight growth opportunities.
        </p>
      </div>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Team Member Name *">
            <input value={form.userName} onChange={set("userName")} placeholder="Full name" />
          </Field>
          <Field label="Team Member Email *">
            <input type="email" value={form.userEmail} onChange={set("userEmail")} placeholder="email@company.com" />
          </Field>
          <Field label="Team Lead Name *">
            <input value={form.teamLeadName} onChange={set("teamLeadName")} placeholder="Your name" />
          </Field>
          <Field label="Meeting Date *">
            <input type="date" value={form.meetingDate} onChange={set("meetingDate")} />
          </Field>
          <Field label="Connect Type" style={{ gridColumn: "span 2" }}>
            <select value={form.connectType} onChange={set("connectType")}>
              <option>One-on-One</option>
              <option>Team Meeting</option>
              <option>Performance Review</option>
              <option>Check-in</option>
            </select>
          </Field>
        </div>

        <div style={{ borderTop: `1px solid ${theme.border}`, margin: "8px 0 20px" }} />

        <Field label="Feedback Given *" hint="Describe the feedback discussed during the session.">
          <textarea value={form.feedbackGiven} onChange={set("feedbackGiven")} placeholder="Share specific, actionable feedback from the meeting…" style={{ minHeight: 110 }} />
        </Field>
        <Field label="Opportunity Areas *" hint="What areas can the team member grow or improve in?">
          <textarea value={form.opportunityArea} onChange={set("opportunityArea")} placeholder="List key development areas and action items…" />
        </Field>

        {error && (
          <p style={{ color: theme.danger, fontSize: 13, marginBottom: 16 }}>⚠ {error}</p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn onClick={handleSubmit} loading={loading}>Submit & Notify Employee →</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── STEP 2: CONFIRMATION AFTER LEAD SUBMITS ──────────────────────────────────

function LeadConfirmation({ data, onReset }) {
  const reviewLink = `${window.location.origin}${window.location.pathname}?review=1&user=${encodeURIComponent(data.userName)}&lead=${encodeURIComponent(data.teamLeadName)}&date=${encodeURIComponent(data.meetingDate)}&feedback=${encodeURIComponent(data.feedbackGiven)}&opportunity=${encodeURIComponent(data.opportunityArea)}&email=${encodeURIComponent(data.userEmail)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(reviewLink);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
      <OrbitDecor />
      <Card style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30 }}>Form Submitted!</h2>
        <p style={{ color: theme.muted, margin: "12px 0 28px", fontSize: 15 }}>
          The feedback has been saved to Google Sheets. Share this link with <strong style={{ color: theme.text }}>{data.userName}</strong> so they can review and respond.
        </p>

        <div style={{
          background: theme.surface,
          border: `1px dashed ${theme.accent}`,
          borderRadius: 10,
          padding: "14px 18px",
          wordBreak: "break-all",
          fontSize: 12,
          color: theme.accentLight,
          marginBottom: 20,
          textAlign: "left",
        }}>
          {reviewLink}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn onClick={copyLink} variant="ghost">📋 Copy Link</Btn>
          <Btn onClick={onReset} variant="ghost">+ New Review</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── STEP 3: EMPLOYEE RESPONSE FORM ───────────────────────────────────────────

function EmployeeResponseForm({ params }) {
  const [decision, setDecision] = useState(null); // "accept" | "reject"
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!decision) { setError("Please accept or reject the feedback."); return; }
    setError("");
    setLoading(true);
    try {
      const payload = {
        action: "employeeResponse",
        userName: params.user,
        userEmail: params.email,
        teamLeadName: params.lead,
        meetingDate: params.date,
        feedbackGiven: params.feedback,
        opportunityArea: params.opportunity,
        feedbackStatus: decision === "accept" ? "Accepted" : "Rejected",
        employeeNote: note,
        respondedAt: new Date().toISOString(),
      };
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
      });
      setSubmitted(true);
    } catch {
      setError("Submission failed. Please try again.");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "48px 24px" }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{decision === "accept" ? "🎯" : "📝"}</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28 }}>
            Response Recorded
          </h2>
          <p style={{ color: theme.muted, marginTop: 10 }}>
            Your {decision === "accept" ? "acceptance" : "response"} has been saved. Thank you for participating in this feedback session.
          </p>
          <div style={{ marginTop: 24 }}>
            <Badge color={decision === "accept" ? "success" : "danger"}>
              {decision === "accept" ? "✓ Feedback Accepted" : "✗ Feedback Rejected"}
            </Badge>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "48px 24px" }}>
      <OrbitDecor />
      <div style={{ marginBottom: 32, position: "relative", zIndex: 1 }}>
        <Badge color="accent">Employee Review</Badge>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, marginTop: 10, lineHeight: 1.2 }}>
          Your 1-on-1 Feedback<br /><em style={{ color: theme.accentLight }}>is Ready to Review</em>
        </h1>
        <p style={{ color: theme.muted, marginTop: 10, fontSize: 14 }}>
          Reviewed by <strong style={{ color: theme.text }}>{params.lead}</strong> · {params.date}
        </p>
      </div>

      {/* Feedback cards */}
      <div style={{ display: "grid", gap: 16, marginBottom: 28 }}>
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderLeft: `4px solid ${theme.accent}`,
          borderRadius: 12,
          padding: "20px 22px",
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: theme.muted, textTransform: "uppercase", marginBottom: 8 }}>Feedback Given</p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: theme.text }}>{params.feedback}</p>
        </div>
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderLeft: `4px solid ${theme.gold}`,
          borderRadius: 12,
          padding: "20px 22px",
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: theme.muted, textTransform: "uppercase", marginBottom: 8 }}>Opportunity Areas</p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: theme.text }}>{params.opportunity}</p>
        </div>
      </div>

      <Card>
        <p style={{ fontWeight: 600, marginBottom: 18, fontSize: 15 }}>How do you respond to this feedback?</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          {["accept", "reject"].map((opt) => (
            <button
              key={opt}
              onClick={() => setDecision(opt)}
              style={{
                background: decision === opt
                  ? (opt === "accept" ? "rgba(62,207,142,0.15)" : "rgba(240,101,101,0.15)")
                  : theme.surface,
                border: `2px solid ${decision === opt ? (opt === "accept" ? theme.success : theme.danger) : theme.border}`,
                borderRadius: 12,
                padding: "18px 12px",
                cursor: "pointer",
                color: opt === "accept" ? theme.success : theme.danger,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 28 }}>{opt === "accept" ? "✓" : "✗"}</span>
              {opt === "accept" ? "Accept Feedback" : "Reject Feedback"}
            </button>
          ))}
        </div>

        <Field label="Your Note / Comments" hint="Optional: share your thoughts, context, or any disagreements.">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your response here…"
            style={{ minHeight: 100 }}
          />
        </Field>

        {error && <p style={{ color: theme.danger, fontSize: 13, marginBottom: 14 }}>⚠ {error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn
            onClick={handleSubmit}
            loading={loading}
            variant={decision === "accept" ? "success" : decision === "reject" ? "danger" : "primary"}
          >
            Submit Response →
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ── APP ROUTER ────────────────────────────────────────────────────────────────

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isReview = params.get("review") === "1";

  const [view, setView] = useState("lead"); // "lead" | "confirmation"
  const [submittedData, setSubmittedData] = useState(null);

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: "100vh", background: theme.bg, paddingBottom: 60 }}>
        {/* Top nav */}
        <div style={{
          borderBottom: `1px solid ${theme.border}`,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "relative",
          zIndex: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${theme.accent}, #5b4fe0)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>💬</div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, letterSpacing: "-0.01em" }}>OneOnOne</span>
          <span style={{ marginLeft: "auto", color: theme.muted, fontSize: 12 }}>
            {isReview ? "Employee Review Portal" : "Team Lead Portal"}
          </span>
        </div>

        {isReview ? (
          <EmployeeResponseForm params={{
            user: params.get("user") || "",
            lead: params.get("lead") || "",
            date: params.get("date") || "",
            feedback: params.get("feedback") || "",
            opportunity: params.get("opportunity") || "",
            email: params.get("email") || "",
          }} />
        ) : view === "lead" ? (
          <TeamLeadForm onSubmitted={(data) => { setSubmittedData(data); setView("confirmation"); }} />
        ) : (
          <LeadConfirmation data={submittedData} onReset={() => setView("lead")} />
        )}
      </div>
    </>
  );
}
