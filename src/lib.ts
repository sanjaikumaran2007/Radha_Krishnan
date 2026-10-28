import { createClient } from "@supabase/supabase-js";
export const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export async function fn(name: string, body?: any) {
  const { data, error } = await sb.functions.invoke(name, { body });
  if (error) {
    let msg = error.message;
    try { msg = (await (error as any).context.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  return data;
}

export type Clock = { reveal: number; start: number; now: () => number };
/** Server-synchronised clock: never trusts the visitor's device clock for the reveal. */
export async function syncClock(): Promise<Clock> {
  const t0 = performance.now();
  const r = await fn("server-time");
  const base = r.now + (performance.now() - t0) / 2;
  const p0 = performance.now();
  return { reveal: Date.parse(r.reveal_at), start: Date.parse(r.start_at), now: () => base + (performance.now() - p0) };
}

export type Content = {
  config: { start_at: string; welcome_text: string; final_message: string; signature: string; music_url: string | null };
  timeline: any[]; photos: any[]; letters: any[]; quotes: any[];
};

const IST = 5.5 * 3600e3; // India has no DST: fixed UTC+05:30
/** Calendar-aware elapsed time, computed in IST. Never negative. */
export function elapsed(startMs: number, nowMs: number) {
  nowMs = Math.max(nowMs, startMs);
  const a = new Date(startMs + IST), b = new Date(nowMs + IST);
  let y = b.getUTCFullYear() - a.getUTCFullYear(), m = b.getUTCMonth() - a.getUTCMonth(), d = b.getUTCDate() - a.getUTCDate();
  let h = b.getUTCHours() - a.getUTCHours(), mi = b.getUTCMinutes() - a.getUTCMinutes(), s = b.getUTCSeconds() - a.getUTCSeconds();
  if (s < 0) { s += 60; mi--; } if (mi < 0) { mi += 60; h--; } if (h < 0) { h += 24; d--; }
  if (d < 0) { d += new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate(); m--; }
  if (m < 0) { m += 12; y--; }
  return { y, m, d, h, mi, s, days: Math.floor((nowMs - startMs) / 864e5) };
}

let ctx: AudioContext | null = null;
/** Soft synthesized chime (no licensing issues). Plays only if the visitor turned sound on. */
export function chime(notes = [523, 659, 784, 1047]) {
  if (localStorage.getItem("sound") !== "on") return;
  ctx = ctx || new AudioContext();
  notes.forEach((f, i) => {
    const o = ctx!.createOscillator(), g = ctx!.createGain(), t = ctx!.currentTime + i * 0.12;
    o.frequency.value = f; o.connect(g); g.connect(ctx!.destination);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.15, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.start(t); o.stop(t + 1);
  });
}
