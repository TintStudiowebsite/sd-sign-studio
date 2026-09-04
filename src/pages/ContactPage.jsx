import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import CtaBand from '../components/home/CtaBand'
import ContactForm from '../components/ContactForm'
import { CONFIG } from '../data/config'

export default function ContactPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const contactItems = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      title: 'Our Location',
      content: CONFIG.address,
      link: null
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z"/>
        </svg>
      ),
      title: 'Phone Number',
      content: CONFIG.phone,
      link: `tel:${CONFIG.phoneE164}`
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      title: 'Email Address',
      content: CONFIG.email,
      link: `mailto:${CONFIG.email}`
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: 'Opening Hours',
      content: CONFIG.openingHours,
      link: null
    },
  ]

  return (
    <>
      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }
        .contact-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 36px;
        }
        .contact-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 60px;
        }
        @media (max-width: 768px) {
          .contact-wrap { padding: 44px 16px 48px; }
          .contact-grid { grid-template-columns: 1fr; gap: 36px; }
          .contact-info-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        @media (max-width: 480px) {
          .contact-info-grid { grid-template-columns: 1fr; gap: 10px; }
        }
      `}</style>

      <div style={{
        background: '#ffffff',
        color: '#111827',
        minHeight: '100vh',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f9fafb',
        '--text-primary': '#111827',
        '--text-secondary': '#374151',
        '--text-muted': '#6b7280',
        '--border-color': '#e5e7eb'
      }}>
        {/* Hero Banner */}
        <div className="shop-banner">
          <div className="shop-banner-inner">
            <h1 style={{ fontFamily: 'serif', fontWeight: 600 }}>Contact Us</h1>
            <p>Get in touch with our team for quotes, designs, and branding inquiries.</p>
            <div className="shop-breadcrumb" style={{ justifyContent: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.7)' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
              <span className="sep" style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
              <span style={{ color: '#fff' }}>Contact</span>
            </div>
          </div>
        </div>

        <div className="contact-wrap">
          <div className="contact-grid">

            {/* ── Contact Info ── */}
            <div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                Let's Build Something Great
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(0,0,0,0.7)', lineHeight: 1.7, marginBottom: '32px' }}>
                Whether you need a full fleet wrapped, a new shop front sign, or custom workwear — our team is ready to help with a free consultation and quote.
              </p>

              {/* Info cards grid */}
              <div className="contact-info-grid">
                {contactItems.map(({ icon, title, content, link }) => (
                  <div
                    key={title}
                    style={{ padding: '18px 16px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)', borderRadius: '14px' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(232,0,13,0.07)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', flexShrink: 0 }}>
                      {icon}
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{title}</h4>
                    {link ? (
                      <a href={link} style={{ fontSize: '18px', color: 'var(--red)', fontWeight: 700, textDecoration: 'none', lineHeight: 1.7, display: 'block', wordBreak: 'break-all' }}>
                        {content}
                      </a>
                    ) : (
                      <p style={{ fontSize: '18px', color: 'rgba(0,0,0,0.7)', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>{content}</p>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Google Map */}
              <div style={{ marginTop: '36px', height: '280px', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid var(--border-color)' }}>
                <iframe
                  title="SD Sign Studio Location Map"
                  src={CONFIG.mapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* ── Contact Form Panel ── */}
            <div style={{ background: 'var(--bg-secondary)', padding: 'clamp(20px, 5vw, 40px)', borderRadius: '20px', border: '1.5px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Send a Message</h3>
              <p style={{ fontSize: '18px', color: 'rgba(0,0,0,0.7)', lineHeight: 1.7, marginBottom: '24px' }}>Fields marked * are required. You can attach drawings/files below.</p>
              <ContactForm theme="light" />
            </div>

          </div>
        </div>

        <CtaBand />
      </div>
    </>
  )
}
