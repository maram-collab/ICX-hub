import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

// 1) Google Sheet > File > Share > Publish to web > CSV. Paste that link here.
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1e_v-XLlZhVp9G3r-vJFq0LgJoGlJaYQjr32CzgVt-Gc/gviz/tq?tqx=out:csv&gid=0";// 2) Replace with your LC's sign-up or contact link.
const APPLY_URL = "https://aiesec.org";
const COLS = { product: "Product", title: "Title", org: "Organisation", duration: "Duration", created: "Created", openings: "Openings", salary: "Salary" };

const SAMPLE = [
  { Product: "Global Teaching", Title: "English teacher", Organisation: "365 University", Duration: "short", Created: "14/04/2026", Openings: "5", Salary: "$750" },
  { Product: "Global Talent", Title: "Web Developer", Organisation: "Progress Professional", Duration: "short", Created: "18/09/2026", Openings: "4", Salary: "$600" },
  { Product: "Global Talent", Title: "Marketing", Organisation: "Sast Education", Duration: "short", Created: "24/09/2026", Openings: "3", Salary: "$700" },
  { Product: "Global Volunteer", Title: "Fingerprint [4 weeks]", Organisation: "atpec", Duration: "short", Created: "31/10/2026", Openings: "6", Salary: "Not specified" },
];

