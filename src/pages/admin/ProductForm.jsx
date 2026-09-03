import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', background: '#fff', color: '#111' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }
const hint = { fontSize: '11px', color: '#9ca3af', marginTop: '4px' }

const CLOUD_NAME = 'hpdgdpxp'
const UPLOAD_PRESET = 'sd_sign_preset'

const EMPTY_FORM = {
  name: '', category: '', price: '', price_inr: '', price_gbp: '', badge: '',
  short_description: '', full_description: '',
  material: '', finish_options: '', durability: '',
  installation_info: '', warranty: '', lead_time: '', custom_design: '',
  primary_image: '',
}

export default function ProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(isEditing)
  const [categories, setCategories] = useState([])
  const [primaryImageFile, setPrimaryImageFile] = useState(null)
  const [primaryPreview, setPrimaryPreview] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [existingGallery, setExistingGallery] = useState([])
  const [removedGallery, setRemovedGallery] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    fetchCategories()
    if (isEditing) fetchProduct()
  }, [id])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) {
      setCategories(data)
      if (data.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: data[0].name }))
      }
    }
  }

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      setForm({
        name: data.name || '',
        category: data.category || '',
        price: data.price?.toString() || '',
        price_inr: data.price_inr?.toString() || data.price?.toString() || '',
        price_gbp: data.price_gbp?.toString() || data.price?.toString() || '',
        badge: data.badge || '',
        short_description: data.short_description || '',
        full_description: data.full_description || '',
        material: data.material || '',
        finish_options: data.finish_options || '',
        durability: data.durability || '',
        installation_info: data.installation_info || '',
        warranty: data.warranty || '',
        lead_time: data.lead_time || '',
        custom_design: data.custom_design || '',
        primary_image: data.primary_image || '',
      })
      setPrimaryPreview(data.primary_image || null)
      setExistingGallery(data.product_images || [])
    } catch {
      toast.error('Failed to load product')
      navigate('/admin/products')
    } finally {
      setPageLoading(false)
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePrimaryImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setPrimaryImageFile(file)
    setPrimaryPreview(URL.createObjectURL(file))
  }

  const uploadToCloudinary = async (file) => {
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', UPLOAD_PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: data })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    return json.secure_url
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!isEditing && !primaryImageFile) return toast.error('Primary image is required')
    setLoading(true)
    const toastId = toast.loading(isEditing ? 'Updating product...' : 'Creating product...')
    try {
      let primaryImageUrl = form.primary_image
      if (primaryImageFile) {
        toast.loading('Uploading primary image...', { id: toastId })
        primaryImageUrl = await uploadToCloudinary(primaryImageFile)
      }

      const galleryUrls = []
      if (galleryFiles.length > 0) {
        toast.loading('Uploading gallery images...', { id: toastId })
        for (const file of galleryFiles) {
          galleryUrls.push(await uploadToCloudinary(file))
        }
      }

      toast.loading('Saving to database...', { id: toastId })

      const priceInr = parseFloat(form.price_inr)
      const priceGbp = parseFloat(form.price_gbp)
      if (!Number.isFinite(priceInr) || !Number.isFinite(priceGbp)) {
        throw new Error('Please enter valid India and UK prices.')
      }

      const payload = {
        name: form.name,
        category: form.category,
        price: priceGbp,
        price_inr: priceInr,
        price_gbp: priceGbp,
        badge: form.badge || null,
        short_description: form.short_description,
        full_description: form.full_description,
        material: form.material || null,
        finish_options: form.finish_options || null,
        durability: form.durability || null,
        installation_info: form.installation_info || null,
        warranty: form.warranty || null,
        lead_time: form.lead_time || null,
        custom_design: form.custom_design || null,
        primary_image: primaryImageUrl,
      }

      let productId = id

      if (isEditing) {
        const { error } = await supabase.from('products').update(payload).eq('id', id)
        if (error) throw error
        if (removedGallery.length > 0) {
          await supabase.from('product_images').delete().in('id', removedGallery)
        }
      } else {
        const { data, error } = await supabase.from('products').insert([payload]).select().single()
        if (error) throw error
        productId = data.id
      }

      if (galleryUrls.length > 0) {
        await supabase.from('product_images').insert(galleryUrls.map(url => ({ product_id: productId, image_url: url })))
      }

      toast.success(isEditing ? 'Product updated!' : 'Product created!', { id: toastId })
      navigate('/admin/products')
    } catch (err) {
      toast.error('Error: ' + err.message, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) return (
    <div style={{ padding: '80px', textAlign: 'center', color: '#9ca3af' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontWeight: 600 }}>Loading product...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '980px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link to="/admin/products" style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              Products
            </Link>
            <span style={{ color: '#d1d5db' }}>/</span>
            <span style={{ color: '#374151', fontSize: '13px', fontWeight: 600 }}>{isEditing ? 'Edit' : 'Add New'}</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
        <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', textDecoration: 'none' }}>
          ← Back to Products
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Basic Info */}
            <div style={{ ...card, padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                Product Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={labelStyle}>Product Name *</label>
                  <input type="text" name="name" required value={form.name} onChange={handleChange} style={inputStyle} placeholder="e.g. Audi A4 Full Body Wrap" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Starting Price (INR) *</label>
                    <input type="number" step="0.01" name="price_inr" required value={form.price_inr} onChange={handleChange} style={inputStyle} placeholder="0.00" min="0" />
                    <p style={hint}>Shown when India pricing is selected.</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Starting Price (GBP) *</label>
                    <input type="number" step="0.01" name="price_gbp" required value={form.price_gbp} onChange={handleChange} style={inputStyle} placeholder="0.00" min="0" />
                    <p style={hint}>Shown when UK pricing is selected.</p>
                  </div>
                </div>
                <div>
                    <label style={labelStyle}>Badge <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                    <input type="text" name="badge" value={form.badge} onChange={handleChange} style={inputStyle} placeholder="Popular, New, Sale..." />
                </div>
                <div>
                  <label style={labelStyle}>Short Description</label>
                  <textarea name="short_description" rows={2} value={form.short_description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Brief summary shown on product cards and product page…" />
                  <p style={hint}>Shown below the price on the product page.</p>
                </div>
                <div>
                  <label style={labelStyle}>Full Description (Overview tab)</label>
                  <textarea name="full_description" rows={6} value={form.full_description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Detailed product description shown in the Overview tab…" />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div style={{ ...card, padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '4px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                Specifications
              </h3>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                These appear in the Specifications tab on the product page. Leave blank to hide a row.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Material</label>
                  <input type="text" name="material" value={form.material} onChange={handleChange} style={inputStyle} placeholder="e.g. Premium Grade Vinyl" />
                </div>
                <div>
                  <label style={labelStyle}>Finish Options</label>
                  <input type="text" name="finish_options" value={form.finish_options} onChange={handleChange} style={inputStyle} placeholder="e.g. Gloss / Matte / Satin" />
                </div>
                <div>
                  <label style={labelStyle}>Durability</label>
                  <input type="text" name="durability" value={form.durability} onChange={handleChange} style={inputStyle} placeholder="e.g. 5–7 Years (exterior use)" />
                </div>
                <div>
                  <label style={labelStyle}>Installation</label>
                  <input type="text" name="installation_info" value={form.installation_info} onChange={handleChange} style={inputStyle} placeholder="e.g. Professional fitting included" />
                </div>
                <div>
                  <label style={labelStyle}>Warranty</label>
                  <input type="text" name="warranty" value={form.warranty} onChange={handleChange} style={inputStyle} placeholder="e.g. 12 months workmanship" />
                </div>
                <div>
                  <label style={labelStyle}>Lead Time</label>
                  <input type="text" name="lead_time" value={form.lead_time} onChange={handleChange} style={inputStyle} placeholder="e.g. 3–5 working days" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Custom Design</label>
                  <input type="text" name="custom_design" value={form.custom_design} onChange={handleChange} style={inputStyle} placeholder="e.g. Available on request" />
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div style={{ ...card, padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                Gallery Images
              </h3>
              {existingGallery.filter(g => !removedGallery.includes(g.id)).length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ ...labelStyle, marginBottom: '10px' }}>Current Gallery</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {existingGallery.filter(g => !removedGallery.includes(g.id)).map(img => (
                      <div key={img.id} style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <img src={img.image_url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #e5e7eb' }} />
                        <button
                          type="button"
                          onClick={() => setRemovedGallery(prev => [...prev, img.id])}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label style={labelStyle}>Add Gallery Images <span style={{ fontWeight: 400, color: '#9ca3af' }}>(select multiple)</span></label>
                <div style={{ position: 'relative', marginTop: '6px' }}>
                  <input
                    id="gallery-images-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => setGalleryFiles(Array.from(e.target.files))}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="gallery-images-upload"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      background: '#ffffff',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--red)';
                      e.currentTarget.style.background = '#fcf8f8';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <span>📷 Select Gallery Images</span>
                  </label>
                </div>
                {galleryFiles.length > 0 && <p style={{ ...hint, color: '#166534', fontWeight: 600, marginTop: '8px' }}>✅ {galleryFiles.length} file(s) selected</p>}
              </div>
            </div>

          </div>

          {/* ── Right Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Publish */}
            <div style={{ ...card, padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>Publish</h3>
              <button
                type="submit"
                disabled={loading}
                className="btn-red"
                style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}
              </button>
              <Link to="/admin/products" style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#6b7280', textDecoration: 'none', fontWeight: 600 }}>
                Cancel
              </Link>
            </div>

            {/* Category */}
            <div style={{ ...card, padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>Category *</h3>
              <select name="category" required value={form.category} onChange={handleChange} style={inputStyle}>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <Link to="/admin/categories" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', fontSize: '12px', color: '#E8000D', fontWeight: 700, textDecoration: 'none' }}>
                <Icon name="plus" size={12} /> Manage Categories
              </Link>
            </div>

            {/* Primary Image */}
            <div style={{ ...card, padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
                Primary Image {!isEditing && '*'}
              </h3>
              {primaryPreview && (
                <img src={primaryPreview} alt="Preview" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px', border: '1.5px solid #e5e7eb' }} />
              )}
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <input
                  id="primary-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePrimaryImage}
                  required={!isEditing && !form.primary_image}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="primary-image-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    background: '#ffffff',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    transition: 'all 0.2s',
                    width: '100%',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--red)';
                    e.currentTarget.style.background = '#fcf8f8';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <span>🖼️ Choose Primary Image</span>
                </label>
              </div>
              {primaryImageFile && <p style={hint}>{primaryImageFile.name}</p>}
              {isEditing && !primaryImageFile && <p style={hint}>Leave empty to keep current image.</p>}
            </div>

            {/* Info */}
            <div style={{ padding: '14px 16px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '13px', color: '#166534', lineHeight: 1.6 }}>
              <strong>Tip:</strong> Fill in the Specifications fields so the product page automatically shows them in the Specifications tab. Leave blank to hide individual rows.
            </div>

          </div>
        </div>
      </form>
    </div>
  )
}
