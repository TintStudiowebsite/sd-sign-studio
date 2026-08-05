import { createClient } from 'npm:@supabase/supabase-js@2'

type BannerType = 'desktop' | 'mobile'
type ResourceType = 'image' | 'video'

type RequestBody = {
  action: 'sign-upload' | 'delete'
  bannerType: BannerType
  resourceType: ResourceType
  publicId?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

async function createCloudinarySignature(
  parameters: Record<string, string | number | boolean>,
  apiSecret: string,
) {
  const serializedParameters = Object.entries(parameters)
    .filter(([, value]) => value !== '' && value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const digest = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(`${serializedParameters}${apiSecret}`),
  )

  return toHex(digest)
}

const isBannerType = (value: unknown): value is BannerType =>
  value === 'desktop' || value === 'mobile'

const isResourceType = (value: unknown): value is ResourceType =>
  value === 'image' || value === 'video'

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Only POST requests are supported' }, 405)
  }

  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return jsonResponse({ error: 'Authentication is required' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const cloudinaryUrl = Deno.env.get('CLOUDINARY_URL')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase server credentials are not configured')
    }

    if (!cloudinaryUrl) {
      throw new Error('CLOUDINARY_URL is not configured')
    }

    const parsedCloudinaryUrl = new URL(cloudinaryUrl)
    const cloudName = parsedCloudinaryUrl.hostname
    const apiKey = decodeURIComponent(parsedCloudinaryUrl.username)
    const apiSecret = decodeURIComponent(parsedCloudinaryUrl.password)

    if (parsedCloudinaryUrl.protocol !== 'cloudinary:' || !cloudName || !apiKey || !apiSecret) {
      throw new Error('CLOUDINARY_URL must use cloudinary://<api-key>:<api-secret>@<cloud-name>')
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    const token = authorization.replace(/^Bearer\s+/i, '')
    const { data: userData, error: userError } = await serviceClient.auth.getUser(token)

    if (userError || !userData.user) {
      return jsonResponse({ error: 'The current session is invalid or expired' }, 401)
    }

    const { data: roleData, error: roleError } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      return jsonResponse({ error: 'Administrator access is required' }, 403)
    }

    const body = await request.json() as RequestBody
    if (!isBannerType(body.bannerType)) {
      return jsonResponse({ error: 'bannerType must be desktop or mobile' }, 400)
    }

    if (!isResourceType(body.resourceType)) {
      return jsonResponse({ error: 'resourceType must be image or video' }, 400)
    }

    const folder = `sd-sign-studio/banners/${body.bannerType}`
    const timestamp = Math.floor(Date.now() / 1000)

    if (body.action === 'sign-upload') {
      const publicId = crypto.randomUUID()
      const parameters = { folder, public_id: publicId, timestamp }
      const signature = await createCloudinarySignature(parameters, apiSecret)

      return jsonResponse({
        apiKey,
        cloudName,
        folder,
        publicId,
        signature,
        timestamp,
      }, 200)
    }

    if (body.action === 'delete') {
      const expectedPrefix = `${folder}/`
      if (!body.publicId?.startsWith(expectedPrefix)) {
        return jsonResponse({ error: 'The asset does not belong to this banner' }, 400)
      }

      const parameters = {
        invalidate: true,
        public_id: body.publicId,
        timestamp,
      }
      const signature = await createCloudinarySignature(parameters, apiSecret)
      const formData = new FormData()
      formData.append('api_key', apiKey)
      formData.append('invalidate', 'true')
      formData.append('public_id', body.publicId)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp.toString())

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${body.resourceType}/destroy`,
        { method: 'POST', body: formData },
      )
      const cloudinaryBody = await cloudinaryResponse.json()

      if (!cloudinaryResponse.ok || !['ok', 'not found'].includes(cloudinaryBody.result)) {
        return jsonResponse({
          error: 'Cloudinary could not delete the banner asset',
          cloudinaryStatus: cloudinaryResponse.status,
          cloudinaryResult: cloudinaryBody.result,
        }, 502)
      }

      return jsonResponse({ result: cloudinaryBody.result }, 200)
    }

    return jsonResponse({ error: 'Unsupported banner media action' }, 400)
  } catch (error) {
    console.error('Banner media function failed', { error })
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Unexpected banner media failure',
    }, 500)
  }
})
