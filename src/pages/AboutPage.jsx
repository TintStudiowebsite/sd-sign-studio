import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AboutSection from '../components/home/AboutSection'
import CtaBand from '../components/home/CtaBand'
import { CONFIG } from '../data/config'

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div className="shop-banner">
        <div className="shop-banner-inner">
          <h1 style={{ fontFamily: 'serif', fontWeight: 600 }}>About Us</h1>
          <p>Learn more about SD Sign Studio and our commitment to quality.</p>
          <div className="shop-breadcrumb" style={{ justifyContent: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.7)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
            <span className="sep" style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{ color: '#fff' }}>About Us</span>
          </div>
        </div>
      </div>

      {/* Reusing Home About Section */}
      <AboutSection theme="light" />

      {/* Additional Professional Content - Premium Reddish Light Section */}
      <div style={{ background: '#fff6f6', padding: '90px 24px', borderTop: '1.5px solid rgba(232,0,13,0.15)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            
            <div 
              style={{ background: '#ffffff', padding: '48px 40px', borderRadius: '20px', border: '1.5px solid #e5e7eb', borderTop: '4px solid var(--red)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(232,0,13,0.05)'
                e.currentTarget.style.borderColor = 'rgba(232,0,13,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(232,0,13,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--black)', marginBottom: '14px' }}>Our Mission</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                At SD Sign Studio, our mission is to empower businesses with bold, high-quality visual branding. We believe that a strong first impression is the cornerstone of success, and we strive to provide innovative print and signage solutions that make our clients unforgettable.
              </p>
            </div>

            <div 
              style={{ background: '#ffffff', padding: '48px 40px', borderRadius: '20px', border: '1.5px solid #e5e7eb', borderTop: '4px solid var(--red)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(232,0,13,0.05)'
                e.currentTarget.style.borderColor = 'rgba(232,0,13,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(232,0,13,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--black)', marginBottom: '14px' }}>Quality Craftsmanship</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                We don't cut corners. From premium Hexis wrap materials for vehicles to weather-resistant outdoor signs, our production process utilizes state-of-the-art technology to ensure durability, vivid colors, and a flawless finish every single time.
              </p>
            </div>

            <div 
              style={{ background: '#ffffff', padding: '48px 40px', borderRadius: '20px', border: '1.5px solid #e5e7eb', borderTop: '4px solid var(--red)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(232,0,13,0.05)'
                e.currentTarget.style.borderColor = 'rgba(232,0,13,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(232,0,13,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--black)', marginBottom: '14px' }}>Customer First</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                Our clients are at the heart of everything we do. With over a decade of experience, our dedicated team offers expert guidance from initial design concepts to the final installation. Your satisfaction and business growth are our ultimate rewards.
              </p>
            </div>

          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '56px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>Prefer to talk?</span>
            <a
              href={`tel:${CONFIG.phoneE164}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', borderRadius: '999px', background: 'var(--red)', color: '#fff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', textDecoration: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
              </svg>
              Call {CONFIG.phone}
            </a>
            <a
              href={CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', borderRadius: '999px', background: '#25D366', color: '#fff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', textDecoration: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      <CtaBand />
    </div>
  )
}
