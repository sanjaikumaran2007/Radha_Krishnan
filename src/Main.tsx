import { useEffect, useRef, useState } from "react";
import { Content, elapsed, chime } from "./lib";
import { Feather } from "./art";

const TABS = ["Our Story", "Timeline", "Memories", "Memory Lane", "Love Letters", "Love Quotes", "Our Journey", "Long Distance", "Anniversary Cake"];
const Divider = () => <div className="divider" aria-hidden>🪷 <Feather className="mini" /> 🪷</div>;

export function Main({ c, now, onFinal }: { c: Content; now: () => number; onFinal: () => void }) {
  const [tab, setTab] = useState(0);
  const name = TABS[tab];
  return (
    <div className="shell">
      <section className="panel" key={tab}>
        {name === "Our Story" && <><h2 className="hand">Our Story</h2><p className="prose">{c.config.welcome_text}</p></>}
        {name === "Timeline" && <Timeline items={c.timeline} />}
        {name === "Memories" && <Gallery photos={c.photos} />}
        {name === "Memory Lane" && <MemoryLane photos={c.photos} />}
        {name === "Love Letters" && <Letters items={c.letters} />}
        {name === "Love Quotes" && <Quotes items={c.quotes} />}
        {name === "Our Journey" && <Journey start={Date.parse(c.config.start_at)} now={now} />}
        {name === "Long Distance" && <LongDistance />}
        {name === "Anniversary Cake" && <Cake onFinal={onFinal} />}
      </section>
      <nav className="nav" aria-label="Sections">
        {TABS.map((t, i) => <button key={t} aria-current={tab === i} onClick={() => setTab(i)}>{t}</button>)}
      </nav>
    </div>
  );
}

function Timeline({ items }: { items: any[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (<><h2 className="hand">Our Love Timeline</h2><Divider />
    <ol className="tl">{items.map((t) => (
      <li key={t.id}><button aria-expanded={open === t.id} onClick={() => setOpen(open === t.id ? null : t.id)}>
        <small>{t.date_label}</small><b>{t.title}</b><em className="hand">{t.quote}</em></button>
        {open === t.id && <div className="more">{t.photo_url && <img src={t.photo_url} alt={t.title} loading="lazy" />}<p>{t.body}</p></div>}</li>))}
    </ol></>);
}

function Gallery({ photos }: { photos: any[] }) {
  const [i, setI] = useState<number | null>(null);
  const go = (d: number) => setI((x) => (x === null ? x : (x + d + photos.length) % photos.length));
  useEffect(() => {
    if (i === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setI(null); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [i, photos.length]);
  return (<><h2 className="hand">Our Memories</h2><Divider />
    {!photos.length && <p className="sub">Photographs will appear here once added.</p>}
    <div className="masonry">{photos.map((p, n) => (
      <figure key={p.id} onClick={() => setI(n)}><img src={p.url} alt={p.caption || "Memory"} loading="lazy" decoding="async" />
        <figcaption>{p.caption}</figcaption></figure>))}</div>
    {i !== null && photos[i] && (
      <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setI(null)}>
        <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }}>‹</button>
        <figure onClick={(e) => e.stopPropagation()} key={i}><img src={photos[i].url} alt={photos[i].caption || ""} />
          <figcaption>{photos[i].caption} <small>{photos[i].taken_on}</small></figcaption></figure>
        <button aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }}>›</button>
        <button className="x" aria-label="Close" onClick={() => setI(null)}>✕</button>
      </div>)}
  </>);
}

