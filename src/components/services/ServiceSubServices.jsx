export default function ServiceSubServices({ title, items = [] }) {
  return (
    <section className="bg-[#f7f8fa] py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
            Our Services
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
            {title} Solutions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Everything you need, designed, produced, and installed by one in-house team.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={i}
                className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E30613]/10 text-[#E30613] transition-colors duration-300 group-hover:bg-[#E30613] group-hover:text-white">
                  <Icon size={24} />
                </span>
                <h3 className="mb-2 text-lg font-extrabold text-gray-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
