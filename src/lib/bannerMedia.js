import { BANNER_TYPE_CONFIG } from '../data/heroService'

const CLOUDINARY_CLOUD = 'hpdgdpxp'
const CLOUDINARY_PRESET = 'sd_sign_preset'
const MAX_MEDIA_ITEMS = 8

export { MAX_MEDIA_ITEMS }

export function getFileResourceType(file) {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  throw new TypeError(`Unsupported file type: ${file.type || file.name}`)
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

// Largest width x height that (a) fits inside the source image and
// (b) satisfies the exact target ratio (e.g. 16:9), so a center-crop
// never has to upscale or leave slivers of the wrong ratio.
function computeExactCropBox(srcWidth, srcHeight, ratioWidth, ratioHeight) {
  const divisor = gcd(ratioWidth, ratioHeight)
  const unitWidth = ratioWidth / divisor
  const unitHeight = ratioHeight / divisor
  const units = Math.floor(Math.min(srcWidth / unitWidth, srcHeight / unitHeight))
  return { width: units * unitWidth, height: units * unitHeight }
}

const loadImageElement = file => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file)
  const media = new Image()
  media.onload = () => { resolve(media); URL.revokeObjectURL(objectUrl) }
  media.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    reject(new Error(`Could not read image dimensions for ${file.name}`))
  }
  media.src = objectUrl
})

// Uploaded photos are rarely an exact 16:9 / 4:5 already, so instead of
// rejecting them we center-crop to the largest region that matches the
// required ratio exactly, and upload that instead of the original file.
async function inspectAndCropImage(file, ratioWidth, ratioHeight) {
  const media = await loadImageElement(file)
  const srcWidth = media.naturalWidth
  const srcHeight = media.naturalHeight
  const { width, height } = computeExactCropBox(srcWidth, srcHeight, ratioWidth, ratioHeight)

  if (width === srcWidth && height === srcHeight) {
    return { file, width, height }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const sx = Math.floor((srcWidth - width) / 2)
  const sy = Math.floor((srcHeight - height) / 2)
  ctx.drawImage(media, sx, sy, width, height, 0, 0, width, height)

  const blob = await new Promise(resolve => canvas.toBlob(resolve, file.type || 'image/jpeg', 0.92))
  if (!blob) throw new Error(`Could not crop ${file.name} to the required ratio`)

  const croppedFile = new File([blob], file.name, { type: blob.type })
  return { file: croppedFile, width, height }
}

const inspectVideo = file => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file)
  const media = document.createElement('video')
  media.preload = 'metadata'

  media.onloadedmetadata = () => {
    const dimensions = {
      width: media.videoWidth,
      height: media.videoHeight,
      durationSeconds: Number.isFinite(media.duration) ? media.duration : null,
    }
    URL.revokeObjectURL(objectUrl)
    resolve(dimensions)
  }
  media.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    reject(new Error(`Could not read video dimensions for ${file.name}`))
  }
  media.src = objectUrl
})

export async function inspectBannerFile(file, bannerType) {
  const resourceType = getFileResourceType(file)
  const config = BANNER_TYPE_CONFIG[bannerType]

  if (resourceType === 'image') {
    const { file: preparedFile, width, height } = await inspectAndCropImage(file, config.ratioWidth, config.ratioHeight)
    return { file: preparedFile, width, height, resourceType }
  }

  const dimensions = await inspectVideo(file)
  assertBannerAspectRatio(dimensions.width, dimensions.height, bannerType)
  return { file, ...dimensions, resourceType }
}

export function assertBannerAspectRatio(width, height, bannerType) {
  const config = BANNER_TYPE_CONFIG[bannerType]
  if (!config) {
    throw new TypeError(`Unsupported banner type: ${bannerType}`)
  }

  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError('Media dimensions must be positive whole numbers')
  }

  const isExactRatio = width * config.ratioHeight === height * config.ratioWidth
  if (!isExactRatio) {
    throw new RangeError(
      `${config.label} media must use an exact ${config.ratioLabel} ratio. ` +
      `${fileDimensions(width, height)} was selected; use a size such as ${config.exampleSize}.`
    )
  }
}

const fileDimensions = (width, height) => `${width} × ${height}`

// Direct, unsigned upload straight to Cloudinary — same approach the
// Gallery admin pages already use. No server round-trip, so it needs
// no Supabase Edge Function or server-side secret to stay in sync.
export async function uploadBannerMedia(file, bannerType, inspection) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)
  formData.append('folder', `sd-sign-studio/banners/${bannerType}`)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${inspection.resourceType}/upload`,
    { method: 'POST', body: formData }
  )
  const responseBody = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `Cloudinary upload failed with status ${response.status}: ` +
      `${responseBody.error?.message || JSON.stringify(responseBody)}`
    )
  }

  assertBannerAspectRatio(responseBody.width, responseBody.height, bannerType)

  return {
    id: crypto.randomUUID(),
    assetId: responseBody.asset_id || '',
    publicId: responseBody.public_id,
    secureUrl: responseBody.secure_url,
    resourceType: responseBody.resource_type,
    width: responseBody.width,
    height: responseBody.height,
    format: responseBody.format || 'unknown',
    bytes: responseBody.bytes || file.size,
    durationSeconds: responseBody.duration ?? inspection.durationSeconds ?? null,
    headline: '',
    description: '',
    altText: '',
  }
}
