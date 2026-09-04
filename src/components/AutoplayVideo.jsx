import { useEffect, useRef, useState } from 'react'
import { cloudinaryVideoPoster } from '../lib/media'

/**
 * A <video> that reliably autoplays muted, with a graceful image fallback.
 *
 * - React doesn't apply the `muted` attribute on first render, so browsers
 *   block autoplay; we force `el.muted = true` via a ref and call play().
 * - An IntersectionObserver pauses off-screen videos (the gallery grid renders
 *   many at once).
 * - If the video can't be decoded (e.g. an HEVC/H.265 clip in Chrome/Firefox),
 *   we swap in the Cloudinary still frame so the tile still shows real content.
 */
export default function AutoplayVideo({ src, poster, className, style, onError, ...rest }) {
  const ref = useRef(null)
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = failedSrc === src
  // prefer a real frame extracted from this video; fall back to a passed poster
  const still = cloudinaryVideoPoster(src) || poster

  useEffect(() => {
    const el = ref.current
    if (!el || failed) return

    el.muted = true
    el.defaultMuted = true

    const tryPlay = () => {
      const p = el.play()
      if (p && typeof p.catch === 'function') p.catch(() => { })
    }

    let observer
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) tryPlay()
          else el.pause()
        },
        { threshold: 0.15 },
      )
      observer.observe(el)
    } else {
      tryPlay()
    }

    el.addEventListener('loadeddata', tryPlay)
    el.addEventListener('canplay', tryPlay)

    return () => {
      el.removeEventListener('loadeddata', tryPlay)
      el.removeEventListener('canplay', tryPlay)
      observer?.disconnect()
    }
  }, [src, failed])

  const handleError = (e) => {
    setFailedSrc(src)
    onError?.(e)
  }

  if (failed && still) {
    return <img src={still} alt="" className={className} style={style} loading="lazy" />
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={still}
      className={className}
      style={style}
      onError={handleError}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      {...rest}
    />
  )
}