function Letters({ items }: { items: any[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (<><h2 className="hand">Letters My Heart Wrote for You 💌</h2><Divider />
    <div className="letters">{items.map((l) => (
      <article key={l.id} className={open === l.id ? "open" : ""}>
        <button aria-expanded={open === l.id} onClick={() => setOpen(open === l.id ? null : l.id)}>💌 {l.title}</button>
        <div className="paper"><p className="prose">{l.body}</p></div></article>))}</div></>);
}

function Quotes({ items }: { items: any[] }) {
  const [i, setI] = useState(0);
  useEffect(() => { if (!items.length) return; const t = setInterval(() => setI((x) => (x + 1) % items.length), 7000); return () => clearInterval(t); }, [items.length]);
  if (!items.length) return null;
  return (<><h2 className="hand">A Few Words From My Heart.</h2><Divider />
    <blockquote key={i} className="hand big fade">“{items[i].text}”</blockquote>
    <div className="row"><button className="ghost" onClick={() => setI((i - 1 + items.length) % items.length)}>‹</button>
      <button className="ghost" onClick={() => setI((i + 1) % items.length)}>›</button></div></>);
}

function Journey({ start, now }: { start: number; now: () => number }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(t); }, []);
  const e = elapsed(start, now());
  const parts: [string, number][] = [["Years", e.y], ["Months", e.m], ["Days", e.d], ["Hours", e.h], ["Minutes", e.mi], ["Seconds", e.s]];
  return (<><h2 className="hand">Every Second With You Matters.</h2><Divider />
    <div className="count small">{parts.map(([l, v]) => <div key={l}><b>{String(v).padStart(2, "0")}</b><small>{l}</small></div>)}</div>
    <p className="hand big">Together for more than {e.days.toLocaleString("en-IN")} days...</p></>);
}

