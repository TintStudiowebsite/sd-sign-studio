import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ServiceCta({ heading, subheading, buttonLabel }) {
  return (
    <section className="bg-[#E30613] py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">{heading}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{subheading}</p>
        <Link
          to="/quote"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-[#E30613] shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
        >
          {buttonLabel} <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  )
}
