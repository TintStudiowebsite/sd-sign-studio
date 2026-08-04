import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ServiceHero from '../components/services/ServiceHero'
import ServiceOverview from '../components/services/ServiceOverview'
import ServiceSubServices from '../components/services/ServiceSubServices'
import ServiceWhyChoose from '../components/services/ServiceWhyChoose'
import ServiceProcess from '../components/services/ServiceProcess'
import ServicePortfolio from '../components/services/ServicePortfolio'
import ServiceCta from '../components/services/ServiceCta'
import { useServices } from '../hooks/useServices'
import { slugify, getServiceIcon } from '../data/services'
import {
  getServiceContent,
  SHARED_WHY_CHOOSE,
  SHARED_PROCESS,
  SHARED_CTA,
} from '../data/serviceDetails'

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const services = useServices()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const service = useMemo(
    () => services.find((s) => slugify(s.title) === slug),
    [services, slug],
  )

  const content = useMemo(
    () => getServiceContent(slug, service),
    [slug, service],
  )

  const Icon = getServiceIcon(content.title)

  return (
    <>
      <ServiceHero
        title={content.title}
        heading={content.heroHeading}
        intro={content.heroIntro}
        image={content.image}
        icon={Icon}
      />
      <ServiceOverview
        title={content.title}
        paragraphs={content.overview}
        benefits={content.benefits}
      />
      <ServiceSubServices title={content.title} items={content.subServices} />
      <ServiceWhyChoose features={SHARED_WHY_CHOOSE} />
      <ServiceProcess steps={SHARED_PROCESS} />
      <ServicePortfolio
        title={content.title}
        images={content.portfolio}
        galleryLink={`/gallery?category=${encodeURIComponent(content.title)}`}
      />
      <ServiceCta
        heading={SHARED_CTA.heading}
        subheading={SHARED_CTA.subheading}
        buttonLabel={SHARED_CTA.buttonLabel}
      />
    </>
  )
}
