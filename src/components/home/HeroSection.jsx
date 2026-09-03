import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createEmptyBannerSettings, getHeroSettings } from '../../data/heroService'

const MOBILE_QUERY = '(max-width: 767px)'

// Hardcoded fallback background used only when the admin hasn't published a
// banner image for this slot yet (or the banner service is unreachable).
const FALLBACK_IMAGE_BY_TYPE = {
  mobile: '/images/banner_mob.jpeg',
  desktop: '/images/banner_pc.jpeg',
}

// Static hero content that has no admin field yet — kept local instead of
// wiring up a new backend variable, per the "don't add new variable" brief.
const FEATURE_CARDS = [
  { icon: 'car', title: 'Vehicle Branding', desc: 'Turn your vehicles into moving advertisements.' },
  { icon: 'star', title: 'Premium Quality', desc: 'High-quality materials and perfect finishing.' },
  { icon: 'bolt', title: 'Fast Turnaround', desc: 'Quick production and on-time delivery.' },
  { icon: 'pin', title: 'Local & Professional', desc: 'Proudly serving businesses across the UK.' },
]

const FEATURE_ICON_PATHS = {
  car: ['M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0a2 2 0 00-2 2v4a1 1 0 001 1h1m14-7a2 2 0 012 2v4a1 1 0 01-1 1h-1M7 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z'],
  star: ['M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'],
  bolt: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
  pin: ['M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'],
}

function FeatureIcon({ name, size = 18 }) {
  const paths = FEATURE_ICON_PATHS[name] || []
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.2 8.6l5.6 3.4-5.6 3.4z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PersonIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.761-3.582-5-8-5z" />
    </svg>
  )
}

function RatingStar({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--red)" style={{ flexShrink: 0 }}>
      <path d={FEATURE_ICON_PATHS.star[0]} />
    </svg>
  )
}

// Renders a headline string as individual words, tinting the middle-ish
// word red so any admin-entered headline still gets the "accent word"
// treatment without needing a separate highlight field.
function HeadlineWords({ text, baseColor }) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return null
  const highlightIndex = Math.round((words.length - 1) / 2)
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', columnGap: '0.28em', rowGap: '0.06em' }}>
      {words.map((word, index) => (
        <span key={index} style={{ color: index === highlightIndex ? 'var(--red)' : baseColor }}>{word}</span>
      ))}
    </span>
  )
}

function EyebrowBadge({ style }) {
  return (
    <div className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
      Premium Signage &amp; Vehicle Branding Studio
    </div>
  )
}

const AVATAR_COLORS = ['#E8000D', '#2a2a2a', '#c00009', '#0a0a0a']

function TrustRow({ align = 'flex-start', textColor = '#0a0a0a', mutedColor = 'rgba(0,0,0,0.55)' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', alignItems: align }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex' }}>
          {AVATAR_COLORS.map((bg, index) => (
            <span
              key={index}
              style={{
                width: '30px', height: '30px', borderRadius: '50%', background: bg,
                border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', marginLeft: index === 0 ? 0 : '-10px', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              }}
            >
              <PersonIcon />
            </span>
          ))}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: textColor }}>
          Trusted by <span style={{ color: 'var(--red)' }}>2K+ Businesses</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {[0, 1, 2, 3, 4].map(i => <RatingStar key={i} />)}
        <span style={{ fontSize: '13px', fontWeight: 700, color: textColor, marginLeft: '4px' }}>4.9</span>
        <span style={{ fontSize: '12px', color: mutedColor }}>(230+ Reviews)</span>
      </div>
    </div>
  )
}

function FeatureGridMobile() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '4px 20px 32px' }}>
      {FEATURE_CARDS.map(card => (
        <div key={card.title} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '18px 14px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
          <span style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(232,0,13,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', marginBottom: '12px' }}>
            <FeatureIcon name={card.icon} size={19} />
          </span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0a0a0a', marginBottom: '6px' }}>{card.title}</div>
          <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.55)', lineHeight: 1.5, margin: '0 0 10px' }}>{card.desc}</p>
          <span style={{ display: 'block', width: '22px', height: '3px', borderRadius: '2px', background: 'var(--red)' }} />
        </div>
      ))}
    </div>
  )
}

