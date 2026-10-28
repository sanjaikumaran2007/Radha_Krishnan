import { useEffect, useRef, useState } from "react";
import { fn, syncClock, Clock, Content, sb } from "./lib";
import { Countdown, Loading, Passcode, Welcome, Final } from "./screens";
import { Main } from "./Main";
import { Admin } from "./Admin";
import { Sparkles } from "./art";

type Stage = "boot" | "countdown" | "loading" | "passcode" | "welcome" | "main" | "final";

export default function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => { const f = () => setHash(location.hash); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  const [clock, setClock] = useState<Clock | null>(null);
  const [stage, setStage] = useState<Stage>("boot");
  const [c, setC] = useState<Content | null>(null);
  const [err, setErr] = useState("");
  const preview = hash === "#/preview";
  const [snd, setSnd] = useState(localStorage.getItem("sound") === "on");
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (hash.startsWith("#/admin")) return;
    (async () => {
      try {
        const k = await syncClock(); setClock(k);
        if (preview) { const { data } = await sb.auth.getSession(); if (!data.session) { setErr("Sign in at #/admin first to preview."); return; }
          setC(await fn("verify-passcode", { preview: true })); setStage("loading"); }
        else setStage(k.now() >= k.reveal ? "passcode" : "countdown");
      } catch { setErr("Couldn't reach the server. Please refresh."); }
    })();
  }, [preview]);

  const onZero = async () => { const k = await syncClock(); setClock(k); if (k.now() >= k.reveal) setStage("loading"); };
  const play = () => { if (!c?.config.music_url) return; audio.current = audio.current || Object.assign(new Audio(c.config.music_url), { loop: true, volume: 0.4 }); audio.current.play().catch(() => {}); };
  const toggle = () => { const n = !snd; setSnd(n); localStorage.setItem("sound", n ? "on" : "off"); n ? play() : audio.current?.pause(); };
  useEffect(() => { // remembered preference: start only after the visitor's first interaction
    if (!snd || !c) return; addEventListener("pointerdown", play, { once: true }); return () => removeEventListener("pointerdown", play);
  }, [c]);

  if (hash.startsWith("#/admin")) return <Admin />;
  return (<>
    <Sparkles />
    <button className="snd" aria-pressed={snd} aria-label="Toggle sound" onClick={toggle}>{snd ? "🔊" : "🔇"}</button>
    {err && <main className="scr"><p className="err">{err}</p></main>}
    {stage === "countdown" && clock && <Countdown clock={clock} onZero={onZero} />}
    {stage === "loading" && <Loading onDone={() => setStage(c ? "welcome" : "passcode")} />}
    {stage === "passcode" && <Passcode onUnlock={(d) => { setC(d); setStage("welcome"); }} />}
    {stage === "welcome" && c && <Welcome text={c.config.welcome_text} onEnter={() => setStage("main")} />}
    {stage === "main" && c && clock && <Main c={c} now={clock.now} onFinal={() => setStage("final")} />}
    {stage === "final" && c && <Final c={c} onReplay={() => setStage("welcome")} />}
  </>);
}
