import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/random")({
  head: () => ({
    meta: [
      { title: "Deep Sea Typewriter Co. — Salvaged Machines, Ocean-Aged" },
      {
        name: "description",
        content:
          "Hand-salvaged typewriters recovered from shipwrecks, restored by third-generation divers. One-of-a-kind writing instruments with saltwater soul.",
      },
      { property: "og:title", content: "Deep Sea Typewriter Co." },
      {
        property: "og:description",
        content: "Salvaged typewriters from shipwrecks. Restored. Rare. Yours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RandomSite,
});

const MACHINES = [
  {
    name: "The Marianas",
    year: "1934",
    depth: "11,034 m",
    price: "$4,200",
    story: "Recovered from the abyssal plain. Keys taste faintly of salt.",
    hue: "from-cyan-300 to-teal-500",
  },
  {
    name: "Andrea Doria",
    year: "1956",
    depth: "76 m",
    price: "$6,800",
    story: "Italian steel. Slept beside a chandelier for sixty-eight years.",
    hue: "from-amber-200 to-rose-400",
  },
  {
    name: "HMS Sussex",
    year: "1694",
    depth: "1,000 m",
    price: "$18,500",
    story: "Predates the typewriter. We do not question this. Neither should you.",
    hue: "from-indigo-300 to-fuchsia-500",
  },
];

function RandomSite() {
  const [depth, setDepth] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setDepth((d) => (d + 1) % 11035), 40);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#04141c] text-[#e8f2f4] font-serif overflow-x-hidden">
      {/* caustic light overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.08] mix-blend-screen"
        style={{
          background:
            "radial-gradient(600px 400px at 20% 10%, #7fd8e8, transparent), radial-gradient(500px 300px at 80% 30%, #b3f0e2, transparent), radial-gradient(700px 500px at 50% 90%, #4ac0d8, transparent)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full border border-cyan-200/40 flex items-center justify-center text-cyan-200 text-lg">
            ⌘
          </div>
          <span className="tracking-[0.3em] text-xs uppercase text-cyan-100/70">
            Deep&nbsp;Sea · Typewriter&nbsp;Co.
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-white/50">
          <a href="#catalog" className="hover:text-cyan-200">Catalog</a>
          <a href="#dive" className="hover:text-cyan-200">The Dive</a>
          <a href="#journal" className="hover:text-cyan-200">Journal</a>
          <a href="#commission" className="hover:text-cyan-200">Commission</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative z-10 px-8 pt-24 pb-32 max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.4em] uppercase text-cyan-300/70 mb-8">
          Est. 1971 · Lisbon Harbour · Port 04
        </p>
        <h1 className="font-serif text-5xl md:text-8xl leading-[0.95] tracking-tight">
          Machines that
          <br />
          <span className="italic text-cyan-200">remember</span> the
          <br />
          ocean.
        </h1>
        <p className="mt-10 max-w-xl text-lg text-white/70 leading-relaxed">
          For fifty-three years we have hauled typewriters from the seabed,
          dried them under Portuguese sun, and coaxed them back into service.
          Each machine ships with the coordinates of its recovery, a jar of
          the silt we found inside it, and a lifetime ribbon warranty.
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <a
            href="#catalog"
            className="group inline-flex items-center gap-3 rounded-full bg-cyan-200 text-[#04141c] px-7 py-3 text-sm font-medium tracking-wide hover:bg-cyan-100 transition"
          >
            View salvaged catalog
            <span className="transition group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#dive"
            className="inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-3 text-sm tracking-wide hover:border-cyan-200/60 hover:text-cyan-100 transition"
          >
            Watch this month's dive
          </a>
        </div>

        {/* live depth ticker */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8 text-sm">
          <Stat label="Current dive depth" value={`${depth.toLocaleString()} m`} live />
          <Stat label="Machines recovered" value="1,412" />
          <Stat label="Restoration months" value="14 avg" />
          <Stat label="Ribbons in stock" value="Unlimited" />
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog" className="relative z-10 px-8 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-cyan-300/70">
                Autumn 2026 Salvage
              </p>
              <h2 className="mt-3 text-4xl md:text-5xl">Available this tide.</h2>
            </div>
            <p className="text-sm text-white/50 max-w-xs">
              Prices in USD. Every machine sold once. When it is gone, the sea
              keeps the rest.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {MACHINES.map((m) => (
              <article
                key={m.name}
                className="group relative rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:border-cyan-200/40 hover:-translate-y-1 transition duration-500"
              >
                <div
                  className={`h-52 rounded-xl bg-gradient-to-br ${m.hue} opacity-70 group-hover:opacity-100 transition mb-6 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-80">
                    ⌨︎
                  </div>
                  <div className="absolute bottom-3 left-3 text-[10px] tracking-widest uppercase text-black/60">
                    Lot · {m.year}
                  </div>
                </div>
                <h3 className="text-2xl mb-1">{m.name}</h3>
                <p className="text-xs uppercase tracking-widest text-cyan-200/60 mb-4">
                  Recovered · {m.depth}
                </p>
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  {m.story}
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-lg">{m.price}</span>
                  <button className="text-xs uppercase tracking-widest text-cyan-200 hover:text-white transition">
                    Reserve →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* THE DIVE */}
      <section
        id="dive"
        className="relative z-10 px-8 py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-[#02090f]"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-cyan-300/70">
            The method
          </p>
          <h2 className="mt-4 text-4xl md:text-5xl">
            We do not use robots.
            <br />
            <span className="italic text-cyan-200">We use our lungs.</span>
          </h2>
          <p className="mt-8 text-white/60 leading-relaxed max-w-2xl mx-auto">
            Every machine in our catalog is recovered by a human diver holding
            their breath. It is slower. It is stranger. It is why the keys
            still work.
          </p>

          <div className="mt-16 grid md:grid-cols-3 gap-10 text-left">
            {[
              ["01", "Locate", "Manifests, sonar, and the memory of harbourmasters older than the wrecks."],
              ["02", "Descend", "A single breath. A cotton sling. No metal touches the machine underwater."],
              ["03", "Return", "Fourteen months in cedar. One month drying under a specific Lisbon sun."],
            ].map(([n, t, d]) => (
              <div key={n} className="border-t border-cyan-200/20 pt-6">
                <div className="text-cyan-200/60 text-sm">{n}</div>
                <div className="mt-2 text-xl">{t}</div>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNAL / CTA */}
      <section id="journal" className="relative z-10 px-8 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto rounded-3xl bg-cyan-100/5 border border-cyan-100/10 p-10 md:p-14">
          <p className="text-xs tracking-[0.4em] uppercase text-cyan-300/70">
            Letters from the seabed
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl max-w-xl">
            Once a month we send one letter. Written on a machine we found.
          </h2>
          <form
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg"
            onSubmit={(e) => {
              e.preventDefault();
              const el = e.currentTarget.querySelector("input");
              if (el) el.value = "";
              alert("A letter is coming. Check the tide tables.");
            }}
          >
            <input
              type="email"
              required
              placeholder="your@address"
              className="flex-1 bg-transparent border border-white/15 rounded-full px-5 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-200"
            />
            <button className="rounded-full bg-cyan-200 text-[#04141c] px-6 py-3 text-sm font-medium hover:bg-white transition">
              Post to me
            </button>
          </form>
        </div>
      </section>

      <footer id="commission" className="relative z-10 px-8 py-14 border-t border-white/5 text-xs text-white/40 tracking-wide">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-4">
          <span>© 2026 Deep Sea Typewriter Co. · Rua do Sal, Lisbon</span>
          <span>Diver on duty: M. Salazar · Depth clearance: 84 m</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40">
        {live && <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />}
        {label}
      </div>
      <div className="mt-2 text-2xl text-cyan-100 tabular-nums">{value}</div>
    </div>
  );
}
