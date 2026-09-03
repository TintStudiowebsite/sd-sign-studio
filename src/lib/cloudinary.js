const CLOUD = 'hpdgdpxp'
const PRESET = 'sd_sign_preset'

export async function uploadToCloudinary(file, options = {}) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', PRESET)
  if (options.folder) fd.append('folder', options.folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || 'Upload failed')
  }
  const data = await res.json()
  return options.returnDetails ? data : data.secure_url
}