function FeatureBarDesktop() {
  return (
    <div style={{ position: 'relative', zIndex: 5, maxWidth: 'calc(var(--content-w) - 40px)', margin: '-58px auto 0', background: '#fff', borderRadius: '20px', boxShadow: '0 24px 50px rgba(0,0,0,0.2)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '32px 8px' }}>
      {FEATURE_CARDS.map((card, index) => (
        <div key={card.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', padding: '0 28px', borderLeft: index === 0 ? 'none' : '1px solid rgba(0,0,0,0.08)' }}>
          <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(232,0,13,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}>
            <FeatureIcon name={card.icon} size={21} />
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0a0a0a' }}>{card.title}</div>
          <p style={{ fontSize: '18px', color: 'rgba(0,0,0,0.55)', lineHeight: 1.55, margin: 0 }}>{card.desc}</p>
          <span style={{ display: 'block', width: '22px', height: '3px', borderRadius: '2px', background: 'var(--red)' }} />
        </div>
      ))}
    </div>
  )
}

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

function BannerMedia({ media, active, total, onEnded, overlayOpacity, onError }) {
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
        onError={onError}
        style={style}
      />
    )
  }

  return (
    <img
      src={media.secureUrl}
      alt={media.altText || ''}
      fetchPriority={active ? 'high' : 'auto'}
      onError={onError}
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

function MobileBanner({ settings, onMediaError }) {
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
      <div style={{ position: 'relative' }}>
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
            onError={() => onMediaError(activeMedia.secureUrl)}
          />

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 45%, transparent 70%)', zIndex: 2 }} />
        </div>

        <div style={{ position: 'absolute', left: '20px', bottom: '18px', zIndex: 11 }}>
          <EyebrowBadge style={{ background: 'rgba(255,255,255,0.94)', border: '1px solid rgba(232,0,13,0.25)', boxShadow: '0 4px 12px rgba(0,0,0,0.18)', fontSize: 'clamp(8px, 2.4vw, 10px)', letterSpacing: 'clamp(0.4px, 0.3vw, 1.5px)', whiteSpace: 'nowrap', marginBottom: 0 }} />
        </div>
      </div>

      <BannerDots count={media.length} activeIndex={activeIndex} />

      <div style={{ display: 'flex', flexDirection: 'column', padding: '18px 20px 26px' }}>
        <h1 style={{ fontWeight: 900, color: '#0a0a0a', fontSize: 'clamp(34px, 10vw, 50px)', lineHeight: 1.05, letterSpacing: '-2px', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: 'var(--font)' }}>
          <HeadlineWords text={headline} baseColor="#0a0a0a" />
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.58)', lineHeight: 1.65, margin: '0 0 22px' }}>
          {description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '26px' }}>
          <Link to="/quote" className="btn-red" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '15px' }}>
            Get a Free Quote <ArrowRightIcon />
          </Link>
          <Link to="/gallery" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '15px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.15)', color: '#0a0a0a', fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase' }}>
            Explore Our Work <PlayIcon />
          </Link>
        </div>
        <TrustRow />
      </div>

      <FeatureGridMobile />
    </section>
  )
}

function DesktopBanner({ settings, onMediaError }) {
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
    <>
      <section className="hero" id="hero" style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center', paddingTop: 'var(--nav-h)', paddingBottom: '80px', background: 'var(--black)' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <BannerMedia
            key={activeMedia.id}
            media={activeMedia}
            active={true}
            total={media.length}
            onEnded={showNext}
            overlayOpacity={0.85}
            onError={() => onMediaError(activeMedia.secureUrl)}
          />
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(90deg, rgba(5,5,5,0.94) 0%, rgba(5,5,5,0.8) 32%, rgba(5,5,5,0.4) 62%, rgba(5,5,5,0.12) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, var(--red), #ff4d4d, var(--red))', zIndex: 4 }} />

        <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 'var(--content-w)', margin: '0 auto', padding: '40px var(--content-px)', color: '#fff' }}>
          <div style={{ maxWidth: '620px' }}>
            <EyebrowBadge />
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(40px, 5vw, 62px)', lineHeight: 1.08, letterSpacing: '-1.5px', textTransform: 'uppercase', margin: '18px 0 22px' }}>
              <HeadlineWords text={headline} baseColor="#fff" />
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.82)', maxWidth: '520px', margin: '0 0 32px', lineHeight: 1.6 }}>
              {description}
            </p>
            <div className="hero-btns" style={{ marginBottom: '36px' }}>
              <Link to="/quote" className="btn-red" style={{ boxShadow: '0 4px 12px rgba(232,0,13,0.3)' }}>
                Get a Free Quote <ArrowRightIcon />
              </Link>
              <Link to="/gallery" className="btn-outline" style={{ border: '2px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                Explore Our Work <PlayIcon />
              </Link>
            </div>
            <TrustRow align="flex-start" textColor="#fff" mutedColor="rgba(255,255,255,0.65)" />
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

      <FeatureBarDesktop />
    </>
  )
}

