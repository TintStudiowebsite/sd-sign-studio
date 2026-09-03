import { useEffect } from 'react'
import HeroSection from '../components/home/HeroSection'
import CategoriesSection from '../components/home/CategoriesSection'
import AboutSection from '../components/home/AboutSection'
import FeaturedWork from '../components/home/FeaturedWork'
import ServicesSection from '../components/home/ServicesSection'
import ProcessSection from '../components/home/ProcessSection'
import GalleryPreview from '../components/home/GalleryPreview'
import CtaBand from '../components/home/CtaBand'
import WhyChooseUs from '../components/home/WhyChooseUs'
import TestimonialsSection from '../components/home/TestimonialsSection'
import ContactForm from '../components/ContactForm'

export default function HomePage() {


  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <CategoriesSection />
      <FeaturedWork />
      <GalleryPreview />
      <WhyChooseUs />
      <ProcessSection />
      {/*
        Testimonials (left) and "Request a Free Consultation" (right) now
        live side-by-side in ONE combined section — one shared background,
        no seam between them — instead of two separate stacked sections,
        per the client's request. Stacks to a single column on narrow
        screens (see .testimonials-consultation-grid). The consultation
        form itself is NOT hidden — it's fully visible in the right column.
      */}
      <section className="section" id="testimonials" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)', borderTop: '1px solid #fecaca', borderBottom: '1px solid #fecaca', padding: '90px 0', overflow: 'hidden' }}>
        <div className="section-inner testimonials-consultation-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          {/* Left: reviews */}
          <TestimonialsSection compact />

          {/* Right: consultation form */}
          <div id="contact">
            <div className="section-header" style={{ alignItems: 'flex-start', textAlign: 'left', marginBottom: '32px' }}>
              <span className="section-eyebrow" style={{ background: 'rgba(232,0,13,0.06)', border: '1px solid rgba(232,0,13,0.12)', color: 'var(--red)' }}>Get a Quote</span>
              <h2 className="section-title" style={{ color: '#111827', fontSize: 'clamp(26px, 3vw, 34px)' }}>Request a Free <span className="red">Consultation</span></h2>
              <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', marginTop: '8px', lineHeight: 1.6 }}>
                Fill out the form below, upload your logo or design assets, and our Glasgow team will compile a custom pricing estimate within 24 hours.
              </p>
            </div>

            <div style={{
              background: 'var(--black)',
              padding: 'clamp(20px, 4vw, 32px)',
              borderRadius: '24px',
              border: '1.5px solid rgba(0,0,0,0.06)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}>
              <ContactForm isHome={true} theme="dark" />
            </div>
          </div>

        </div>
      </section>

      <CtaBand />
    </>
  )
}