function CakeSvg({ half }: { half?: "l" | "r" }) {
  return (
    <svg viewBox="0 0 300 300" className="cakesvg" style={half ? { clipPath: half === "l" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)" } : undefined} aria-hidden>
      <rect x="40" y="190" width="220" height="70" rx="10" fill="#FFF4E6" /><path d="M40 200q18 18 36 0t36 0 36 0 36 0 36 0 36 0V190H40z" fill="#F3B8CD" />
      <rect x="70" y="130" width="160" height="60" rx="9" fill="#FFF4E6" /><path d="M70 140q16 16 32 0t32 0 32 0 32 0 32 0V130H70z" fill="#F3B8CD" />
      <rect x="100" y="80" width="100" height="50" rx="8" fill="#F3B8CD" /><rect x="40" y="245" width="220" height="5" fill="#D6B56D" /><rect x="70" y="178" width="160" height="4" fill="#D6B56D" />
      <rect x="60" y="222" width="180" height="9" rx="4.5" fill="#D6B56D" />{[90, 115, 140, 165, 190, 205].map((x) => <circle key={x} cx={x} cy="226.5" r="2.2" fill="#071629" />)}
      {[110, 126, 142, 158, 174, 190].map((x) => (<g key={x}><rect x={x} y="58" width="4" height="22" fill="#087F8C" /><ellipse className="flame" cx={x + 2} cy="52" rx="3.5" ry="7" fill="#D6B56D" /></g>))}
      <path d="M192 84c18-22 30-26 40-24-6 6-12 20-40 24z" fill="#146B50" /><circle cx="224" cy="68" r="4" fill="#173E68" stroke="#D6B56D" />
    </svg>
  );
}

function Cake({ onFinal }: { onFinal: () => void }) {
  const [cut, setCut] = useState(false);
  const start = useRef<[number, number] | null>(null);
  const doCut = () => { if (cut) return; setCut(true); chime(); };
  return (<>
    <h2 className="hand">Six Years of Us... Six Years of Love 💙</h2>
    <p className="sub">{cut ? "Six beautiful years, countless memories, and a story that is still being written." : "Ready for your little surprise?"}</p>
    <div className={`cake ${cut ? "cut" : ""}`} style={{ touchAction: "none" }}
      onPointerDown={(e) => { start.current = [e.clientX, e.clientY]; (e.currentTarget as any).setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { const s = start.current; if (s && Math.abs(e.clientX - s[0]) > 90 && Math.abs(e.clientY - s[1]) < 70) { start.current = null; doCut(); } }}
      onPointerUp={() => (start.current = null)}>
      <div className="half l"><CakeSvg half="l" /></div><div className="half r"><CakeSvg half="r" /></div>
    </div>
    {!cut && <><p className="hand big">Swipe across the cake to cut our anniversary cake.</p><button className="ghost" onClick={doCut}>Cut the cake</button></>}
    {cut && <>
      <div className="burst" aria-hidden>{Array.from({ length: 40 }, (_, i) => <span key={i} style={{ left: `${(i * 2.5) % 100}%`, animationDelay: `${(i % 10) * 0.15}s` }}>{["✨", "💙", "🦚", "🪷"][i % 4]}</span>)}</div>
      <h3 className="hand big gold">HAPPY 6 YEARS OF US! 💙🦚</h3><p className="gold">28.10.2020 — 28.10.2026</p>
      <button className="glow" onClick={onFinal}>Open Your Final Surprise 💌</button></>}
  </>);
}
const FALLBACK = ["My favourite moment.", "A memory I would live again.", "One photograph, a thousand feelings.", "Little moments that became our forever.", "Some memories never fade.", "Every picture has a story, and every story leads me back to you."];

function MemoryLane({ photos }: { photos: any[] }) {
  const [auto, setAuto] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    if (!auto) return;
    let raf = 0, last = 0, pos = 0;
    const step = (t: number) => {
      pos += (t - last) * 0.045; last = t; // about 45 px per second
      scrollTo(0, pos);
      if (innerHeight + pos >= document.documentElement.scrollHeight - 4) { setAuto(false); return; }
      raf = requestAnimationFrame(step);
    };
    const go = setTimeout(() => { pos = scrollY; last = performance.now(); raf = requestAnimationFrame(step); }, 1500);
    const stop = (e: Event) => { if ((e.target as HTMLElement)?.closest?.(".autobtn")) return; setAuto(false); };
    addEventListener("wheel", stop, { passive: true }); addEventListener("touchstart", stop, { passive: true }); addEventListener("keydown", stop);
    return () => { clearTimeout(go); cancelAnimationFrame(raf); removeEventListener("wheel", stop); removeEventListener("touchstart", stop); removeEventListener("keydown", stop); };
  }, [auto]);
  if (!photos.length) return (<><h2 className="hand">Memory Lane</h2><p className="sub">Photographs will appear here once added.</p></>);
  return (<><h2 className="hand">Memory Lane</h2><Divider />
    <div className="lane">{photos.map((p, i) => (
      <article key={p.id} className={`memo ${i % 2 ? "flip" : ""}`}>
        <img src={p.url} alt={p.caption || "Memory"} loading="lazy" decoding="async" />
        <div className="txt"><p className="hand big">{p.caption || FALLBACK[i % FALLBACK.length]}</p><small>{p.taken_on}</small></div>
      </article>))}</div>
    <button className="ghost autobtn" onClick={() => setAuto(!auto)}>{auto ? "Pause ❚❚" : "Auto-scroll ▶"}</button></>);
}
const FROM = "Coimbatore", TO = "Bangalore", SURPRISE = "January 2027";
const ROUTE = "M164 327 C175 322 185 310 198 299 C204 288 198 275 200 263 C196 255 190 250 182 244";
const LAND = "M49 30 L348 30 L345 43 C335 60 320 70 316 77 C305 90 292 98 285 107 C272 140 262 165 252 183 C256 205 258 225 260 239 C255 262 250 276 246 289 C248 310 249 325 248 337 C244 360 238 385 232 399 C215 420 195 440 180 453 C165 430 150 395 142 369 C125 330 112 285 101 246 C92 215 84 185 78 157 C68 120 58 70 49 30 Z";
const CYCLE = "12s", ARRIVE = 0.85; // the ride takes 85% of the loop, the reunion the rest

const when = (a: number, b: number) => (a === 0 ? { values: "1;0", keyTimes: `0;${b}` } : { values: "0;1;0", keyTimes: `0;${a};${b}` });
const Fade = ({ a, b, children }: { a: number; b: number; children: any }) => (
  <g opacity={a === 0 ? 1 : 0}><animate attributeName="opacity" calcMode="discrete" dur={CYCLE} repeatCount="indefinite" {...when(a, b)} />{children}</g>
);
const Bubble = ({ x, y, w, text, tx }: { x: number; y: number; w: number; text: string; tx?: number }) => {
  const t = tx ?? x + w / 2;
  return (<g><rect x={x} y={y} width={w} height="20" rx="9" fill="#FFF4E6" opacity=".95" /><path d={`M${t - 4} ${y + 19} l4 7 l4 -7z`} fill="#FFF4E6" opacity=".95" />
    <text x={x + w / 2} y={y + 13.5} textAnchor="middle" className="say">{text}</text></g>);
};

