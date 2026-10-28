import { createClient } from "npm:@supabase/supabase-js@2";
const H = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Content-Type": "application/json" };
const res = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: H });
const db = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
async function hashCode(code: string, salt: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveBits"]);
  const b = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 100000 }, k, 256);
  return btoa(String.fromCharCode(...new Uint8Array(b)));
}
async function isOwner(req: Request) {
  const t = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  if (!t) return false;
  const { data } = await db().auth.getUser(t);
  if (!data?.user) return false;
  const { data: o } = await db().from("owners").select("user_id").eq("user_id", data.user.id).maybeSingle();
  return !!o;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });
  const s = db();
  const { code, preview } = await req.json().catch(() => ({}));
  const { data: cfg } = await s.from("site_config").select("*").eq("id", 1).single();
  const owner = await isOwner(req);
  if (!owner && Date.now() < Date.parse(cfg.reveal_at)) return res({ error: "Not yet, my love." }, 403);
  if (!(owner && preview)) {
    const ip = (req.headers.get("x-forwarded-for") || "x").split(",")[0].trim();
    const since = new Date(Date.now() - 10 * 60e3).toISOString();
    const { count } = await s.from("attempts").select("*", { count: "exact", head: true }).eq("ip", ip).gte("at", since);
    if ((count ?? 0) >= 8) return res({ error: "Too many tries. Please wait a few minutes." }, 429);
    if (!/^\d{8}$/.test(code || "")) return res({ error: "Please enter exactly 8 digits." }, 400);
    const { data: p } = await s.from("passcode").select("*").eq("id", 1).maybeSingle();
    if (!p) return res({ error: "The passcode has not been set yet." }, 400);
    if ((await hashCode(code, p.salt)) !== p.hash) {
      await s.from("attempts").insert({ ip });
      return res({ error: "That's not our secret yet. Try again, my love. 💙" }, 401);
    }
  }
  const sign = async (bucket: string, path?: string | null) =>
    path ? (await s.storage.from(bucket).createSignedUrl(path, 3600)).data?.signedUrl ?? null : null;
  const by = (t: string) => s.from(t).select("*").order("sort");
  const [tl, ph, le, qu] = await Promise.all([by("timeline"), by("photos"), by("letters"), by("quotes")]);
  return res({
    config: { start_at: cfg.start_at, welcome_text: cfg.welcome_text, final_message: cfg.final_message, signature: cfg.signature, music_url: await sign("music", cfg.music_path) },
    timeline: await Promise.all((tl.data ?? []).map(async (r) => ({ ...r, photo_url: await sign("photos", r.photo_path) }))),
    photos: await Promise.all((ph.data ?? []).map(async (r) => ({ ...r, url: await sign("photos", r.path) }))),
    letters: le.data ?? [], quotes: qu.data ?? [],
  });
});
