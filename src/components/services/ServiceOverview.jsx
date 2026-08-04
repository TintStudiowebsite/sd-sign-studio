import { CheckCircle2 } from 'lucide-react'

export default function ServiceOverview({ title, paragraphs = [], benefits = [] }) {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10">
          <span className="inline-block rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
            Service Overview
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
            Why Businesses Choose <span className="text-[#E30613]">{title}</span>
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="space-y-5 text-[17px] leading-relaxed text-gray-600">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
            <h3 className="mb-5 text-lg font-extrabold text-gray-900">Key Benefits</h3>
            <ul className="space-y-4">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#E30613]" size={20} />
                  <span className="text-[15px] font-medium text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
