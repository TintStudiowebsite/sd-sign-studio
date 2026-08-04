import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { STATIC_SERVICES, slugify, getServiceIcon } from '../../data/services'
import { useServices } from '../../hooks/useServices'

export default function ServicesSection() {
  const services = useServices()
  const navigate = useNavigate()

  const openService = (title) => navigate(`/services/${slugify(title)}`)

  return (
    <section className="full-services-section" id="services">
      <div className="section-inner">
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-eyebrow">Services We Provide</span>
          <h2 className="section-title">Creative Print <span className="red">Production Agency</span></h2>
        </div>
        <div className="services-intro">
          <p>Premium Hexis vehicle wraps that elevate your brand, protect your paintwork, and turn heads wherever you go.</p>
          <p>We also specialise in large-format print — banners, leaflets, posters, and more — with free design included on every order.</p>
        </div>

        <div className="services-grid">
          {(services?.length ? services : STATIC_SERVICES).map((srv, i) => {
            const Icon = getServiceIcon(srv.title)
            const isNewProductImage = srv.image?.includes('/images/NewProducts/')
            return (
              <article
                className={`srv-card${isNewProductImage ? ' srv-card--new' : ''}`}
                key={srv.id || i}
                onClick={() => openService(srv.title)}
              >
                <div className="srv-media">
                  <img className="srv-img" src={srv.image} alt={srv.title} loading="lazy" />
                </div>
                {srv.popular && (
                  <span className="srv-popular" aria-hidden="true">
                    <Star size={12} fill="currentColor" strokeWidth={0} />
                    Popular
                  </span>
                )}
                <span className="srv-badge" aria-hidden="true">
                  <Icon size={22} strokeWidth={2} />
                </span>
                <div className="srv-content">
                  <h3 className="srv-title">{srv.title}</h3>
                  <p className="srv-desc">{srv.short_description || srv.description}</p>
                  <span className="srv-link">
                    Explore Service
                    <span className="srv-link-arrow" aria-hidden="true">→</span>
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
