import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ServicePortfolio({ title, images = [], galleryLink }) {
  return (
    <section id="service-work" className="bg-[#f7f8fa] py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="inline-block rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
              Recent Projects
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
              Our <span className="text-[#E30613]">{title}</span> Work
            </h2>
          </div>
          <Link
            to={galleryLink}
            className="group inline-flex items-center gap-2 font-bold text-[#E30613] transition-colors hover:text-[#c00511]"
          >
            View Full Gallery
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <Link
              to={galleryLink}
              key={i}
              className="group relative block overflow-hidden rounded-2xl shadow-sm"
            >
              <img
                src={img}
                alt={`${title} project ${i + 1}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
