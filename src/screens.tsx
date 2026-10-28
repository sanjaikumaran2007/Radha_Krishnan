import { useEffect, useRef, useState } from "react";
import { fn, Clock, Content } from "./lib";
import { Corners, Flute, Feather } from "./art";

export function Countdown({ clock, onZero }: { clock: Clock; onZero: () => void }) {
  const [ms, setMs] = useState(Math.max(0, clock.reveal - clock.now()));
  const last = useRef(0);
  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.max(0, clock.reveal - clock.now());
      setMs(r);
      if (r === 0 && Date.now() - last.current > 2000) { last.current = Date.now(); onZero(); }
    }, 250);
    return () => clearInterval(t);
  }, [clock]);
  const s = Math.floor(ms / 1000);
  const parts: [string, number][] = [["Days", Math.floor(s / 86400)], ["Hours", Math.floor((s % 86400) / 3600)], ["Minutes", Math.floor((s % 3600) / 60)], ["Seconds", s % 60]];
  return (
    <main className="scr"><Corners />
      <Flute /><span className="lotus" aria-hidden>🪷</span>
      <h1 className="hand">Some stories are written by destiny...</h1>
      <p className="sub">And some become eternal, just like Radha and Krishna.</p>
      <div className="count" role="timer" aria-live="off">
        {parts.map(([l, v], i) => (<div key={l}><b>{String(v).padStart(2, "0")}</b><small>{l}</small>{i < 3 && <i>:</i>}</div>))}
      </div>
      <p className="hand small">Something special is waiting for you, my love. 💙</p>
    </main>
  );
}

export function Loading({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(0);
  useEffect(() => { const a = setTimeout(() => setLine(1), 1800), b = setTimeout(onDone, 3600); return () => { clearTimeout(a); clearTimeout(b); }; }, []);
  return (
    <main className="scr load"><Flute /><Feather className="sway" />
      <p className="hand big" key={line}>{line === 0 ? "Every melody reminds me of you..." : "Preparing our little universe of love... 💙"}</p>
    </main>
  );
}

export function Passcode({ onUnlock }: { onUnlock: (c: Content) => void }) {
  const [code, setCode] = useState(""), [err, setErr] = useState(""), [shake, setShake] = useState(false), [busy, setBusy] = useState(false), [ok, setOk] = useState(false);
  const submit = async () => {
    if (code.length !== 8) { setErr("Please enter exactly 8 digits."); return; }
    setBusy(true); setErr("");
    try { const d = await fn("verify-passcode", { code }); setOk(true); setTimeout(() => onUnlock(d), 1400); }
    catch (e: any) { setErr(e.message); setShake(true); setTimeout(() => setShake(false), 500); setCode(""); }
    setBusy(false);
  };
  return (
    <main className="scr"><Corners />
      <span className="couple" aria-hidden>🪈💙🪷</span>
      <h1 className="hand">Our love has a little secret... 💙</h1>
      <p className="sub">Only my favourite person can unlock this little world.</p>
      <div className={`pass ${shake ? "shake" : ""}`}>
        <input type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={code} aria-label="8-digit passcode"
          placeholder="Enter our secret 8-digit passcode" onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button className="glow" disabled={busy || ok} onClick={submit}>Unlock My Heart 🦚</button>
      </div>
      <p role="alert" className="err">{err}</p>
      <p className="hint">Think of the little things that make our story special...</p>
      {ok && <div className="burst" aria-hidden>{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ left: `${(i * 6.4) % 100}%`, animationDelay: `${(i % 6) * 0.1}s` }}>{i % 2 ? "💙" : "🪶"}</span>)}</div>}
    </main>
  );
}

export function Welcome({ text, onEnter }: { text: string; onEnter: () => void }) {
  return (
    <main className="scr welcome"><Corners /><Flute /><span className="heart" aria-hidden>💙</span>
      <h1 className="hand">Welcome to Our Little Universe, My Love 💙</h1>
      <p className="prose">{text}</p>
      <button className="glow" onClick={onEnter}>Enter Our Love Story ✨</button>
    </main>
  );
}

export function Final({ c, onReplay }: { c: Content; onReplay: () => void }) {
  return (
    <main className="scr final"><Corners /><Feather className="fall" /><Flute />
      <h1 className="hand">Happy 6th Anniversary, My Love! 💙</h1>
      <p className="gold">28 October 2020 — 28 October 2026</p>
      <p className="prose">{c.config.final_message}</p>
      <p className="hand big sign">{c.config.signature}</p>
      <button className="glow" onClick={onReplay}>Replay Our Story ↺</button>
    </main>
  );
}
