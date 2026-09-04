import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getGalleryBannerSettings, saveGalleryBannerSettings } from '../../data/galleryBannerService'
import { uploadToCloudinary } from '../../lib/cloudinary'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', background: '#fff', color: '#111', boxSizing: 'border-box' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }

const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov)$/i.test(url || '') || (url || '').includes('/video/')
const getSlideUrl = (slide) => (typeof slide === 'string' ? slide : slide?.image || '')

function MediaPreview({ url }) {
  if (!url) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        <Icon name="photo" size={24} />
      </div>
    )
  }

  if (isVideoUrl(url)) {
    return <video src={url} muted loop playsInline autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  }

  return <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
}

export default function ManageGalleryBanner() {
  const [settings, setSettings] = useState({ mediaType: 'slideshow', videoUrl: '', slides: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(null)

  useEffect(() => {
    setSettings(getGalleryBannerSettings())
    setLoading(false)
  }, [])

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSlideChange = (index, value) => {
    const updated = [...settings.slides]
    updated[index] = { image: value }
    handleChange('slides', updated)
  }

  const handleAddSlide = () => {
    if (settings.slides.length >= 8) {
      toast.error('You can add up to 8 banner media items')
      return
    }
    handleChange('slides', [...settings.slides, { image: '' }])
  }

  const handleRemoveSlide = (index) => {
    handleChange('slides', settings.slides.filter((_, idx) => idx !== index))
  }

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(type)
    toast.loading('Uploading media to Cloudinary...', { id: 'gallery-banner-upload' })

    try {
      const url = await uploadToCloudinary(file)
      if (type === 'video') {
        handleChange('videoUrl', url)
      } else {
        handleSlideChange(Number(type), url)
      }
      toast.success('Media uploaded successfully', { id: 'gallery-banner-upload' })
    } catch (err) {
      toast.error('Upload failed: ' + err.message, { id: 'gallery-banner-upload' })
    } finally {
      setUploading(null)
      e.target.value = ''
    }
  }

  const handleSave = () => {
    setSaving(true)
    const success = saveGalleryBannerSettings(settings)
    if (success) toast.success('Gallery banner settings saved')
    else toast.error('Failed to save gallery banner settings')
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ ...card, padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        Loading gallery banner settings...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Gallery Banner</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
          Manage only the Gallery page banner media. The banner text stays fixed on the public page.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ ...card, padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
              Banner Media
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Active Media Mode</label>
                <select
                  value={settings.mediaType}
                  onChange={e => handleChange('mediaType', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                >
                  <option value="video">Looping Video Background</option>
                  <option value="slideshow">Images / Videos Slideshow</option>
                </select>
              </div>

              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '10px', border: '1.5px solid #e5e7eb' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '0 0 14px' }}>Video Background</h4>
                {settings.videoUrl && (
                  <div style={{ height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', background: '#111' }}>
                    <MediaPreview url={settings.videoUrl} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    id="gallery-banner-video-upload"
                    type="file"
                    accept="video/*"
                    onChange={e => handleFileUpload(e, 'video')}
                    disabled={uploading !== null}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="gallery-banner-video-upload" className="btn-red" style={{ borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading === 'video' ? 0.7 : 1 }}>
                    {uploading === 'video' ? 'Uploading...' : 'Upload Banner Video'}
                  </label>
                  {settings.videoUrl && (
                    <button type="button" onClick={() => handleChange('videoUrl', '')} style={{ border: 'none', background: '#fff1f2', color: '#dc2626', borderRadius: '8px', padding: '10px 14px', fontWeight: 800, cursor: 'pointer' }}>
                      Clear Video
                    </button>
                  )}
                </div>
              </div>

              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '10px', border: '1.5px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: 0 }}>Slideshow Media ({settings.slides.length}/8)</h4>
                  <button type="button" onClick={handleAddSlide} style={{ border: 'none', background: '#E8000D', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                    Add Media
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
                  {settings.slides.map((slide, idx) => {
                    const mediaUrl = getSlideUrl(slide)
                    return (
                      <div key={idx} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '10px' }}>
                        <div style={{ height: '110px', borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6', marginBottom: '10px' }}>
                          <MediaPreview url={mediaUrl} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#6b7280' }}>Media {idx + 1}</span>
                          <button type="button" onClick={() => handleRemoveSlide(idx)} style={{ border: 'none', background: 'transparent', color: '#dc2626', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                            Remove
                          </button>
                        </div>
                        <input
                          id={`gallery-banner-slide-${idx}`}
                          type="file"
                          accept="image/*,video/*"
                          onChange={e => handleFileUpload(e, String(idx))}
                          disabled={uploading !== null}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor={`gallery-banner-slide-${idx}`} style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', border: '1.5px solid #d1d5db', borderRadius: '8px', padding: '9px 10px', fontSize: '12px', fontWeight: 800, color: '#374151', cursor: uploading ? 'not-allowed' : 'pointer', background: '#fff' }}>
                          {uploading === String(idx) ? 'Uploading...' : 'Upload Image/Video'}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} disabled={saving} className="btn-red" style={{ border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Gallery Banner'}
            </button>
          </div>
        </div>

        <div style={{ ...card, padding: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Public Banner Preview</h4>
          <div style={{ height: '230px', borderRadius: '10px', overflow: 'hidden', position: 'relative', background: '#111' }}>
            <MediaPreview url={settings.mediaType === 'video' ? settings.videoUrl : getSlideUrl(settings.slides[0])} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '18px', color: '#fff' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#E8000D', marginBottom: '10px' }}>Project Gallery</span>
              <strong style={{ fontSize: '30px', lineHeight: 1 }}>Our Gallery</strong>
              <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.78)', marginTop: '10px' }}>
                Fixed public text. Only media changes here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
