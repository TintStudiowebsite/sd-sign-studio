import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ServiceHero({ title, heading, intro, image, icon }) {
  const Icon = icon
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28 lg:py-32">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/70">
          <Link to="/" className="transition-colors hover:text-[#E30613]">Home</Link>
          <span className="text-white/30">/</span>
          <Link to="/services" className="transition-colors hover:text-[#E30613]">Services</Link>
          <span className="text-white/30">/</span>
          <span className="text-white">{title}</span>
        </nav>

        <div className="mb-5 flex items-center gap-3">
          {Icon && (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E30613] text-white shadow-lg shadow-[#E30613]/40">
              <Icon size={22} />
            </span>
          )}
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E30613]">{title}</p>
        </div>

        <h1 className="mb-5 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
          {heading}
        </h1>
        <p className="mb-9 max-w-2xl text-lg leading-relaxed text-white/80">{intro}</p>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/quote"
            className="inline-flex items-center gap-2 rounded-full bg-[#E30613] px-7 py-3.5 font-bold text-white shadow-lg shadow-[#E30613]/30 transition-all hover:-translate-y-0.5 hover:bg-[#c00511]"
          >
            Request a Free Quote <ArrowRight size={18} />
          </Link>
          <a
            href="#service-work"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-bold text-white transition-all hover:border-white hover:bg-white hover:text-black"
          >
            View Our Work
          </a>
        </div>
      </div>
    </section>
  )
}
