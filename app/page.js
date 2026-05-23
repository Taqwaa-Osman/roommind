"use client";

import { useState } from "react";

const DEFAULT_ITEMS = [
  "Bed frame",
  "Bedding / duvet",
  "Lamp",
  "Rug",
  "Wall color",
  "Curtains",
];

export default function Home() {
  const [photo, setPhoto] = useState(null);
  const [items, setItems] = useState(
    DEFAULT_ITEMS.map((label, i) => ({ id: i, label, decision: null }))
  );
  const [newItem, setNewItem] = useState("");
  const [style, setStyle] = useState("Japandi");
  const [budget, setBudget] = useState("$200");
  const [city, setCity] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const allDecided = items.length > 0 && items.every((i) => i.decision);

  function setDecision(id, decision) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, decision } : i))
    );
  }

  function addItem() {
    if (!newItem.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now(), label: newItem.trim(), decision: null },
    ]);
    setNewItem("");
  }

  async function generatePlan() {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, style, budget, city }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed");
      setPlan(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  const card = {
    background: "#fff",
    border: "1px solid #e6e3da",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  };

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 80px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 4px" }}>
        RoomMind
      </h1>
      <p style={{ color: "#6b6a64", margin: "0 0 28px" }}>
        Tell us what to keep. We&rsquo;ll plan the rest.
      </p>

      <div style={card}>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            border: "1.5px dashed #cbc8bd",
            borderRadius: 8,
            padding: 28,
            cursor: "pointer",
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt="your room"
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          ) : (
            <span style={{ color: "#6b6a64" }}>Tap to upload your room photo</span>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = (ev) => setPhoto(ev.target.result);
              r.readAsDataURL(f);
            }}
          />
        </label>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 12px" }}>
          What stays, what changes?
        </h2>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 0",
              borderBottom: "1px solid #f0eee7",
            }}
          >
            <span style={{ flex: 1 }}>{it.label}</span>
            <button
              onClick={() => setDecision(it.id, "keep")}
              style={pill(it.decision === "keep", "#1a7d4f")}
            >
              Keep
            </button>
            <button
              onClick={() => setDecision(it.id, "change")}
              style={pill(it.decision === "change", "#b3621a")}
            >
              Change
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add another item…"
            style={{
              flex: 1,
              padding: "8px 10px",
              border: "1px solid #d8d5cb",
              borderRadius: 8,
            }}
          />
          <button onClick={addItem} style={pill(false, "#444")}>
            Add
          </button>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Style">
            <input value={style} onChange={(e) => setStyle(e.target.value)} style={inp} />
          </Field>
          <Field label="Budget">
            <input value={budget} onChange={(e) => setBudget(e.target.value)} style={inp} />
          </Field>
          <Field label="Your city (for local links)">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ottawa" style={inp} />
          </Field>
        </div>
      </div>

      <button
        onClick={generatePlan}
        disabled={!allDecided || loading}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 10,
          border: "none",
          fontSize: 16,
          fontWeight: 600,
          cursor: allDecided && !loading ? "pointer" : "not-allowed",
          background: allDecided && !loading ? "#1c1c1a" : "#d8d5cb",
          color: "#fff",
        }}
      >
        {loading ? "Thinking…" : allDecided ? "Build my plan" : "Decide on every item first"}
      </button>

      {error && (
        <p style={{ color: "#b3261e", marginTop: 16 }}>
          {error}
        </p>
      )}

      {plan && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 19, fontWeight: 600 }}>Your plan</h2>
          <p style={{ color: "#3d3d3a" }}>{plan.summary}</p>
          {(plan.changes || []).map((c, i) => (
            <div key={i} style={card}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{c.item}</div>
              <div style={{ marginBottom: 6 }}>
                Buy: {c.buy} <span style={{ color: "#6b6a64" }}>{c.cost}</span>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                {c.links?.amazon && <a href={c.links.amazon} target="_blank" rel="noreferrer">Amazon</a>}
                {c.links?.kijiji && <a href={c.links.kijiji} target="_blank" rel="noreferrer">Kijiji</a>}
                {c.links?.google && <a href={c.links.google} target="_blank" rel="noreferrer">Search near me</a>}
              </div>
              <div style={{ color: "#6b6a64", fontSize: 14 }}>
                No-buy option: {c.noBuy}
              </div>
            </div>
          ))}
          {plan.timeline && (
            <div style={card}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Suggested order</div>
              <ol style={{ margin: 0, paddingLeft: 20, color: "#3d3d3a", lineHeight: 1.7 }}>
                {plan.timeline.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function pill(active, color) {
  return {
    padding: "6px 14px",
    borderRadius: 8,
    border: `1px solid ${active ? color : "#d8d5cb"}`,
    background: active ? color : "#fff",
    color: active ? "#fff" : "#6b6a64",
    fontWeight: 500,
    cursor: "pointer",
  };
}

const inp = {
  padding: "8px 10px",
  border: "1px solid #d8d5cb",
  borderRadius: 8,
  width: "100%",
  boxSizing: "border-box",
};

function Field({ label, children }) {
  return (
    <label style={{ flex: "1 1 160px", fontSize: 13, color: "#6b6a64" }}>
      {label}
      <div style={{ marginTop: 4 }}>{children}</div>
    </label>
  );
}