function BannerLoading() {
  return <section aria-label="Loading homepage banner" style={{ minHeight: '100vh', paddingTop: 'var(--nav-h)', background: '#111' }} />
}

// Builds a fully hardcoded hero (headline, subheadline, background image)
// for when the admin banner service has nothing published yet, or the
// request to load it failed.
function buildFallbackSettings(bannerType) {
  const base = createEmptyBannerSettings(bannerType)
  return {
    ...base,
    media: [{
      id: `fallback-${bannerType}`,
      resourceType: 'image',
      secureUrl: FALLBACK_IMAGE_BY_TYPE[bannerType],
      altText: 'SD Signs Studio — premium signage and vehicle branding',
      headline: '',
      description: '',
    }],
  }
}

// Fills in any missing piece (headline / subheadline / background image)
// of admin-provided settings with the hardcoded fallback, field by field.
function mergeWithFallback(bannerType, settings) {
  const fallback = buildFallbackSettings(bannerType)
  return {
    ...settings,
    headline: settings.headline && settings.headline.trim() ? settings.headline : fallback.headline,
    subheadline: settings.subheadline && settings.subheadline.trim() ? settings.subheadline : fallback.subheadline,
    media: settings.media && settings.media.length > 0 ? settings.media : fallback.media,
  }
}

export default function HeroSection() {
  const isMobile = useMobileViewport()
  const bannerType = isMobile ? 'mobile' : 'desktop'
  const [bannerState, setBannerState] = useState(() => ({
    bannerType,
    settings: buildFallbackSettings(bannerType),
    hidden: false,
  }))

  useEffect(() => {
    let cancelled = false

    const loadSettings = async () => {
      try {
        const settings = await getHeroSettings(bannerType)
        if (cancelled) return
        if (settings.isEnabled === false) {
          setBannerState({ bannerType, settings: null, hidden: true })
          return
        }
        setBannerState({ bannerType, settings: mergeWithFallback(bannerType, settings), hidden: false })
      } catch (error) {
        console.error('Homepage banner data unavailable, using defaults', { bannerType, error })
        if (!cancelled) setBannerState({ bannerType, settings: buildFallbackSettings(bannerType), hidden: false })
      }
    }

    loadSettings()

    const handleUpdate = event => {
      if (!event.detail?.bannerType || event.detail.bannerType === bannerType) {
        loadSettings()
      }
    }

    window.addEventListener('hero-settings-updated', handleUpdate)
    return () => {
      cancelled = true
      window.removeEventListener('hero-settings-updated', handleUpdate)
    }
  }, [bannerType])

  const handleMediaError = failedSecureUrl => {
    setBannerState(current => {
      if (current.bannerType !== bannerType || !current.settings) return current
      const fallback = buildFallbackSettings(bannerType)
      // Avoid looping forever if the local fallback image itself can't load.
      if (failedSecureUrl === fallback.media[0].secureUrl) return current
      console.error('Homepage banner image failed to load, switching to the hardcoded fallback', { bannerType, failedSecureUrl })
      return { bannerType, settings: fallback, hidden: false }
    })
  }

  if (bannerState.bannerType !== bannerType) return <BannerLoading />
  if (bannerState.hidden || !bannerState.settings) return null

  const renderKey = `${bannerType}-${bannerState.settings.updatedAt || 'fallback'}`
  return isMobile
    ? <MobileBanner key={renderKey} settings={bannerState.settings} onMediaError={handleMediaError} />
    : <DesktopBanner key={renderKey} settings={bannerState.settings} onMediaError={handleMediaError} />
}
