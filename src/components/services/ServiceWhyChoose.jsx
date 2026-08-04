export default function ServiceWhyChoose({ features = [] }) {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
            Why SD Signs Studio
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
            Why Choose <span className="text-[#E30613]">SD Signs Studio?</span>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E30613]/10 text-[#E30613]">
                  <Icon size={22} />
                </span>
                <div>
                  <h3 className="mb-1.5 font-extrabold text-gray-900">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
