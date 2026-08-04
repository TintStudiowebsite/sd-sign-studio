export default function ServiceProcess({ steps = [] }) {
  return (
    <section className="bg-[#0a0a0a] py-20 text-white md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Our Simple <span className="text-[#E30613]">Process</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="relative rounded-2xl border border-white/10 bg-white/5 p-7 transition-transform duration-300 hover:-translate-y-1">
              <span className="text-5xl font-black text-[#E30613]">{s.step}</span>
              <h3 className="mt-4 mb-2 text-lg font-extrabold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-white/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
