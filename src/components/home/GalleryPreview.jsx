import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { HOME_GALLERY_PREVIEW } from '../../data/galleryMedia'
import AutoplayVideo from '../AutoplayVideo'

const getMediaUrl = (item) => item.src || item.image || item.media_url
const getMediaType = (item) => {
  if (item.mediaType || item.media_type) return item.mediaType || item.media_type
  const url = getMediaUrl(item) || ''
  return /\.(mp4|webm|ogg|mov)$/i.test(url) ? 'video' : 'image'
}

function PreviewCard({ item, index, onOpen }) {
  const isVideo = getMediaType(item) === 'video'
  const mediaUrl = getMediaUrl(item)

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="gallery-preview-card"
      style={{ '--delay': `${index * 80}ms` }}
      aria-label={`Open ${item.category || 'gallery'} preview`}
    >
      <div className="gallery-preview-media">
        {isVideo ? (
          <AutoplayVideo src={mediaUrl} poster={item.fallback} />
        ) : (
          <img src={mediaUrl || item.fallback} alt="" />
        )}
        <div className="gallery-preview-shade" />
        <div className="gallery-preview-label">
          <span>{item.category}</span>
        </div>
      </div>
    </button>
  )
}

export default function GalleryPreview() {
  const [previewItems, setPreviewItems] = useState(HOME_GALLERY_PREVIEW)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadPreview() {
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .eq('media_type', 'video')
        .order('created_at', { ascending: false })
        .limit(4)

      if (!cancelled && data?.length > 0) {
        setPreviewItems(data.map(item => ({
          ...item,
          src: item.media_url || item.image,
          mediaType: item.media_type,
          fallback: item.media_type === 'image' ? (item.media_url || item.image) : HOME_GALLERY_PREVIEW[0]?.fallback,
        })))
      }
    }

    loadPreview()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedItem) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedItem(null)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedItem])

  if (previewItems.length === 0) return null

  return (
    <section className="gallery-preview-section">
      <div className="gallery-preview-inner">
        <div className="gallery-preview-heading">
          <span className="section-eyebrow">Latest Work</span>
          <h2 className="section-title">Gallery <span className="red">Preview</span></h2>
          <p>
            A quick look at recent wraps, shopfronts, sign boards, and illuminated installations.
          </p>
        </div>

        <div className="gallery-preview-grid">
          {previewItems.map((item, index) => (
            <PreviewCard key={getMediaUrl(item) || item.id} item={item} index={index} onOpen={setSelectedItem} />
          ))}
        </div>

        <div className="section-footer">
          <Link to="/gallery" className="btn-red">View Full Gallery</Link>
        </div>
      </div>

      {selectedItem && (
        <div
          className="home-gallery-lightbox"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery preview"
        >
          <div className="home-gallery-lightbox-inner" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="home-gallery-lightbox-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close preview"
            >
              &times;
            </button>
            {getMediaType(selectedItem) === 'video' ? (
              <video
                src={getMediaUrl(selectedItem)}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img src={getMediaUrl(selectedItem)} alt={selectedItem.title || selectedItem.category || 'Gallery preview'} />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