const toDate = (v) => {
  const m = String(v ?? "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); // DD/MM/YYYY
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const d = new Date(v); return isNaN(d) ? null : d;
};
const toSalary = (v) => { const n = parseFloat(String(v ?? "").replace(/[^\d.]/g, "")); return isNaN(n) ? null : n; };
const fmt = (d) => (d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Date not set");
const tone = (p) => {
  const s = p.toLowerCase();
  if (s.includes("talent")) return { bg: "bg-lilac", dot: "bg-violet-400" };
  if (s.includes("teach")) return { bg: "bg-peach", dot: "bg-orange-300" };
  if (s.includes("volunteer")) return { bg: "bg-mint", dot: "bg-emerald-400" };
  return { bg: "bg-butter", dot: "bg-amber-300" };
};
const SORTS = { new: "Newest first", salary: "Highest salary", spots: "Most openings" };

export default function App() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [product, setProduct] = useState("All");
  const [minSalary, setMinSalary] = useState(0);
  const [after, setAfter] = useState("");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    if (SHEET_CSV_URL.startsWith("PASTE")) { setRows(SAMPLE); setStatus("sample"); return; }
    Papa.parse(SHEET_CSV_URL, {
      download: true, header: true, skipEmptyLines: true,
      complete: (r) => { setRows(r.data); setStatus("live"); },
      error: () => { setRows(SAMPLE); setStatus("error"); },
    });
  }, []);

  const items = useMemo(() => rows.map((r, i) => ({
    id: i, product: r[COLS.product] || "Other", title: r[COLS.title], org: r[COLS.org], duration: r[COLS.duration],
    openings: Number(r[COLS.openings]) || 0, salaryText: r[COLS.salary], salary: toSalary(r[COLS.salary]), created: toDate(r[COLS.created]),
  })).filter((o) => o.title), [rows]);

  const products = ["All", ...new Set(items.map((o) => o.product))];
  const maxSalary = Math.max(0, ...items.map((o) => o.salary ?? 0));
  const shown = items.filter((o) =>
    (product === "All" || o.product === product) &&
    (minSalary === 0 || (o.salary !== null && o.salary >= minSalary)) &&
    (!after || (o.created && o.created >= new Date(after)))
  ).sort((a, b) => sort === "salary" ? (b.salary ?? -1) - (a.salary ?? -1) : sort === "spots" ? b.openings - a.openings : (b.created || 0) - (a.created || 0));
  const filtered = product !== "All" || minSalary > 0 || after;
  const reset = () => { setProduct("All"); setMinSalary(0); setAfter(""); };

  return (
    <div>
      <div className="sticky top-0 z-20 px-3 pt-3">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full bg-white/90 px-5 py-2 shadow-sm backdrop-blur">
          <img src="/aiesec.png" alt="AIESEC" className="h-6" />
          <div className="flex gap-5 text-sm font-medium">
            <a href="#country" className="hidden sm:block">Tunisia</a><a href="#lc" className="hidden sm:block">Our LC</a>
            <a href="#opportunities" className="rounded-full bg-aiesec px-4 py-1.5 text-white hover:bg-ink">Opportunities</a>
          </div>
        </nav>
      </div>

      <header className="bg-gradient-to-br from-sky via-rose/60 to-peach">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-2">
          <div>
            <p className="inline-block rounded-full bg-white/70 px-4 py-1 text-sm font-medium">AIESEC in Hadrumet · Sousse, Tunisia</p>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">Hadrumet is here. Your global experience starts in Sousse.</h1>
            <p className="mt-5 max-w-md text-lg">Volunteer, teach or work abroad with young people who made the same leap. See what is open today.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#opportunities" className="rounded-full bg-aiesec px-7 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink">Find my opportunity</a>
              <a href="#lc" className="rounded-full bg-white/80 px-7 py-3 font-semibold transition hover:bg-white">Meet our LC</a>
            </div>
            <div className="mt-10 flex items-end gap-3" aria-hidden="true">
              <img src="/walker.png" alt="" className="h-16" />
              <div className="mb-2 flex-1 border-b-2 border-dashed border-aiesec/40" />
              <span className="mb-1 text-sm font-medium">Next stop: the world</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-t-[999px] rounded-b-3xl border-8 border-white shadow-lg">
              <img src="/sousse.jpg" alt="Aerial view of Sousse medina and port at sunset" className="h-[28rem] w-full object-cover" />
            </div>
            <img src="/seal.png" alt="Hadrumet calligraphy seal" className="absolute -bottom-6 -left-4 h-28 w-28 rounded-full bg-white p-3 shadow-md sm:-left-8" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-5 py-20">
        <section id="country" className="grid items-center gap-10 md:grid-cols-5">
          <figure className="md:col-span-2">
            <div className="overflow-hidden rounded-t-[999px] rounded-b-3xl bg-peach">
              <img src="/medina.jpg" alt="A lit stone passage in the medina of Tunis" className="h-96 w-full object-cover" />
            </div>
            <figcaption className="mt-2 text-center text-sm">The medina of Tunis</figcaption>
          </figure>
          <div className="md:col-span-3">
            <h2 className="text-3xl font-bold sm:text-4xl">Tunisia, where Africa meets the Mediterranean</h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed">A North African country of about 12 million people, with ancient medinas, the Sahara and a long coast. Arabic and French are part of daily life, which makes our young people ready to work across borders. AIESEC in Tunisia opens those doors.</p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
              {["Capital: Tunis", "Arabic and French", "Mediterranean coast"].map((t, i) => <li key={t} className={`rounded-full px-4 py-2 ${["bg-lilac", "bg-mint", "bg-butter"][i]}`}>{t}</li>)}
            </ul>
          </div>
        </section>

        <section id="lc" className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold sm:text-4xl">Our LC: Hadrumet, Sousse</h2>
              <p className="mt-1 text-sm">Hadrumet is the ancient name of Sousse.</p>
              <p className="mt-4 max-w-prose text-lg leading-relaxed">Our local committee brings together students from universities across Sousse. We recruit, prepare and support young people for an international exchange, and we host interns and volunteers from abroad.</p>
            </div>
            <img src="/seal.png" alt="" aria-hidden="true" className="mx-auto h-40 w-40" />
          </div>
          <h3 className="mt-10 text-xl font-bold">Our position in operations</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            {[["194", "realizations", "bg-lilac"], ["252", "approvals", "bg-peach"], ["154", "completions", "bg-mint"]].map(([n, l, c]) => (
              <div key={l} className={`rounded-2xl p-5 ${c}`}><dt className="font-display text-5xl font-bold">{n}</dt><dd className="mt-1 text-sm font-medium">{l} this year</dd></div>
            ))}
          </dl>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            <li className="rounded-2xl bg-butter p-5"><p className="font-semibold">Realizations</p><p className="text-sm">10th among all LCs worldwide. AIESEC in Tunisia is 2nd among all countries.</p></li>
            <li className="rounded-2xl bg-rose p-5"><p className="font-semibold">Approvals</p><p className="text-sm">8th among all LCs worldwide. AIESEC in Tunisia is 3rd among all countries.</p></li>
          </ul>
          <p className="mt-3 text-xs">LC rank period: 1 Feb 2026 to 31 Jan 2027.</p>
          <img src="/people_only.png" alt="The AIESEC in Hadrumet team posing together" className="mx-auto mt-8 w-full max-w-4xl mix-blend-multiply" />
        </section>

        <section id="opportunities">
          <h2 className="text-3xl font-bold sm:text-4xl">Open opportunities</h2>
          <div className="sticky top-16 z-10 mt-6 space-y-4 rounded-3xl bg-white/95 p-5 shadow-md backdrop-blur">
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by product">
              {products.map((p) => (
                <button key={p} aria-pressed={product === p} onClick={() => setProduct(p)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${product === p ? "bg-aiesec text-white" : `${p === "All" ? "bg-sky" : tone(p).bg} hover:brightness-95`}`}>{p}</button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-medium">Minimum salary: {minSalary ? `$${minSalary}` : "any"}
                <input type="range" min="0" max={maxSalary || 1000} step="50" value={minSalary} onChange={(e) => setMinSalary(+e.target.value)} className="mt-2 w-full accent-aiesec" />
              </label>
              <label className="text-sm font-medium">Posted after
                <input type="date" value={after} onChange={(e) => setAfter(e.target.value)} className="mt-1 w-full rounded-xl border border-ink/20 p-2" />
              </label>
              <label className="text-sm font-medium">Sort by
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-1 w-full rounded-xl border border-ink/20 p-2">
                  {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
            <div className="flex items-center justify-between text-sm">
              <p aria-live="polite" className="font-medium">{shown.length} of {items.length} opportunities</p>
              {filtered && <button onClick={reset} className="font-semibold text-aiesec underline">Reset filters</button>}
            </div>
          </div>
          {status === "sample" && <p className="mt-3 text-sm text-amber-700">Showing sample data. Add your published sheet link in App.jsx to load the live opportunities.</p>}
          {status === "error" && <p className="mt-3 text-sm text-red-600">The sheet could not be loaded. Check that it is published to the web as CSV.</p>}
          {status === "loading" && <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-52 animate-pulse rounded-3xl bg-white" />)}</div>}
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((o) => (
              <li key={o.id} className={`flex flex-col rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-lg ${tone(o.product).bg}`}>
                <span className="flex items-center gap-2 text-sm font-semibold"><span className={`h-2.5 w-2.5 rounded-full ${tone(o.product).dot}`} />{o.product}</span>
                <h3 className="mt-3 text-2xl font-bold leading-snug">{o.title}</h3>
                <p className="mt-1 text-sm">{o.org}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-white/70 px-3 py-1">{o.duration} duration</span>
                  <span className="rounded-full bg-white/70 px-3 py-1">{o.openings} {o.openings === 1 ? "opening" : "openings"}</span>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div><p className="text-xs">Salary</p><p className="font-display text-2xl font-bold">{o.salaryText || "Not specified"}</p></div>
                  <p className="text-xs">Posted {fmt(o.created)}</p>
                </div>
                <a href={APPLY_URL} target="_blank" rel="noreferrer" className="mt-5 rounded-full bg-ink py-2.5 text-center text-sm font-semibold text-white transition hover:bg-aiesec">Apply with AIESEC</a>
              </li>
            ))}
          </ul>
          {shown.length === 0 && status !== "loading" && (
            <div className="mt-6 rounded-3xl bg-white p-8 text-center">
              <p className="font-display text-xl font-bold">Nothing matches these filters yet</p>
              <p className="mt-1 text-sm">Try another product, a lower salary or an earlier date.</p>
              <button onClick={reset} className="mt-4 rounded-full bg-aiesec px-6 py-2 font-semibold text-white">Reset filters</button>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-gradient-to-r from-peach via-rose to-lilac px-5 py-12 text-center">
        <img src="/hadrumet-is-here-black.png" alt="Calligraphy: Hadrumet is here and will achieve its big dreams" className="mx-auto h-28 mix-blend-multiply" />
        <img src="/aiesec.png" alt="AIESEC" className="mx-auto mt-6 h-6" />
        <p className="mt-3 text-sm">AIESEC in Hadrumet, Sousse, Tunisia</p>
      </footer>
    </div>
  );
}
