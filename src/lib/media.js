/**
 * Turn a Cloudinary video URL into a still-frame JPG URL (1s in).
 * Cloudinary can extract a frame even on plans where video transcoding is
 * disabled, so this is a safe poster / fallback image for any video tile.
 */
export function cloudinaryVideoPoster(url) {
  if (!url || !/res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(url)) return undefined
  return url
    .replace('/video/upload/', '/video/upload/so_1/')
    .replace(/\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i, '.jpg')
}
