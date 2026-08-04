import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useCountry } from '../context/CountryContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

function FlagIcon({ code }) {
  return (
    <span className={`country-flag-icon country-flag-${code.toLowerCase()}`} aria-hidden="true" style={{ flexShrink: 0 }}>
      {code === 'IN' && <span className="flag-wheel" />}
    </span>
  )
}

function CountryDropdown({ country, countries, setCountryCode, mobile = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (mobile) {
    return (
      <div ref={ref} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <FlagIcon code={country.code} />
            Pricing Country
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
            {country.label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </button>
        {open && (
          <div style={{ paddingBottom: '8px' }}>
            {countries.map(c => (
              <button
                key={c.code}
                onClick={() => { setCountryCode(c.code); setOpen(false) }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: c.code === country.code ? 'rgba(232,0,13,0.15)' : 'rgba(255,255,255,0.04)', border: 'none', cursor: 'pointer', color: c.code === country.code ? 'var(--red)' : 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: c.code === country.code ? 700 : 500, borderRadius: '8px', marginBottom: '4px', textAlign: 'left' }}
              >
                <FlagIcon code={c.code} />
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }} className="nav-country-desktop">
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1.5px solid #e5e7eb', borderRadius: '999px', background: '#fff', cursor: 'pointer', height: '34px' }}
      >
        <FlagIcon code={country.code} />
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: '160px', zIndex: 2000 }}>
          {countries.map(c => (
            <button
              key={c.code}
              onClick={() => { setCountryCode(c.code); setOpen(false) }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', background: c.code === country.code ? 'rgba(232,0,13,0.06)' : '#fff', border: 'none', cursor: 'pointer', color: c.code === country.code ? 'var(--red)' : '#111', fontSize: '14px', fontWeight: c.code === country.code ? 700 : 500, textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (c.code !== country.code) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={e => { if (c.code !== country.code) e.currentTarget.style.background = '#fff' }}
            >
              <FlagIcon code={c.code} />
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const { country, countries, setCountryCode } = useCountry()

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('navbar')
      if (nav) {
        nav.style.boxShadow = window.scrollY > 10
          ? '0 2px 20px rgba(0,0,0,0.12)'
          : '0 2px 12px rgba(0,0,0,0.08)'
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const isHome = location.pathname === '/'

  const navItems = [
    { label: 'Home', to: '/', hash: '' },
    { label: 'Services', to: '/services', hash: '' },
    { label: 'Products', to: '/shop', hash: '' },
    { label: 'Gallery', to: '/gallery', hash: '' },
    { label: 'About Us', to: '/about', hash: '' },
    { label: 'Contact', to: '/contact', hash: '' },
  ]

  const handleNavClick = (item) => {
    setMenuOpen(false)
    if (item.hash && isHome) {
      const el = document.querySelector(item.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogout = async () => {
    setMenuOpen(false)
    await supabase.auth.signOut()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <>
      <nav className="navbar" id="navbar">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <img 
              src="/images/logo.png" 
              alt="SD Sign Studio" 
              className="logo-img-desktop"
            />
            <img 
              src="/images/client-images/Navbar-horizontal.jpeg" 
              alt="SD Sign Studio" 
              className="logo-img-mobile"
            />
          </Link>
          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to + item.hash}
                className={
                  (item.to === '/' && !item.hash && isHome) ||
                  (item.to === '/shop' && location.pathname === '/shop')
                    ? 'active' : ''
                }
                onClick={() => handleNavClick(item)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <CountryDropdown country={country} countries={countries} setCountryCode={setCountryCode} />

            <Link to="/cart" style={{ color: 'var(--black)', display: 'flex', alignItems: 'center', position: 'relative' }} aria-label="Shopping Bag">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--red)', color: '#fff', fontSize: '10px', fontWeight: 800, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to={user ? "/account" : "/login"} style={{ color: 'var(--red)', display: 'flex', alignItems: 'center' }} aria-label="Account">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            
            <Link
              to="/quote"
              className="btn-red nav-cta-btn"
            >
              Get a Quote
            </Link>
          </div>

          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to + item.hash}
            onClick={() => handleNavClick(item)}
          >
            {item.label}
          </Link>
        ))}
        <CountryDropdown country={country} countries={countries} setCountryCode={setCountryCode} mobile={true} />
        {user ? (
          <>
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
            <button onClick={handleLogout} style={{ background: 'transparent', color: '#fff', border: 'none', padding: '16px', fontSize: '18px', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
        )}
        <Link
          to="/quote"
          onClick={() => setMenuOpen(false)}
          className="mob-cta"
          style={{ width: '100%', display: 'block', textAlign: 'center', fontFamily: 'var(--font)' }}
        >
          Get a Quote
        </Link>
      </div>
    </>
  )
}
