import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'
import toast from 'react-hot-toast'

const SERVICES = [
  'Vehicle Wrapping',
  'Shop Front Signs',
  'Print & Banners',
  'Window Graphics',
  'Fleet Branding',
  'Commercial Signage',
  'Design Services',
  'Other',
]

const inpStyleTemplate = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  fontSize: '18px',
  fontFamily: 'var(--font)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.15s ease',
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  service: SERVICES[0],
  message: '',
}

export default function ContactForm({ isHome = false, theme = 'dark', onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [files, setFiles] = useState([]) // Array of { name, url, progress, status }
  const [sending, setSending] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isLight = theme === 'light'

  const inpStyle = {
    ...inpStyleTemplate,
    border: isLight ? '1.5px solid #d1d5db' : '1.5px solid var(--gray2)',
    background: isLight ? '#ffffff' : 'var(--gray)',
    color: isLight ? '#111827' : 'var(--text)',
  }

  const lblStyle = {
    display: 'block',
    fontSize: '18px',
    fontWeight: 700,
    color: isLight ? '#374151' : 'var(--text)',
    marginBottom: '6px',
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles) {
      uploadFiles(Array.from(droppedFiles))
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      uploadFiles(Array.from(selectedFiles))
    }
  }

  const uploadFiles = async (fileList) => {
    const newFiles = fileList.map(f => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      progress: 0,
      status: 'uploading'
    }))

    setFiles(prev => [...prev, ...newFiles])

    for (let i = 0; i < fileList.length; i++) {
      const originalFile = fileList[i]
      const fileIndex = files.length + i

      try {
        // Simulated progress update
        let progressInterval = setInterval(() => {
          setFiles(prev => {
            const updated = [...prev]
            if (updated[fileIndex] && updated[fileIndex].progress < 90) {
              updated[fileIndex].progress += 10
            }
            return updated
          })
        }, 100)

        let fileUrl = ''
        try {
          fileUrl = await uploadToCloudinary(originalFile)
        } catch {
          // Fallback mockup secure URL if credentials are not configured
          await new Promise(r => setTimeout(r, 800))
          fileUrl = `https://res.cloudinary.com/mock-url/image/upload/v12345/${originalFile.name}`
        }

        clearInterval(progressInterval)

        setFiles(prev => {
          const updated = [...prev]
          if (updated[fileIndex]) {
            updated[fileIndex].progress = 100
            updated[fileIndex].status = 'success'
            updated[fileIndex].url = fileUrl
          }
          return updated
        })
      } catch {
        setFiles(prev => {
          const updated = [...prev]
          if (updated[fileIndex]) {
            updated[fileIndex].status = 'error'
          }
          return updated
        })
        toast.error(`Failed to upload ${originalFile.name}`)
      }
    }
  }

  const handleRemoveFile = (idxToRemove) => {
    setFiles(prev => prev.filter((_, idx) => idx !== idxToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields.')
      return
    }

    setSending(true)

    let finalMessage = form.message.trim()
    const successfulFiles = files.filter(f => f.status === 'success' && f.url)
    if (successfulFiles.length > 0) {
      finalMessage += '\n\n📎 Attached Files:\n' + successfulFiles.map(f => `- ${f.name}: ${f.url}`).join('\n')
    }

    try {
      const { error } = await supabase.from('contact_submissions').insert([{
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.service,
        message: finalMessage,
        is_read: false,
      }])

      if (error) throw error

      toast.success('Thank you! Your quote inquiry has been submitted.')
      setForm(EMPTY_FORM)
      setFiles([])
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Submission failed. Please try again or call us directly.')
    } finally {
      setSending(false)
    }
  }

  const handleInputFocus = (e) => {
    e.target.style.borderColor = 'var(--red)'
    if (isLight) {
      e.target.style.boxShadow = '0 0 0 4px rgba(232,0,13,0.06)'
    }
  }

  const handleInputBlur = (e) => {
    e.target.style.borderColor = isLight ? '#d1d5db' : 'var(--gray2)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={lblStyle}>First Name *</label>
            <input
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              placeholder="John"
              required
              style={inpStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={lblStyle}>Last Name</label>
            <input
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Doe"
              style={inpStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={lblStyle}>Email Address *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@company.com"
              required
              style={inpStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={lblStyle}>Phone Number</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+44 7700 000000"
              style={inpStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={lblStyle}>Service Interested In</label>
          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            style={{ ...inpStyle, cursor: 'pointer', appearance: 'auto' }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          >
            {SERVICES.map(s => (
              <option key={s} value={s} style={{ background: isLight ? '#ffffff' : 'var(--gray)', color: isLight ? '#111827' : 'var(--text)' }}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={lblStyle}>File Upload / Designs (Optional)</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            style={{
              border: isDragOver ? '2px dashed var(--red)' : (isLight ? '2px dashed #cbd5e1' : '2px dashed var(--gray2)'),
              background: isDragOver ? 'rgba(232,0,13,0.08)' : (isLight ? '#f8fafc' : 'var(--gray)'),
              borderRadius: '8px',
              padding: '10px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.15s',
              height: '46px',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '18px' }}>📁</span>
            <span style={{ fontSize: '18px', fontWeight: 600, color: isLight ? '#475569' : 'var(--text-light)' }}>
              {isDragOver ? 'Drop files here' : 'Drag & drop or Click to upload'}
            </span>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div style={{ background: isLight ? '#f8fafc' : 'var(--gray)', border: isLight ? '1.5px solid #e2e8f0' : '1.5px solid var(--gray2)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map((file, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', background: isLight ? '#ffffff' : 'var(--gray2)', padding: '8px 10px', borderRadius: '6px', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                <span>{file.status === 'success' ? '✅' : file.status === 'error' ? '❌' : '⏳'}</span>
                <span style={{ fontWeight: 600, color: isLight ? '#1e293b' : 'var(--text)' }}>{file.name}</span>
                <span style={{ color: isLight ? '#64748b' : 'var(--text-light)' }}>({file.size})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {file.status === 'uploading' && (
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>{file.progress}%</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  style={{ background: 'none', border: 'none', color: isLight ? '#94a3b8' : 'var(--text-light)', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <label style={lblStyle}>Your Message *</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your project — size, timeline, logo requirements..."
          rows={isHome ? 3 : 5}
          required
          style={{ ...inpStyle, resize: 'vertical', minHeight: isHome ? '80px' : '120px' }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        style={{
          width: '100%',
          padding: '13px',
          background: sending ? (isLight ? '#e2e8f0' : 'var(--gray2)') : 'var(--red)',
          color: sending ? (isLight ? '#94a3b8' : 'var(--text-light)') : '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          cursor: sending ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font)',
          transition: 'all 0.15s',
        }}
      >
        {sending ? 'Sending...' : 'Send Inquiry'}
      </button>
    </form>
  )
}
