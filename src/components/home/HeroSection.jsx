import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHeroSettings } from '../../data/heroService'

const MOBILE_QUERY = '(max-width: 767px)'

function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY)
    const handleChange = event => setIsMobile(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}

function BannerMedia({ media, active, total, onEnded, overlayOpacity }) {
  const style = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: active ? overlayOpacity : 0,
    transition: 'opacity 0.8s ease-in-out',
    zIndex: active ? 1 : 0,
  }

  if (media.resourceType === 'video') {
    return (
      <video
        src={media.secureUrl}
        autoPlay={active}
        muted
        loop={total === 1}
        playsInline
        preload={active ? 'auto' : 'metadata'}
        onEnded={active ? onEnded : undefined}
        style={style}
      />
    )
  }

  return (
    <img
      src={media.secureUrl}
      alt={media.altText || ''}
      fetchPriority={active ? 'high' : 'auto'}
      style={style}
    />
  )
}

function BannerDots({ count, activeIndex }) {
  if (count <= 1) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', padding: '10px 0 0' }} aria-label={`Banner slide ${activeIndex + 1} of ${count}`}>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          style={{
            width: index === activeIndex ? '22px' : '7px',
            height: '7px',
            borderRadius: '4px',
            background: index === activeIndex ? 'var(--red)' : 'rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}

function MobileBanner({ settings }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)
  const media = settings.media
  const activeMedia = media[activeIndex]

  const showNext = () => {
    if (media.length > 1) setActiveIndex(current => (current + 1) % media.length)
  }

  const showPrevious = () => {
    if (media.length > 1) setActiveIndex(current => (current - 1 + media.length) % media.length)
  }

  useEffect(() => {
    if (media.length <= 1 || activeMedia.resourceType === 'video') return undefined
    const timer = window.setTimeout(() => {
      setActiveIndex(current => (current + 1) % media.length)
    }, settings.transitionMs)
    return () => window.clearTimeout(timer)
  }, [activeIndex, activeMedia.resourceType, media.length, settings.transitionMs])

  const handleTouchEnd = event => {
    if (touchStartX === null) return
    const difference = touchStartX - event.changedTouches[0].clientX
    if (Math.abs(difference) > 40) {
      if (difference > 0) showNext()
      else showPrevious()
    }
    setTouchStartX(null)
  }

  const headline = activeMedia.headline || settings.headline
  const description = activeMedia.description || settings.subheadline

  return (
    <section id="hero" style={{ background: '#fff', display: 'flex', flexDirection: 'column', paddingTop: 'var(--nav-h)' }}>
      <div style={{ position: 'relative', paddingBottom: '14px' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', overflow: 'hidden', background: '#111' }}>
          <div
            onTouchStart={event => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
            style={{ position: 'absolute', inset: 0, zIndex: 10 }}
            aria-hidden="true"
          />

          <BannerMedia
            key={activeMedia.id}
            media={activeMedia}
            active={true}
            total={media.length}
            onEnded={showNext}
            overlayOpacity={1}
          />
        </div>

        <div style={{ position: 'absolute', left: '50%', bottom: '14px', zIndex: 11, transform: 'translate(-50%, 50%)', display: 'inline-flex', alignItems: 'center', background: '#fff', border: '1px solid rgba(232,0,13,0.2)', color: 'var(--red)', borderRadius: '20px', padding: '5px 14px', fontSize: 'clamp(8px, 2.5vw, 10px)', fontWeight: 800, letterSpacing: 'clamp(1px, 0.4vw, 2px)', textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
          Signage &amp; Vehicle Branding
        </div>
      </div>

      <BannerDots count={media.length} activeIndex={activeIndex} />

      <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px 24px' }}>
        <h1 style={{ fontWeight: 900, color: '#0a0a0a', fontSize: 'clamp(34px, 10vw, 50px)', lineHeight: 1.05, letterSpacing: '-2px', margin: '0 0 12px', fontFamily: 'var(--font)' }}>
          {headline}
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.58)', lineHeight: 1.65, margin: '0 0 20px' }}>
          {description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/quote" className="btn-red" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '15px' }}>Get a Free Quote</Link>
          <Link to="/gallery" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '15px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.15)', color: '#0a0a0a', fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase' }}>
            View Our Work
          </Link>
        </div>
      </div>
    </section>
  )
}

function DesktopBanner({ settings }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const media = settings.media
  const activeMedia = media[activeIndex]

  const showNext = () => {
    if (media.length > 1) setActiveIndex(current => (current + 1) % media.length)
  }

  useEffect(() => {
    if (media.length <= 1 || activeMedia.resourceType === 'video') return undefined
    const timer = window.setTimeout(() => {
      setActiveIndex(current => (current + 1) % media.length)
    }, settings.transitionMs)
    return () => window.clearTimeout(timer)
  }, [activeIndex, activeMedia.resourceType, media.length, settings.transitionMs])

  const headline = activeMedia.headline || settings.headline
  const description = activeMedia.description || settings.subheadline

  return (
    <section className="hero" id="hero" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 'var(--nav-h)', background: 'var(--black)' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <BannerMedia
          key={activeMedia.id}
          media={activeMedia}
          active={true}
          total={media.length}
          onEnded={showNext}
          overlayOpacity={0.68}
        />
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(10,10,10,0.48)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, var(--red), #ff4d4d, var(--red))', zIndex: 4 }} />

      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: '850px', margin: '0 auto', padding: '40px 24px', textAlign: 'center', color: '#fff' }}>
        <div className="hero-eyebrow" style={{ background: 'rgba(232,0,13,0.12)', border: '1px solid rgba(232,0,13,0.3)', color: '#ff3440', margin: '0 auto 20px', width: 'fit-content' }}>
          Signage &amp; Vehicle Branding Studio
        </div>
        <h1 className="hero-headline" style={{ fontWeight: 900, color: '#fff', fontSize: 'clamp(40px, 5.5vw, 64px)', lineHeight: 1.1, letterSpacing: '-1.5px', margin: '16px 0 24px' }}>
          {headline}
        </h1>
        <p className="hero-sub" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', maxWidth: '680px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          {description}
        </p>
        <div className="hero-btns" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/quote" className="btn-red" style={{ boxShadow: '0 4px 12px rgba(232,0,13,0.3)' }}>Get a Free Quote</Link>
          <Link to="/gallery" className="btn-outline" style={{ border: '2px solid rgba(255,255,255,0.3)', color: '#fff' }}>View Our Work</Link>
        </div>
      </div>

      {media.length > 1 && (
        <div style={{ position: 'absolute', left: '50%', bottom: '24px', transform: 'translateX(-50%)', zIndex: 4, display: 'flex', gap: '7px' }}>
          {media.map((item, index) => (
            <span key={item.id} style={{ width: index === activeIndex ? '26px' : '8px', height: '8px', borderRadius: '5px', background: index === activeIndex ? '#E8000D' : 'rgba(255,255,255,0.45)', transition: 'all 0.3s ease' }} />
          ))}
        </div>
      )}
    </section>
  )
}

function BannerLoading() {
  return <section aria-label="Loading homepage banner" style={{ minHeight: '100vh', paddingTop: 'var(--nav-h)', background: '#111' }} />
}

function BannerError() {
  return (
    <section style={{ minHeight: '55vh', padding: 'calc(var(--nav-h) + 60px) 24px 60px', background: '#111', color: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Homepage banner unavailable</h1>
        <p style={{ color: 'rgba(255,255,255,0.68)' }}>Please try again shortly.</p>
      </div>
    </section>
  )
}

export default function HeroSection() {
  const isMobile = useMobileViewport()
  const bannerType = isMobile ? 'mobile' : 'desktop'
  const [bannerState, setBannerState] = useState({ bannerType: null, settings: null, error: null })

  useEffect(() => {
    let cancelled = false

    const loadSettings = async () => {
      try {
        const settings = await getHeroSettings(bannerType)
        if (!cancelled) setBannerState({ bannerType, settings, error: null })
      } catch (error) {
        console.error('Homepage banner loading failed', { bannerType, error })
        if (!cancelled) setBannerState({ bannerType, settings: null, error })
      }
    }

    const handleUpdate = event => {
      if (!event.detail?.bannerType || event.detail.bannerType === bannerType) {
        loadSettings()
      }
    }

    loadSettings()
    window.addEventListener('hero-settings-updated', handleUpdate)
    return () => {
      cancelled = true
      window.removeEventListener('hero-settings-updated', handleUpdate)
    }
  }, [bannerType])

  if (bannerState.bannerType !== bannerType) return <BannerLoading />
  if (bannerState.error) return <BannerError />
  if (!bannerState.settings?.isEnabled) return null
  if (bannerState.settings.media.length === 0) return <BannerError />

  const renderKey = `${bannerType}-${bannerState.settings.updatedAt}`
  return isMobile
    ? <MobileBanner key={renderKey} settings={bannerState.settings} />
    : <DesktopBanner key={renderKey} settings={bannerState.settings} />
}
