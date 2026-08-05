import { supabase } from '../lib/supabase'

export const BANNER_TYPE_CONFIG = Object.freeze({
  desktop: Object.freeze({
    label: 'Desktop Banner',
    ratioLabel: '16:9 Landscape',
    ratioWidth: 16,
    ratioHeight: 9,
    exampleSize: '1920 × 1080',
  }),
  mobile: Object.freeze({
    label: 'Mobile Banner',
    ratioLabel: '4:5 Portrait',
    ratioWidth: 4,
    ratioHeight: 5,
    exampleSize: '1080 × 1350',
  }),
})

const DEFAULT_HEADLINE = 'We design, print, and install your brand everywhere.'
const DEFAULT_SUBHEADLINE = "Glasgow's premier vehicle wrapping, storefront signage, and custom print fabrication agency. Built to make your brand unmissable."

export function createEmptyBannerSettings(bannerType) {
  const config = BANNER_TYPE_CONFIG[bannerType]
  if (!config) {
    throw new TypeError(`Unsupported banner type: ${bannerType}`)
  }

  return {
    bannerType,
    headline: DEFAULT_HEADLINE,
    subheadline: DEFAULT_SUBHEADLINE,
    isEnabled: true,
    transitionMs: 5000,
    media: [],
    updatedAt: null,
  }
}

const mapMediaRow = row => ({
  id: row.id,
  assetId: row.cloudinary_asset_id || '',
  publicId: row.cloudinary_public_id,
  secureUrl: row.secure_url,
  resourceType: row.resource_type,
  width: row.width,
  height: row.height,
  format: row.format,
  bytes: row.bytes,
  durationSeconds: row.duration_seconds,
  headline: row.headline || '',
  description: row.description || '',
  altText: row.alt_text || '',
})

const getErrorMessage = (operation, error) => {
  const details = [error?.message, error?.details, error?.hint].filter(Boolean).join(' — ')
  return `${operation} failed${details ? `: ${details}` : ''}`
}

export async function getHeroSettings(bannerType) {
  if (!BANNER_TYPE_CONFIG[bannerType]) {
    throw new TypeError(`Unsupported banner type: ${bannerType}`)
  }

  const [settingsResult, mediaResult] = await Promise.all([
    supabase
      .from('banner_settings')
      .select('banner_type, headline, subheadline, is_enabled, transition_ms, updated_at')
      .eq('banner_type', bannerType)
      .single(),
    supabase
      .from('banner_media')
      .select('id, cloudinary_asset_id, cloudinary_public_id, secure_url, resource_type, width, height, format, bytes, duration_seconds, sort_order, headline, description, alt_text')
      .eq('banner_type', bannerType)
      .order('sort_order', { ascending: true }),
  ])

  if (settingsResult.error) {
    throw new Error(getErrorMessage(`Loading the ${bannerType} banner`, settingsResult.error))
  }

  if (mediaResult.error) {
    throw new Error(getErrorMessage(`Loading ${bannerType} banner media`, mediaResult.error))
  }

  if (!settingsResult.data) {
    throw new Error(`The ${bannerType} banner is not configured. Run the banner database migration first.`)
  }

  return {
    bannerType: settingsResult.data.banner_type,
    headline: settingsResult.data.headline,
    subheadline: settingsResult.data.subheadline,
    isEnabled: settingsResult.data.is_enabled,
    transitionMs: settingsResult.data.transition_ms,
    media: (mediaResult.data || []).map(mapMediaRow),
    updatedAt: settingsResult.data.updated_at,
  }
}

export async function saveHeroSettings(settings) {
  if (!BANNER_TYPE_CONFIG[settings.bannerType]) {
    throw new TypeError(`Unsupported banner type: ${settings.bannerType}`)
  }

  const media = settings.media.map(item => ({
    id: item.id,
    assetId: item.assetId,
    publicId: item.publicId,
    secureUrl: item.secureUrl,
    resourceType: item.resourceType,
    width: item.width,
    height: item.height,
    format: item.format,
    bytes: item.bytes,
    durationSeconds: item.durationSeconds,
    headline: item.headline,
    description: item.description,
    altText: item.altText,
  }))

  if (typeof supabase.rpc !== 'function') {
    throw new Error('Supabase is not configured for persistent banner publishing')
  }

  const { error } = await supabase.rpc('publish_home_banner', {
    p_banner_type: settings.bannerType,
    p_headline: settings.headline,
    p_subheadline: settings.subheadline,
    p_is_enabled: settings.isEnabled,
    p_transition_ms: settings.transitionMs,
    p_media: media,
  })

  if (error) {
    throw new Error(getErrorMessage(`Publishing the ${settings.bannerType} banner`, error))
  }

  window.dispatchEvent(new CustomEvent('hero-settings-updated', {
    detail: { bannerType: settings.bannerType },
  }))

  return getHeroSettings(settings.bannerType)
}
