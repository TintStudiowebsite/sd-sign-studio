import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGalleryBannerSettings } from '../../data/galleryBannerService'

const toTitleCase = (str) =>
  str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

const isVideoUrl = (url) => {
  if (!url) return false
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.includes('video')
}

const getSlideUrl = (slide) => (typeof slide === 'string' ? slide : slide?.image || '')

export default function GalleryHeroBanner() {
  const [settings, setSettings] = useState(getGalleryBannerSettings())
  const [activeMode, setActiveMode] = useState(() => settings.videoUrl ? 'video' : 'slideshow')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const videoRefs = useRef([])
  const touchStartX = useRef(null)

  const slides = useMemo(() => settings.slides || [], [settings.slides])
  const hasVideo = settings.mediaType === 'video' && Boolean(settings.videoUrl)
  const hasSlides = slides.length > 0

  useEffect(() => {
    const handleUpdate = () => setSettings(getGalleryBannerSettings())
    window.addEventListener('gallery-banner-settings-updated', handleUpdate)
    return () => window.removeEventListener('gallery-banner-settings-updated', handleUpdate)
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (hasVideo && hasSlides) {
      if (activeMode === 'video') {
        const timer = setTimeout(() => { setActiveMode('slideshow'); setCurrentSlide(0) }, 7000)
        return () => clearTimeout(timer)
      }

      const timer = setInterval(() => {
        setCurrentSlide(prev => {
          if (prev >= slides.length - 1) { setActiveMode('video'); return 0 }
          return prev + 1
        })
      }, 3000)
      return () => clearInterval(timer)
    } else if (hasVideo) {
      setActiveMode('video')
    } else if (hasSlides) {
      setActiveMode('slideshow')
      if (slides.length > 1) {
        const timer = setInterval(() => {
          setCurrentSlide(prev => (prev + 1) % slides.length)
        }, 3000)
        return () => clearInterval(timer)
      }
    }
  }, [activeMode, hasSlides, hasVideo, slides.length])

  useEffect(() => {
    if (activeMode === 'video') {
      videoRefs.current[0]?.play().catch(() => { })
    } else {
      videoRefs.current[currentSlide + 1]?.play().catch(() => { })
    }
  }, [activeMode, currentSlide])

  const handleNext = () => {
    if (activeMode === 'slideshow' && slides.length > 1) {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }
  }

  const handlePrev = () => {
    if (activeMode === 'slideshow' && slides.length > 1) {
      setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
    }
  }

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
  }

  const activeHeadline = 'Our Gallery'
  const activeSubheadline = 'Explore recent vehicle wraps, storefront installations, illuminated signage, and custom print projects.'
  const totalMobileSlides = (hasVideo ? 1 : 0) + slides.length
  const mobileSlideIndex = activeMode === 'video' ? 0 : (hasVideo ? currentSlide + 1 : currentSlide)

  if (isMobile) {
    return (
      <section id="hero" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', paddingTop: 'var(--nav-h)' }}>
        <div style={{ padding: 0 }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: 0,
              overflow: 'hidden',
              height: '54vw',
              minHeight: '200px',
              maxHeight: '300px',
              background: '#111',
            }}
          >
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ position: 'absolute', inset: 0, zIndex: 10 }}
            />

            {hasVideo && (
              <video
                ref={el => videoRefs.current[0] = el}
                src={settings.videoUrl}
                autoPlay muted loop playsInline
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                  opacity: activeMode === 'video' ? 1 : 0,
                  transition: 'opacity 0.8s ease',
                  zIndex: activeMode === 'video' ? 1 : 0,
                }}
              />
            )}

            {slides.map((slide, idx) => {
              const mediaUrl = getSlideUrl(slide)
              if (!mediaUrl) return null
              const active = activeMode === 'slideshow' && idx === currentSlide
              return isVideoUrl(mediaUrl) ? (
                <video
                  key={'m-vid-' + idx}
                  ref={el => videoRefs.current[idx + 1] = el}
                  src={mediaUrl}
                  autoPlay muted loop playsInline
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                    opacity: active ? 1 : 0, transition: 'opacity 0.8s ease', zIndex: active ? 1 : 0,
                  }}
                />
              ) : (
                <img
                  key={'m-img-' + idx}
                  src={mediaUrl}
                  alt=""
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                    opacity: active ? 1 : 0, transition: 'opacity 0.8s ease', zIndex: active ? 1 : 0,
                  }}
                />
              )
            })}
          </div>
        </div>

        {totalMobileSlides > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', padding: '10px 0 0' }}>
            {Array.from({ length: totalMobileSlides }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === mobileSlideIndex ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  background: i === mobileSlideIndex ? 'var(--red)' : 'rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px 20px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(232,0,13,0.07)', border: '1px solid rgba(232,0,13,0.2)',
            color: 'var(--red)', borderRadius: '20px', padding: '5px 14px',
            fontSize: '10px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
            marginBottom: '14px', alignSelf: 'flex-start',
          }}>
            Project Gallery
          </div>

          <h1 style={{
            fontWeight: 900,
            color: '#0a0a0a',
            fontSize: 'clamp(34px, 10vw, 50px)',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            margin: '0 0 12px',
            fontFamily: 'var(--font)',
          }}>
            {toTitleCase(activeHeadline)}
          </h1>

          <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.55)', lineHeight: 1.65, marginBottom: activeSubheadline.length > 100 ? '20px' : '14px' }}>
            {activeSubheadline}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/quote" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '15px', borderRadius: '10px',
              background: 'var(--red)', color: '#fff',
              fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px',
              textDecoration: 'none', textTransform: 'uppercase',
              boxShadow: '0 4px 16px rgba(232,0,13,0.25)',
            }}>
              Get a Free Quote
            </Link>
            <Link to="/gallery" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '15px', borderRadius: '10px',
              border: '1.5px solid rgba(0,0,0,0.15)', color: '#0a0a0a',
              fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px',
              textDecoration: 'none', textTransform: 'uppercase', background: 'transparent',
            }}>
              View Our Work
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="hero" id="hero" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 'var(--nav-h)', paddingBottom: '0px', background: 'var(--black)' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, var(--red), #ff4d4d, var(--red))', zIndex: 10 }} />

      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 0, overflow: 'hidden' }}>
        {hasVideo && (
          <video
            ref={el => videoRefs.current[0] = el}
            src={settings.videoUrl}
            autoPlay muted loop playsInline
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              opacity: activeMode === 'video' ? 0.65 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: activeMode === 'video' ? 1 : 0,
            }}
          />
        )}

        {slides.map((slide, idx) => {
          const mediaUrl = getSlideUrl(slide)
          if (!mediaUrl) return null
          const active = activeMode === 'slideshow' && idx === currentSlide
          return isVideoUrl(mediaUrl) ? (
            <video
              key={'bg-vid-' + idx}
              ref={el => videoRefs.current[idx + 1] = el}
              src={mediaUrl}
              autoPlay muted loop playsInline
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: active ? 0.65 : 0, transition: 'opacity 1s ease-in-out', zIndex: active ? 1 : 0,
              }}
            />
          ) : (
            <img
              key={'bg-img-' + idx}
              src={mediaUrl}
              alt=""
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: active ? 0.65 : 0, transition: 'opacity 1s ease-in-out', zIndex: active ? 1 : 0,
              }}
            />
          )
        })}
      </div>

      <div className="hero-slide" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', minHeight: 'auto', background: 'transparent', width: '100%' }}>
        <div className="hero-overlay" style={{ background: 'rgba(10, 10, 10, 0.6)' }} />

        <div className="hero-content" style={{ height: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '800px', margin: '0 auto', width: '100%', padding: '12px 10px' }}>
          <div className="hero-eyebrow" style={{ background: 'rgba(232,0,13,0.12)', border: '1px solid rgba(232,0,13,0.3)', color: 'var(--red)', margin: '0 0 20px' }}>
            Project Gallery
          </div>
          <h1 className="hero-headline" style={{ fontWeight: 900, color: 'var(--white)', fontSize: 'clamp(40px, 5.5vw, 64px)', lineHeight: '1.1', letterSpacing: '-1.5px', margin: '16px 0 24px' }}>
            {activeHeadline}
          </h1>
          <p className="hero-sub" style={{ fontSize: '18px', color: 'var(--white)', maxWidth: '640px', marginBottom: '36px', lineHeight: 1.6 }}>
            {activeSubheadline}
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '16px', marginBottom: '0', justifyContent: 'center' }}>
            <Link to="/quote" className="btn-red" style={{ boxShadow: '0 4px 12px rgba(232,0,13,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Get a Free Quote
            </Link>
            <Link to="/gallery" className="btn-outline" style={{ border: '2px solid rgba(255,255,255,0.2)', color: 'var(--white)' }}>
              View Our Work
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
