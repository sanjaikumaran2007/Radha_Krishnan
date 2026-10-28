import { useEffect, useState } from "react";
import { sb, fn } from "./lib";

const toIst = (iso: string) => iso ? new Date(Date.parse(iso) + 5.5 * 3600e3).toISOString().slice(0, 16) : "";
const fromIst = (v: string) => new Date(Date.parse(v + ":00Z") - 5.5 * 3600e3).toISOString();

async function resize(f: File): Promise<Blob> { // optimise for mobile: max 1600px WebP
  const bmp = await createImageBitmap(f), r = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const cv = document.createElement("canvas"); cv.width = bmp.width * r; cv.height = bmp.height * r;
  cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height);
  return new Promise((ok) => cv.toBlob((b) => ok(b!), "image/webp", 0.82));
}
async function upload(bucket: string, f: File | Blob, name: string) {
  const path = `${Date.now()}-${name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await sb.storage.from(bucket).upload(path, f, { contentType: (f as any).type }); if (error) throw error; return path;
}

export function Admin() {
  const [user, setUser] = useState<any>(null), [em, setEm] = useState(""), [pw, setPw] = useState(""), [msg, setMsg] = useState("");
  useEffect(() => { sb.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null)); }, []);
  if (!user) return (<main className="admin"><h1>Owner sign-in</h1>
    <input placeholder="Email" value={em} onChange={(e) => setEm(e.target.value)} /><input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
    <button onClick={async () => { const { data, error } = await sb.auth.signInWithPassword({ email: em, password: pw }); error ? setMsg(error.message) : setUser(data.user); }}>Sign in</button><p>{msg}</p></main>);
  return (<main className="admin"><h1>Owner Admin</h1>
    <p><a href="#/preview" target="_blank">Preview the full experience (skips time + passcode)</a> · <button onClick={() => sb.auth.signOut().then(() => setUser(null))}>Sign out</button></p>
    <Config /><Passcode /><Rows table="timeline" cols={[["date_label", "Date"], ["title", "Title"], ["quote", "Quote"], ["body", "Paragraph"]]} photoCol="photo_path" />
    <Photos /><Rows table="letters" cols={[["title", "Title"], ["body", "Letter"]]} /><Rows table="quotes" cols={[["text", "Quote"]]} /></main>);
}

function Config() {
  const [c, setC] = useState<any>(null), [m, setM] = useState("");
  useEffect(() => { sb.from("site_config").select("*").eq("id", 1).single().then(({ data }) => setC(data)); }, []);
  if (!c) return null;
  const set = (k: string, v: any) => setC({ ...c, [k]: v });
  return (<section><h2>Site settings</h2>
    <label>Relationship start (IST)<input type="datetime-local" value={toIst(c.start_at)} onChange={(e) => set("start_at", fromIst(e.target.value))} /></label>
    <label>Reveal time (IST)<input type="datetime-local" value={toIst(c.reveal_at)} onChange={(e) => set("reveal_at", fromIst(e.target.value))} /></label>
    <label>Welcome message<textarea rows={8} value={c.welcome_text || ""} onChange={(e) => set("welcome_text", e.target.value)} /></label>
    <label>Final anniversary message<textarea rows={12} value={c.final_message || ""} onChange={(e) => set("final_message", e.target.value)} /></label>
    <label>Signature<textarea rows={2} value={c.signature || ""} onChange={(e) => set("signature", e.target.value)} /></label>
    <label>Background music (mp3){c.music_path && ` — current: ${c.music_path}`}<input type="file" accept="audio/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) set("music_path", await upload("music", f, f.name)); }} /></label>
    <button onClick={async () => { const { error } = await sb.from("site_config").update({ ...c }).eq("id", 1); setM(error ? error.message : "Saved ✓"); }}>Save settings</button> {m}</section>);
}

function Passcode() {
  const [v, setV] = useState(""), [m, setM] = useState("");
  return (<section><h2>Change passcode</h2><input type="password" inputMode="numeric" maxLength={8} placeholder="New 8-digit passcode" value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ""))} />
    <button onClick={async () => { try { await fn("set-passcode", { code: v }); setM("Passcode updated ✓"); setV(""); } catch (e: any) { setM(e.message); } }}>Set passcode</button> {m}</section>);
}

function useRows(table: string) {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => setRows((await sb.from(table).select("*").order("sort")).data ?? []);
  useEffect(() => { load(); }, []);
  const save = async (r: any) => { await sb.from(table).update(r).eq("id", r.id); };
  const del = async (id: string) => { await sb.from(table).delete().eq("id", id); load(); };
  const move = async (i: number, d: number) => { const a = rows[i], b = rows[i + d]; if (!b) return;
    await Promise.all([sb.from(table).update({ sort: b.sort }).eq("id", a.id), sb.from(table).update({ sort: a.sort }).eq("id", b.id)]); load(); };
  return { rows, setRows, load, save, del, move };
}

function Rows({ table, cols, photoCol }: { table: string; cols: [string, string][]; photoCol?: string }) {
  const { rows, setRows, load, save, del, move } = useRows(table);
  const edit = (i: number, k: string, v: any) => setRows(rows.map((r, n) => (n === i ? { ...r, [k]: v } : r)));
  return (<section><h2>{table}</h2>
    {rows.map((r, i) => (<div className="row-card" key={r.id}>
      {cols.map(([k, l]) => <label key={k}>{l}<textarea rows={k === "body" ? 5 : 2} value={r[k] || ""} onChange={(e) => edit(i, k, e.target.value)} /></label>)}
      {photoCol && <label>Photo {r[photoCol] && "✓"}<input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) edit(i, photoCol, await upload("photos", await resize(f), f.name + ".webp")); }} /></label>}
      <button onClick={() => save(r)}>Save</button><button onClick={() => move(i, -1)}>↑</button><button onClick={() => move(i, 1)}>↓</button><button onClick={() => del(r.id)}>Delete</button></div>))}
    <button onClick={async () => { await sb.from(table).insert({ sort: (rows.at(-1)?.sort ?? 0) + 1 }); load(); }}>+ Add</button></section>);
}

function Photos() {
  const { rows, setRows, load, save, del, move } = useRows("photos");
  const [msg, setMsg] = useState("");
  const add = async (input: HTMLInputElement) => {
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (!files.length) return;
    let s = rows.reduce((m, r) => Math.max(m, r.sort ?? 0), 0);
    let ok = 0;
    const bad: string[] = [];
    for (const f of files) {
      setMsg(`Uploading ${ok + bad.length + 1} of ${files.length}…`);
      try {
        const path = await upload("photos", await resize(f), f.name + ".webp");
        const { error } = await sb.from("photos").insert({ path, sort: ++s });
        if (error) throw error;
        ok++;
      } catch { bad.push(f.name); }
    }
    setMsg(`Uploaded ${ok} of ${files.length}.` + (bad.length ? ` Failed: ${bad.join(", ")} (use JPG or PNG).` : ""));
    load();
  };
  const edit = (i: number, k: string, v: string) => setRows(rows.map((x, n) => (n === i ? { ...x, [k]: v } : x)));
  return (<section><h2>photos ({rows.length})</h2>
    <input type="file" accept="image/*" multiple onChange={(e) => add(e.currentTarget)} /> <p>{msg}</p>
    {rows.map((r, i) => (<div className="row-card" key={r.id}><small>{r.path}</small>
      <input placeholder="Caption" value={r.caption || ""} onChange={(e) => edit(i, "caption", e.target.value)} />
      <input placeholder="Date" value={r.taken_on || ""} onChange={(e) => edit(i, "taken_on", e.target.value)} />
      <button onClick={() => save(r)}>Save</button><button onClick={() => move(i, -1)}>↑</button><button onClick={() => move(i, 1)}>↓</button>
      <button onClick={async () => { await sb.storage.from("photos").remove([r.path]); del(r.id); }}>Delete</button></div>))}</section>);
}