const Girl = () => (
  <g transform="translate(150 246)">
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -7;0 0;0 -7;0 0" keyTimes="0;0.85;0.89;0.93;0.97;1" dur={CYCLE} repeatCount="indefinite" />
      <path d="M-8 -36 C-12 -26 -11 -14 -7 -10 L7 -10 C11 -14 12 -26 8 -36 Z" fill="#1b1020" />
      <path d="M-2.5 -10 L-2.5 0 M2.5 -10 L2.5 0" stroke="#e2b48c" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="-3" cy="0.5" rx="3" ry="1.5" fill="#332448" /><ellipse cx="3" cy="0.5" rx="3" ry="1.5" fill="#332448" />
      <path d="M-6 -22 L6 -22 L10 -8 L-10 -8 Z" fill="#F3B8CD" /><rect x="-5" y="-27" width="10" height="7" rx="2" fill="#F3B8CD" />
      <rect x="-5.5" y="-20" width="11" height="2" fill="#087F8C" /><path d="M-10 -8 L10 -8" stroke="#D6B56D" strokeWidth="1.2" />
      <path d="M-5 -24 L-8 -14" stroke="#e2b48c" strokeWidth="2.2" strokeLinecap="round" />
      <g transform="translate(5 -24)">
        <animateTransform attributeName="transform" type="rotate" additive="sum" values="-18 0 0;18 0 0;-18 0 0" dur="1.1s" repeatCount="indefinite" />
        <path d="M0 0 L6 -10" stroke="#e2b48c" strokeWidth="2.2" strokeLinecap="round" /><circle cx="6" cy="-11" r="1.6" fill="#e2b48c" />
      </g>
      <circle cx="0" cy="-32" r="6.5" fill="#f1c9a5" />
      <path d="M-7 -33 A7 7 0 0 1 7 -33 C4 -37 -4 -37 -7 -33Z" fill="#1b1020" />
      <circle cx="5" cy="-36" r="2" fill="#F3B8CD" stroke="#D6B56D" strokeWidth=".6" />
      <circle cx="-2.4" cy="-32" r=".8" fill="#1b1020" /><circle cx="2.4" cy="-32" r=".8" fill="#1b1020" />
      <circle cx="-4.2" cy="-30.2" r="1.2" fill="#F3B8CD" opacity=".8" /><circle cx="4.2" cy="-30.2" r="1.2" fill="#F3B8CD" opacity=".8" />
      <path d="M-2.5 -29.4 Q0 -27 2.5 -29.4" stroke="#b5485f" strokeWidth="1" fill="none" />
    </g>
  </g>
);

const Rider = () => (
  <g>
    <animateMotion dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes={`0;${ARRIVE};1`}><mpath href="#route" /></animateMotion>
    <g>
      <animateTransform attributeName="transform" type="scale" calcMode="discrete" values="1 1;-1 1" keyTimes="0;0.6" dur={CYCLE} repeatCount="indefinite" />
      {[-11, 11].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="0" r="7" fill="#071629" stroke="#FFF4E6" strokeWidth="1.8" /><line x1={cx} y1="-6" x2={cx} y2="6" stroke="#D6B56D" strokeWidth="1" />
          <animateTransform attributeName="transform" type="rotate" values={`0 ${cx} 0;1080 ${cx} 0;1080 ${cx} 0`} keyTimes={`0;${ARRIVE};1`} dur={CYCLE} repeatCount="indefinite" />
        </g>
      ))}
      <path d="M-11 0 L-4 -7 L6 -7 L11 0" stroke="#D6B56D" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <rect x="-3" y="-13" width="10" height="6" rx="3" fill="#087F8C" />
      <path d="M6 -7 L8 -14 L12 -14" stroke="#FFF4E6" strokeWidth="1.6" fill="none" /><circle cx="13" cy="-12" r="1.6" fill="#D6B56D" />
      <path d="M-6 -10 L-3 -24 L4 -23 L3 -10Z" fill="#173E68" />
      <path d="M0 -20 L8 -14" stroke="#173E68" strokeWidth="3" strokeLinecap="round" />
      <path d="M-1 -10 L4 -4 L3 1" stroke="#2b2233" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="1.5" cy="-29" r="5.2" fill="#e2b48c" /><path d="M-4 -30 A5.6 5.6 0 0 1 7 -30 Z" fill="#146B50" />
      <circle cx="4.2" cy="-28.6" r=".8" fill="#1b1020" /><path d="M2.5 -26.4 Q4.5 -24.8 6 -26.6" stroke="#8a3b2e" strokeWidth=".9" fill="none" />
    </g>
  </g>
);

