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
  if (!(await isOwner(req))) return res({ error: "Owner only." }, 403);
  const { code } = await req.json().catch(() => ({}));
  if (!/^\d{8}$/.test(code || "")) return res({ error: "Passcode must be exactly 8 digits." }, 400);
  const salt = crypto.randomUUID();
  const { error } = await db().from("passcode").upsert({ id: 1, salt, hash: await hashCode(code, salt) });
  return error ? res({ error: error.message }, 500) : res({ ok: true });
});
