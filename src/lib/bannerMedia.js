import { BANNER_TYPE_CONFIG } from '../data/heroService'
import { supabase } from './supabase'

const BANNER_MEDIA_FUNCTION = 'banner-media'
const MAX_MEDIA_ITEMS = 8

export { MAX_MEDIA_ITEMS }

export function getFileResourceType(file) {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  throw new TypeError(`Unsupported file type: ${file.type || file.name}`)
}

const inspectImage = file => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file)
  const media = new Image()

  media.onload = () => {
    const dimensions = { width: media.naturalWidth, height: media.naturalHeight }
    URL.revokeObjectURL(objectUrl)
    resolve(dimensions)
  }
  media.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    reject(new Error(`Could not read image dimensions for ${file.name}`))
  }
  media.src = objectUrl
})

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
  const dimensions = resourceType === 'image'
    ? await inspectImage(file)
    : await inspectVideo(file)

  assertBannerAspectRatio(dimensions.width, dimensions.height, bannerType)

  return { ...dimensions, resourceType }
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

const wait = milliseconds => new Promise(resolve => window.setTimeout(resolve, milliseconds))

async function invokeBannerMediaFunction(body) {
  if (!supabase.functions?.invoke) {
    throw new Error('Supabase Edge Functions are not configured for banner media uploads')
  }

  let lastError = null
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const { data, error } = await supabase.functions.invoke(BANNER_MEDIA_FUNCTION, { body })
    if (!error) return data

    lastError = error
    console.warn('Banner media function request failed', {
      action: body.action,
      attempt,
      error,
    })
    if (attempt < 2) await wait(300)
  }

  throw new Error(
    `Banner media ${body.action} failed: ${lastError?.message || 'unknown Edge Function error'}`
  )
}

export async function uploadBannerMedia(file, bannerType, inspection) {
  const signature = await invokeBannerMediaFunction({
    action: 'sign-upload',
    bannerType,
    resourceType: inspection.resourceType,
  })

  const formData = new FormData()
  formData.append('api_key', signature.apiKey)
  formData.append('file', file)
  formData.append('folder', signature.folder)
  formData.append('public_id', signature.publicId)
  formData.append('signature', signature.signature)
  formData.append('timestamp', signature.timestamp.toString())

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/${inspection.resourceType}/upload`,
    { method: 'POST', body: formData }
  )
  const responseBody = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `Cloudinary upload failed with status ${response.status}: ` +
      `${responseBody.error?.message || JSON.stringify(responseBody)}`
    )
  }

  try {
    assertBannerAspectRatio(responseBody.width, responseBody.height, bannerType)
  } catch (error) {
    if (responseBody.public_id) {
      await deleteBannerMedia({
        publicId: responseBody.public_id,
        resourceType: responseBody.resource_type,
      }, bannerType).catch(cleanupError => {
        console.warn('Invalid banner upload could not be removed from Cloudinary', {
          bannerType,
          publicId: responseBody.public_id,
          cleanupError,
        })
      })
    }
    throw error
  }

  const expectedPrefix = `sd-sign-studio/banners/${bannerType}/`
  if (!responseBody.public_id?.startsWith(expectedPrefix)) {
    throw new Error('Cloudinary returned an asset outside the expected banner folder')
  }

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

export async function deleteBannerMedia(media, bannerType) {
  if (!media.publicId) {
    throw new Error('Cannot delete banner media without a Cloudinary public ID')
  }

  await invokeBannerMediaFunction({
    action: 'delete',
    bannerType,
    resourceType: media.resourceType,
    publicId: media.publicId,
  })
}