function LongDistance() {
  const hearts: [number, number, string][] = [[158, 0, "💙"], [172, 0.02, "💕"], [165, 0.04, "✨"]];
  return (<><h2 className="hand">Different places, one heart 💙</h2>
    <p className="sub">Distance means so little when someone means so much.</p>
    <svg viewBox="0 0 360 480" className="route" role="img" aria-label={`A man rides a motorbike from ${FROM} to meet the girl waiting in ${TO}`}>
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2a4a" /><stop offset="1" stopColor="#071629" /></linearGradient>
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#146B50" /><stop offset="1" stopColor="#087F8C" /></linearGradient>
      </defs>
      <rect width="360" height="480" fill="url(#sea)" />
      <text x="14" y="300" className="state">ARABIAN SEA</text><text x="250" y="420" className="state">BAY OF BENGAL</text>
      <path d={LAND} fill="url(#land)" fillOpacity=".38" stroke="#D6B56D" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="110" y="150" className="state">KARNATAKA</text><text x="160" y="365" className="state">TAMIL NADU</text><text x="215" y="115" className="state">ANDHRA</text>
      <path d={ROUTE} fill="none" stroke="#D6B56D" strokeOpacity=".35" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      <path id="route" d={ROUTE} pathLength="1" fill="none" stroke="#D6B56D" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1">
        <animate attributeName="stroke-dashoffset" values="1;0;0" keyTimes={`0;${ARRIVE};1`} dur={CYCLE} repeatCount="indefinite" />
      </path>
      {([[198, 299, "Salem"], [200, 263, "Krishnagiri"]] as [number, number, string][]).map(([x, y, n]) => (<g key={n}><circle cx={x} cy={y} r="3.5" fill="#087F8C" /><text x={x + 8} y={y + 4} className="city">{n}</text></g>))}
      <circle cx="164" cy="327" r="5" fill="#F3B8CD" /><text x="154" y="342" textAnchor="end" className="city big">{FROM}</text>
      <circle cx="182" cy="244" r="5" fill="#F3B8CD" /><text x="150" y="266" textAnchor="middle" className="city big">{TO}</text>
      <Girl />
      <Fade a={0} b={ARRIVE}><Bubble x={102} y={172} w={96} text="Waiting for you 💙" /></Fade>
      <Fade a={ARRIVE} b={1}><Bubble x={109} y={172} w={82} text="You're here! 💕" /></Fade>
      <Fade a={0} b={0.45}><Bubble x={84} y={298} w={84} tx={158} text="On my way! 💙" /></Fade>
      {hearts.map(([x, d, e], i) => (
        <text key={i} x={x} fontSize="12" textAnchor="middle" opacity="0">{e}
          <animate attributeName="opacity" values="0;0;1;0" keyTimes={`0;${ARRIVE + d};${ARRIVE + d + 0.05};1`} dur={CYCLE} repeatCount="indefinite" />
          <animate attributeName="y" values="212;212;196;170" keyTimes={`0;${ARRIVE + d};${ARRIVE + d + 0.05};1`} dur={CYCLE} repeatCount="indefinite" />
        </text>))}
      <Rider />
    </svg>
    <p className="hand big">Every kilometre leads back to you.</p>
    <div className="soon"><span className="hand big">A surprise is coming in {SURPRISE}…</span><b>Coming soon 🎁💙</b></div>
  </>);
}