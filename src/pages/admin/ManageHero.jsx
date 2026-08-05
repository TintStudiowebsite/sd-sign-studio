import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  BANNER_TYPE_CONFIG,
  createEmptyBannerSettings,
  getHeroSettings,
  saveHeroSettings,
} from '../../data/heroService'
import {
  MAX_MEDIA_ITEMS,
  assertBannerAspectRatio,
  deleteBannerMedia,
  inspectBannerFile,
  uploadBannerMedia,
} from '../../lib/bannerMedia'
import { Icon } from './icon'

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)',
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'var(--font)',
  outline: 'none',
  background: '#fff',
  color: '#111827',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: '#374151',
  marginBottom: '6px',
}

const formatBytes = bytes => {
  if (!Number.isFinite(Number(bytes))) return 'Unknown size'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MediaPreview({ media, opacity }) {
  if (!media) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#9ca3af' }}>
        <Icon name="photo" size={30} />
      </div>
    )
  }

  const mediaStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity,
  }

  if (media.resourceType === 'video') {
    return <video src={media.secureUrl} muted loop playsInline autoPlay style={mediaStyle} />
  }

  return <img src={media.secureUrl} alt={media.altText || ''} style={mediaStyle} />
}

function LoadingCard({ label }) {
  return (
    <div style={{ ...cardStyle, padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
      Loading {label.toLowerCase()} settings...
    </div>
  )
}

function MediaCard({
  media,
  index,
  total,
  uploading,
  selected,
  onSelect,
  onMove,
  onRemove,
  onReplace,
  onTextChange,
}) {
  return (
    <article
      style={{
        border: selected ? '2px solid #E8000D' : '1.5px solid #e5e7eb',
        borderRadius: '12px',
        padding: '14px',
        background: '#fff',
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        style={{ width: '100%', height: '150px', display: 'block', padding: 0, border: 'none', borderRadius: '8px', overflow: 'hidden', background: '#111', cursor: 'pointer' }}
        aria-label={`Preview media item ${index + 1}`}
      >
        <MediaPreview media={media} opacity={1} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>
            {index + 1}. {media.resourceType === 'video' ? 'Video' : 'Image'}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
            {media.width} × {media.height} · {formatBytes(media.bytes)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          <button type="button" onClick={() => onMove(index, index - 1)} disabled={uploading || index === 0} className="banner-icon-button" title="Move earlier">↑</button>
          <button type="button" onClick={() => onMove(index, index + 1)} disabled={uploading || index === total - 1} className="banner-icon-button" title="Move later">↓</button>
          <button type="button" onClick={onRemove} disabled={uploading} className="banner-icon-button banner-delete-button" title="Delete media">
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
        <div>
          <label style={labelStyle}>Slide headline</label>
          <input value={media.headline} onChange={event => onTextChange('headline', event.target.value)} style={inputStyle} placeholder="Optional; uses the default headline when empty" />
        </div>
        <div>
          <label style={labelStyle}>Slide description</label>
          <textarea value={media.description} onChange={event => onTextChange('description', event.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional; uses the default description when empty" />
        </div>
        <div>
          <label style={labelStyle}>Accessible alt text</label>
          <input value={media.altText} onChange={event => onTextChange('altText', event.target.value)} style={inputStyle} placeholder="Describe this banner image" />
        </div>

        <input
          id={`replace-banner-media-${media.id}`}
          type="file"
          accept="image/*,video/*"
          onChange={event => onReplace(event, index)}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <label
          htmlFor={`replace-banner-media-${media.id}`}
          style={{ border: '1.5px solid #d1d5db', borderRadius: '8px', padding: '9px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#374151', cursor: uploading ? 'not-allowed' : 'pointer', background: '#fff', opacity: uploading ? 0.6 : 1 }}
        >
          Replace Image or Video
        </label>
      </div>
    </article>
  )
}

export default function ManageHero({ bannerType }) {
  const config = BANNER_TYPE_CONFIG[bannerType]
  const [settings, setSettings] = useState(() => createEmptyBannerSettings(bannerType))
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pendingDeletion, setPendingDeletion] = useState([])

  useEffect(() => {
    let cancelled = false

    getHeroSettings(bannerType)
      .then(data => {
        if (cancelled) return
        setSettings(data)
        setSelectedIndex(0)
        setPendingDeletion([])
      })
      .catch(error => {
        if (!cancelled) setLoadError(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [bannerType, reloadToken])

  if (!config) {
    throw new TypeError(`Unsupported banner type: ${bannerType}`)
  }

  const updateSetting = (field, value) => {
    setSettings(current => ({ ...current, [field]: value }))
  }

  const updateMediaText = (index, field, value) => {
    setSettings(current => ({
      ...current,
      media: current.media.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }))
  }

  const queueForDeletion = media => {
    setPendingDeletion(current => (
      current.some(item => item.publicId === media.publicId) ? current : [...current, media]
    ))
  }

  const uploadFile = async file => {
    const inspection = await inspectBannerFile(file, bannerType)
    return uploadBannerMedia(file, bannerType, inspection)
  }

  const handleAddMedia = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (settings.media.length >= MAX_MEDIA_ITEMS) {
      toast.error(`You can add up to ${MAX_MEDIA_ITEMS} banner media items`)
      return
    }

    setUploading(true)
    toast.loading(`Validating and uploading ${file.name}...`, { id: 'banner-upload' })

    try {
      const media = await uploadFile(file)
      setSettings(current => ({
        ...current,
        isEnabled: current.media.length === 0 ? true : current.isEnabled,
        media: [...current.media, media],
      }))
      setSelectedIndex(settings.media.length)
      toast.success('Banner media uploaded. Publish to make it live.', { id: 'banner-upload' })
    } catch (error) {
      toast.error(error.message, { id: 'banner-upload', duration: 7000 })
    } finally {
      setUploading(false)
    }
  }

  const handleReplaceMedia = async (event, index) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    toast.loading(`Validating and uploading ${file.name}...`, { id: 'banner-upload' })

    try {
      const replacement = await uploadFile(file)
      const replacedMedia = settings.media[index]
      setSettings(current => ({
        ...current,
        media: current.media.map((item, itemIndex) => itemIndex === index
          ? {
              ...replacement,
              headline: item.headline,
              description: item.description,
              altText: item.altText,
            }
          : item),
      }))
      queueForDeletion(replacedMedia)
      setSelectedIndex(index)
      toast.success('Media replaced. Publish to make it live.', { id: 'banner-upload' })
    } catch (error) {
      toast.error(error.message, { id: 'banner-upload', duration: 7000 })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveMedia = index => {
    const removedMedia = settings.media[index]
    queueForDeletion(removedMedia)
    setSettings(current => ({
      ...current,
      media: current.media.filter((_, itemIndex) => itemIndex !== index),
    }))
    setSelectedIndex(current => Math.max(0, Math.min(current, settings.media.length - 2)))
  }

  const handleMoveMedia = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= settings.media.length) return

    setSettings(current => {
      const media = [...current.media]
      const [movedItem] = media.splice(fromIndex, 1)
      media.splice(toIndex, 0, movedItem)
      return { ...current, media }
    })
    setSelectedIndex(current => {
      if (current === fromIndex) return toIndex
      if (current === toIndex) return fromIndex
      return current
    })
  }

  const handleSave = async () => {
    if (!settings.headline.trim()) {
      toast.error('The default banner headline is required')
      return
    }

    if (!Number.isInteger(settings.transitionMs) || settings.transitionMs < 1000 || settings.transitionMs > 60000) {
      toast.error('Image duration must be between 1 and 60 seconds')
      return
    }

    if (settings.isEnabled && settings.media.length === 0) {
      toast.error(`Add at least one ${config.ratioLabel} image or video before publishing`)
      return
    }

    try {
      settings.media.forEach(media => {
        assertBannerAspectRatio(media.width, media.height, bannerType)
      })
    } catch (error) {
      toast.error(error.message)
      return
    }

    setSaving(true)
    toast.loading(`Publishing the ${config.label.toLowerCase()}...`, { id: 'banner-save' })

    try {
      const savedSettings = await saveHeroSettings(settings)
      setSettings(savedSettings)

      const deletionResults = await Promise.allSettled(
        pendingDeletion.map(media => deleteBannerMedia(media, bannerType))
      )
      const failedDeletions = deletionResults.flatMap((result, index) => (
        result.status === 'rejected' ? [pendingDeletion[index]] : []
      ))
      setPendingDeletion(failedDeletions)

      if (failedDeletions.length > 0) {
        console.warn('Published banner has Cloudinary assets pending cleanup', {
          bannerType,
          failedDeletions,
        })
        toast.error(
          `Banner published, but ${failedDeletions.length} old Cloudinary asset(s) could not be removed.`,
          { id: 'banner-save', duration: 7000 }
        )
      } else {
        toast.success(`${config.label} published successfully`, { id: 'banner-save' })
      }
    } catch (error) {
      toast.error(error.message, { id: 'banner-save', duration: 7000 })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingCard label={config.label} />

  if (loadError) {
    return (
      <div style={{ ...cardStyle, padding: '32px' }}>
        <div style={{ color: '#dc2626', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 800 }}>
          <Icon name="warning" size={20} />
          Could not load {config.label}
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>{loadError}</p>
        <p style={{ color: '#374151', fontSize: '13px' }}>
          Confirm the Supabase migration has been applied with <code>npm run db:banners</code> and that the website environment variables are configured.
        </p>
        <button
          type="button"
          className="btn-red"
          onClick={() => {
            setLoading(true)
            setLoadError('')
            setReloadToken(current => current + 1)
          }}
          style={{ border: 'none', padding: '10px 18px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  }

  const selectedMedia = settings.media[selectedIndex] || settings.media[0] || null
  const previewHeadline = selectedMedia?.headline || settings.headline
  const previewDescription = selectedMedia?.description || settings.subheadline

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        .banner-admin-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 20px; align-items: start; }
        .banner-media-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .banner-icon-button { width: 30px; height: 30px; border: 1px solid #d1d5db; border-radius: 7px; background: #fff; color: #374151; display: inline-grid; place-items: center; cursor: pointer; font-weight: 900; }
        .banner-icon-button:disabled { opacity: 0.35; cursor: not-allowed; }
        .banner-delete-button { color: #dc2626; background: #fff1f2; border-color: #fecdd3; }
        @media (max-width: 1180px) { .banner-admin-grid { grid-template-columns: 1fr; } }
        @media (max-width: 720px) { .banner-media-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>{config.label}</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
          Upload images or videos in an exact {config.ratioLabel} ratio ({config.exampleSize} recommended). This media appears on {bannerType} devices only.
        </p>
      </div>

      <div className="banner-admin-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section style={{ ...cardStyle, padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
              Banner Settings
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '14px 16px', background: '#f9fafb', borderRadius: '9px' }}>
                <span>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#111827' }}>Banner enabled</strong>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Disabled banners are hidden from the public homepage.</span>
                </span>
                <input type="checkbox" checked={settings.isEnabled} onChange={event => updateSetting('isEnabled', event.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#E8000D' }} />
              </label>

              <div>
                <label style={labelStyle}>Default headline</label>
                <input value={settings.headline} onChange={event => updateSetting('headline', event.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Default description</label>
                <textarea value={settings.subheadline} onChange={event => updateSetting('subheadline', event.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={labelStyle}>Image duration (seconds)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  value={settings.transitionMs / 1000}
                  onChange={event => updateSetting('transitionMs', Number(event.target.value) * 1000)}
                  style={{ ...inputStyle, maxWidth: '180px' }}
                />
              </div>
            </div>
          </section>

          <section style={{ ...cardStyle, padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Banner Media ({settings.media.length}/{MAX_MEDIA_ITEMS})</h2>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>Images and videos play in the order shown below.</p>
              </div>

              <input id={`add-${bannerType}-banner-media`} type="file" accept="image/*,video/*" onChange={handleAddMedia} disabled={uploading || settings.media.length >= MAX_MEDIA_ITEMS} style={{ display: 'none' }} />
              <label htmlFor={`add-${bannerType}-banner-media`} className="btn-red" style={{ borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading || settings.media.length >= MAX_MEDIA_ITEMS ? 0.55 : 1 }}>
                <Icon name="upload" size={15} /> {uploading ? 'Uploading...' : 'Upload Image or Video'}
              </label>
            </div>

            {settings.media.length > 0 ? (
              <div className="banner-media-grid">
                {settings.media.map((media, index) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    index={index}
                    total={settings.media.length}
                    uploading={uploading}
                    selected={selectedMedia?.id === media.id}
                    onSelect={() => setSelectedIndex(index)}
                    onMove={handleMoveMedia}
                    onRemove={() => handleRemoveMedia(index)}
                    onReplace={handleReplaceMedia}
                    onTextChange={(field, value) => updateMediaText(index, field, value)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ border: '2px dashed #d1d5db', borderRadius: '12px', padding: '42px 20px', textAlign: 'center', color: '#6b7280' }}>
                <Icon name="photo" size={32} />
                <div style={{ fontWeight: 800, color: '#374151', marginTop: '10px' }}>No {bannerType} media uploaded</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>Add an exact {config.ratioLabel} image or video.</div>
              </div>
            )}
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleSave} disabled={saving || uploading} className="btn-red" style={{ border: 'none', padding: '12px 28px', cursor: saving || uploading ? 'not-allowed' : 'pointer', opacity: saving || uploading ? 0.6 : 1 }}>
              <Icon name="save" size={15} /> {saving ? 'Publishing...' : 'Save and Publish'}
            </button>
          </div>
        </div>

        <aside style={{ ...cardStyle, padding: '20px', position: 'sticky', top: '84px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>{config.label} Preview</h2>
          <div style={{ aspectRatio: `${config.ratioWidth} / ${config.ratioHeight}`, borderRadius: '10px', overflow: 'hidden', position: 'relative', background: '#111', maxHeight: '520px' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <MediaPreview media={selectedMedia} opacity={0.62} />
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: bannerType === 'mobile' ? '22px' : '20px', color: '#fff', background: 'rgba(0,0,0,0.28)' }}>
              <span style={{ color: '#ff3040', fontSize: '9px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>Signage &amp; Vehicle Branding</span>
              <strong style={{ fontSize: bannerType === 'mobile' ? '21px' : '18px', lineHeight: 1.1 }}>{previewHeadline}</strong>
              <span style={{ fontSize: bannerType === 'mobile' ? '11px' : '10px', lineHeight: 1.45, marginTop: '8px', color: 'rgba(255,255,255,0.82)' }}>{previewDescription}</span>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.5, margin: '12px 0 0', textAlign: 'center' }}>
            Select a media card to preview it. Changes become public only after “Save and Publish.”
          </p>
        </aside>
      </div>
    </div>
  )
}
