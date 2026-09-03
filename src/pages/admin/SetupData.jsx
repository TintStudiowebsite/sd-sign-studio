import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const CLOUD = 'hpdgdpxp'
const PRESET = 'sd_sign_preset'

const card = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)',
  padding: '24px',
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const CATEGORIES_SEED = [
  'Audi', 'Bentley', 'BMW', 'BYD', 'Hyundai', 'Jaguar', 'Jeep', 'Kia',
  'Land Rover', 'Lexus', 'Mahindra', 'Maruti Suzuki', 'Maserati', 'Renault',
  'Mercedes Benz', 'MG', 'Mini', 'Porsche', 'Skoda', 'Tata', 'Toyota',
  'Vinfast', 'Volkswagen', 'Volvo',
]

const SERVICES_SEED = [
  { title: '3D Lettering Signs', short_description: 'Put some pow into your brand with our carefully crafted 3D lettering. Made from robust materials like metal, wood, or acrylic, they can be flat-cut or built up into a hollow finish for extra depth and LED halo illumination.', localImage: '/images/client-images/car2.jpg', sort_order: 1 },
  { title: 'Shop Front Signs', short_description: 'We make exterior commercial and retail signs easy—from initial site survey to final installation. Creating the perfect storefront is crucial for exposing your brand and making a memorable first impression.', localImage: '/images/client-images/van_wrapping.jpg', sort_order: 2 },
  { title: 'Illuminated & Neon Signs', short_description: 'Day or night, give your office, shop, or café a stunning glow with bespoke illuminated and neon signs. We combine metal frameworks with long-lasting LEDs for pure electric magic.', localImage: '/images/client-images/van_wrapping_2.webp', sort_order: 3 },
  { title: 'Projecting Signs & Lightboxes', short_description: 'Projecting lightbox signs provide full-face illumination sitting right at an angle to your premises. Using energy-efficient LED modules and light-diffusing acrylic, they maximize visibility from up and down the street.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg', sort_order: 4 },
  { title: 'Vehicle Graphics & Wrapping', short_description: 'Vehicle vinyl wraps are available in striking matt or gloss finishes. Whether solid colours or printed bespoke artwork, our van sign writing completely changes the look of your vehicle while protecting the paint.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg', sort_order: 5 },
  { title: 'Window Graphics', short_description: 'A wide range of window graphics, self-adhesive stickers, and poster holders to attract attention. All decals are printed in-house using the latest cutting and printing equipment.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg', sort_order: 6 },
  { title: 'Shop Awnings', short_description: 'We are the leading company for stylish shop awnings and canopies in London. Protect your storefront from the elements while providing a premium, classic look to your business.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg', sort_order: 7 },
  { title: 'Banner & Logo Printing', short_description: 'High-quality banner printing, logo design, stationery, and large-format printing. We offer free design services for all large printing orders to ensure your materials are perfect.', localImage: '/images/client-images/car2.jpg', sort_order: 8 },
  { title: 'Custom Workwear', short_description: 'Look professional in quality custom-branded workwear. From t-shirts to polo shirts, we can print or embroider your logo across our entire product range.', localImage: '/images/client-images/van_wrapping.jpg', sort_order: 9 },
  { title: 'Flyers & Brochures', short_description: '"The more you tell, the more you sell." Let us help you tell the complete story of your company with professional brochures and flyers that drive real interest.', localImage: '/images/client-images/van_wrapping_2.webp', sort_order: 10 },
  { title: 'Exhibition Stands & Flags', short_description: 'We offer professional guidance to turn your ideas into a reality for exhibitions. Get portable feather flags and fully branded stands based around your budget and space.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg', sort_order: 11 },
  { title: 'Menu Displays', short_description: "We start with modern, built-in menu designs and customize them to your heart's content. Create something truly original that highlights your culinary offerings perfectly.", localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg', sort_order: 12 },
  { title: 'Safety & Interior Signs', short_description: 'From site safety signs to fully branded internal office signage. We design, print, manufacture, and install all forms of indoor signs to meet your brief exactly.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg', sort_order: 13 },
  { title: 'Food Truck/Trailer Wraps', short_description: 'We design and install bold food trailer wraps and signage that make your business stand out. From full wraps to dynamic menus, everything is built to last.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg', sort_order: 14 },
  { title: 'Heras Fence Banners', short_description: 'Make construction sites look great! Perfect for concealing ongoing work from public view while simultaneously advertising your brand to thousands of passersby.', localImage: '/images/client-images/car2.jpg', sort_order: 15 },
]

const PRODUCTS_SEED = [
  { name: 'Audi A4 Full Body Wrap', category: 'Audi', price: 2499, badge: 'Popular', short_description: 'Complete matte black vinyl wrap with ceramic coating finish.', description: 'Transform your Audi A4 with our premium matte black vinyl wrap. This comprehensive package includes door jambs, intricate edge wrapping, and a final ceramic coating to ensure longevity and a pristine finish.', localImage: '/images/client-images/car2.jpg' },
  { name: 'BMW M3 Racing Stripes', category: 'BMW', price: 899, badge: null, short_description: 'Performance-style racing stripes in carbon fiber texture.', description: 'Enhance the aggressive styling of your BMW M3 with our precision-cut racing stripes. Featuring a hyper-realistic carbon fiber texture, these stripes are perfectly aligned over the bonnet, roof, and tailgate.', localImage: '/images/client-images/van_wrapping.jpg' },
  { name: 'Mercedes C-Class Chrome Delete', category: 'Mercedes Benz', price: 1299, badge: 'New', short_description: 'Gloss black chrome delete package for a sleek, modern look.', description: 'Achieve the stealth aesthetic with our complete chrome delete package for the Mercedes C-Class. We meticulously wrap all window trims, front grilles, badges, and exhaust tips in high-gloss or satin black vinyl.', localImage: '/images/client-images/van_wrapping_2.webp' },
  { name: 'Porsche 911 PPF Package', category: 'Porsche', price: 3999, badge: 'Premium', short_description: 'Full front paint protection film with self-healing technology.', description: 'Protect your investment with our state-of-the-art Paint Protection Film (PPF). This package covers the entire front end of your Porsche 911—including the bumper, bonnet, wings, and mirrors.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg' },
  { name: 'Range Rover Satin Wrap', category: 'Land Rover', price: 3499, badge: null, short_description: 'Luxurious satin grey full body wrap with door jambs.', description: "Elevate your Range Rover with a luxurious satin grey finish. Our service includes wrapping the door jambs for a seamless transition when the doors are open, making it indistinguishable from a custom paint job.", localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg' },
  { name: 'VW Golf GTI Decal Kit', category: 'Volkswagen', price: 499, badge: 'Sale', short_description: 'Custom designed side and bonnet decal kit in gloss red.', description: 'Add a sporty touch to your VW Golf GTI with our custom decal kit. Designed in-house, these gloss red graphics perfectly complement the GTI styling cues.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg' },
  { name: 'Toyota GR86 Livery Wrap', category: 'Toyota', price: 1899, badge: null, short_description: 'Full racing livery design and installation for track days.', description: 'Turn your Toyota GR86 into a track-ready showstopper with our custom racing livery. We work with you to design a unique, multi-layered graphic setup that reflects your personal style or team branding.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg' },
  { name: 'Hyundai i30N Colour Change', category: 'Hyundai', price: 2199, badge: 'Popular', short_description: 'Complete colour change wrap in performance blue metallic.', description: 'Completely overhaul your Hyundai i30N with a striking performance blue metallic wrap. All badges and trims are carefully removed and reinstalled for a perfect finish.', localImage: '/images/client-images/car2.jpg' },
  { name: 'Kia EV6 Matte Wrap', category: 'Kia', price: 2699, badge: null, short_description: 'Premium matte white full body wrap for the electric Kia EV6.', description: 'Complement the futuristic design of your Kia EV6 with a premium matte white wrap. Our wraps are fully compatible with parking sensors and advanced driver-assistance systems.', localImage: '/images/client-images/van_wrapping.jpg' },
  { name: 'Mini Cooper Roof & Mirror Wrap', category: 'Mini', price: 399, badge: 'New', short_description: 'Contrast roof and mirror caps in gloss black or carbon.', description: "Give your Mini Cooper that classic contrasting look. We wrap the roof and mirror caps in your choice of deep gloss black or textured carbon fiber.", localImage: '/images/client-images/van_wrapping_2.webp' },
  { name: 'Jaguar F-Type Satin Chrome', category: 'Jaguar', price: 3299, badge: 'Premium', short_description: 'Show-stopping satin chrome wrap for the ultimate head-turner.', description: 'Make the ultimate statement with a satin chrome wrap for your Jaguar F-Type. Applied by our master technicians, it is the pinnacle of vehicle customization.', localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg' },
  { name: 'Volvo XC90 Fleet Branding', category: 'Volvo', price: 1599, badge: null, short_description: 'Professional fleet branding with logos and contact details.', description: "Turn your company's Volvo XC90 into a mobile billboard. Our commercial-grade vinyl ensures your brand looks sharp and professional for years.", localImage: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg' },
]

// ─── RLS / setup SQL ──────────────────────────────────────────────────────────

const RLS_SQL = `-- Run this entire block in Supabase → SQL Editor
-- It enables public reads and authenticated writes on all tables.

-- CATEGORIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
DROP POLICY IF EXISTS "auth_write_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "auth_write_categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON products;
DROP POLICY IF EXISTS "auth_write_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT USING (true);
CREATE POLICY "auth_write_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PRODUCT_IMAGES
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
DROP POLICY IF EXISTS "auth_write_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "auth_write_product_images" ON product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- USER_ROLES
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_read_user_roles" ON user_roles;
DROP POLICY IF EXISTS "auth_write_user_roles" ON user_roles;
CREATE POLICY "auth_read_user_roles" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_user_roles" ON user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);`

const SERVICES_SQL = `-- Create the services table (if not already created)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  image TEXT,
  price_from DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_services" ON services;
DROP POLICY IF EXISTS "auth_write_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT USING (true);
CREATE POLICY "auth_write_services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);`

// ─── Cloudinary helper ─────────────────────────────────────────────────────────

async function uploadToCloudinary(localPath, cache) {
  if (cache[localPath]) return cache[localPath]
  const segments = localPath.split('/')
  const filename = segments.pop()
  const encodedPath = [...segments, encodeURIComponent(filename)].join('/')
  const fetchResp = await fetch(encodedPath)
  if (!fetchResp.ok) throw new Error(`Could not load image: ${filename}`)
  const blob = await fetchResp.blob()
  const fd = new FormData()
  fd.append('file', blob, filename)
  fd.append('upload_preset', PRESET)
  const upResp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd })
  if (!upResp.ok) {
    const errData = await upResp.json().catch(() => ({}))
    throw new Error(errData.error?.message || 'Cloudinary upload failed')
  }
  const data = await upResp.json()
  cache[localPath] = data.secure_url
  return data.secure_url
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SetupData() {
  const [counts, setCounts] = useState({ categories: 0, services: 0, products: 0 })
  const [loading, setLoading] = useState(true)
  const [servicesTableMissing, setServicesTableMissing] = useState(false)
  const [diagnostics, setDiagnostics] = useState(null)
  const [diagRunning, setDiagRunning] = useState(false)
  const [showRlsSql, setShowRlsSql] = useState(false)
  const [showServicesSql, setShowServicesSql] = useState(false)
  const [copied, setCopied] = useState('')

  const [catState, setCatState] = useState({ running: false, step: '', done: 0, total: 0 })
  const [srvState, setSrvState] = useState({ running: false, step: '', done: 0, total: 0 })
  const [prodState, setProdState] = useState({ running: false, step: '', done: 0, total: 0 })

  useEffect(() => { fetchCounts() }, [])

  const fetchCounts = async () => {
    setLoading(true)
    try {
      const [catRes, srvRes, prodRes] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
      ])
      const srvMissing = srvRes.error?.code === '42P01' || srvRes.error?.message?.includes('does not exist')
      setServicesTableMissing(srvMissing)
      setCounts({
        categories: catRes.count ?? 0,
        services: srvMissing ? 0 : (srvRes.count ?? 0),
        products: prodRes.count ?? 0,
      })
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  // ── Diagnostics ──────────────────────────────────────────────────────────────
  const runDiagnostics = async () => {
    setDiagRunning(true)
    setDiagnostics(null)
    const results = {}

    // Check URL + key
    results.url = import.meta.env.VITE_SUPABASE_URL || '(not set)'
    results.keySet = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
    results.keyPrefix = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').substring(0, 20) + '…'

    // Test each table: read then write
    const TABLES = ['categories', 'products', 'services', 'product_images', 'user_roles']
    results.tables = {}

    for (const table of TABLES) {
      const r = { read: null, write: null, exists: true }
      // Read test
      const { data, error: readErr } = await supabase.from(table).select('id').limit(1)
      if (readErr?.code === '42P01' || readErr?.message?.includes('does not exist')) {
        r.exists = false
        r.read = 'table_missing'
        r.write = 'table_missing'
      } else if (readErr?.code === 'PGRST301' || readErr?.message?.includes('JWT')) {
        r.read = 'key_invalid'
        r.write = 'key_invalid'
      } else if (readErr?.message?.includes('permission') || readErr?.message?.includes('policy') || readErr?.code === '42501') {
        r.read = 'rls_blocked'
      } else if (readErr) {
        r.read = `error: ${readErr.message}`
      } else {
        r.read = 'ok'
      }

      // Write test (insert then immediately delete a test row)
      if (r.exists && r.read !== 'key_invalid') {
        const testRow = table === 'categories' ? { name: '__diag_test__' }
          : table === 'products' ? { name: '__diag_test__', price: 0 }
          : table === 'services' ? { title: '__diag_test__' }
          : table === 'product_images' ? null
          : table === 'user_roles' ? null
          : null

        if (testRow) {
          const { data: ins, error: writeErr } = await supabase.from(table).insert([testRow]).select('id').single()
          if (writeErr?.message?.includes('permission') || writeErr?.message?.includes('policy') || writeErr?.code === '42501' || writeErr?.code === 'PGRST301') {
            r.write = 'rls_blocked'
          } else if (writeErr?.message?.includes('JWT') || writeErr?.message?.includes('invalid')) {
            r.write = 'key_invalid'
          } else if (writeErr) {
            r.write = `error: ${writeErr.message}`
          } else {
            r.write = 'ok'
            // Clean up the test row
            if (ins?.id) await supabase.from(table).delete().eq('id', ins.id)
          }
        } else {
          r.write = 'skipped'
        }
      }
      results.tables[table] = r
    }

    setDiagnostics(results)
    setDiagRunning(false)
  }

  const copyToClipboard = async (text, key) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  // ── Seed helpers ─────────────────────────────────────────────────────────────
  const seedCategories = async () => {
    setCatState({ running: true, step: 'Inserting categories…', done: 0, total: CATEGORIES_SEED.length })
    try {
      const rows = CATEGORIES_SEED.map(name => ({ name }))
      const { error } = await supabase.from('categories').upsert(rows, { onConflict: 'name' })
      if (error) throw error
      toast.success(`${CATEGORIES_SEED.length} categories saved!`)
      fetchCounts()
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setCatState({ running: false, step: '', done: 0, total: 0 })
    }
  }

  const seedServices = async () => {
    if (servicesTableMissing) { toast.error('Create the services table first'); return }
    setSrvState({ running: true, step: 'Checking existing records…', done: 0, total: SERVICES_SEED.length })
    try {
      const { data: existing } = await supabase.from('services').select('title')
      const existingTitles = new Set((existing || []).map(s => s.title))
      const toInsert = SERVICES_SEED.filter(s => !existingTitles.has(s.title))
      if (toInsert.length === 0) { toast.success('All services already in database!'); setSrvState({ running: false, step: '', done: 0, total: 0 }); return }
      const imageCache = {}
      let done = 0
      for (const srv of toInsert) {
        done++
        setSrvState({ running: true, step: `Uploading: ${srv.title}`, done, total: toInsert.length })
        const cloudUrl = await uploadToCloudinary(srv.localImage, imageCache)
        const { localImage, ...rest } = srv
        const { error } = await supabase.from('services').insert([{ ...rest, image: cloudUrl }])
        if (error) throw error
      }
      toast.success(`${toInsert.length} services uploaded & saved!`)
      fetchCounts()
    } catch (err) {
      toast.error('Services failed: ' + err.message)
    } finally {
      setSrvState({ running: false, step: '', done: 0, total: 0 })
    }
  }

  const seedProducts = async () => {
    setProdState({ running: true, step: 'Checking existing records…', done: 0, total: PRODUCTS_SEED.length })
    try {
      const { data: existing } = await supabase.from('products').select('name')
      const existingNames = new Set((existing || []).map(p => p.name))
      const toInsert = PRODUCTS_SEED.filter(p => !existingNames.has(p.name))
      if (toInsert.length === 0) { toast.success('All products already in database!'); setProdState({ running: false, step: '', done: 0, total: 0 }); return }
      const imageCache = {}
      let done = 0
      for (const prod of toInsert) {
        done++
        setProdState({ running: true, step: `Uploading: ${prod.name}`, done, total: toInsert.length })
        const cloudUrl = await uploadToCloudinary(prod.localImage, imageCache)
        const { localImage, ...rest } = prod
        const { error } = await supabase.from('products').insert([{ ...rest, primary_image: cloudUrl }])
        if (error) throw error
      }
      toast.success(`${toInsert.length} products uploaded & saved!`)
      fetchCounts()
    } catch (err) {
      toast.error('Products failed: ' + err.message)
    } finally {
      setProdState({ running: false, step: '', done: 0, total: 0 })
    }
  }

  // ── Sub-components ───────────────────────────────────────────────────────────
  const Spinner = ({ color = 'rgba(255,255,255,0.4)', top = '#fff' }) => (
    <div style={{ width: '13px', height: '13px', border: `2px solid ${color}`, borderTopColor: top, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
  )

  const StatusBadge = ({ status }) => {
    const MAP = {
      ok: { label: '✓ OK', bg: '#f0fdf4', color: '#16a34a' },
      rls_blocked: { label: '✗ Blocked by RLS', bg: '#fef2f2', color: '#dc2626' },
      table_missing: { label: '✗ Table missing', bg: '#fef3c7', color: '#d97706' },
      key_invalid: { label: '✗ Key invalid', bg: '#fef2f2', color: '#dc2626' },
      skipped: { label: '— Skipped', bg: '#f3f4f6', color: '#9ca3af' },
    }
    const s = MAP[status] || { label: status, bg: '#f3f4f6', color: '#6b7280' }
    return (
      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
        {s.label}
      </span>
    )
  }

  const SeedCard = ({ title, description, icon, dbCount, seedTotal, state, onSeed, disabled }) => {
    const pct = seedTotal > 0 ? Math.min(100, Math.round((dbCount / seedTotal) * 100)) : 0
    const isDone = dbCount >= seedTotal && seedTotal > 0
    const inProgress = state.running
    return (
      <div style={{ ...card }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0, background: isDone ? '#f0fdf4' : inProgress ? '#fdf4ff' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDone ? '#16a34a' : inProgress ? '#9333ea' : '#ea580c' }}>
            <Icon name={icon} size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>{title}</h3>
              {isDone && <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '99px', border: '1px solid #bbf7d0' }}>✓ Complete</span>}
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '3px 0 0' }}>{description}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: isDone ? '#16a34a' : '#111827', lineHeight: 1 }}>{loading ? '…' : dbCount}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>/ {seedTotal} in DB</div>
          </div>
        </div>
        <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ height: '100%', width: inProgress && state.total > 0 ? `${Math.round((state.done / state.total) * 100)}%` : `${pct}%`, background: isDone ? '#16a34a' : inProgress ? '#9333ea' : '#E8000D', borderRadius: '99px', transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: inProgress ? '#9333ea' : '#6b7280', flex: 1, minWidth: 0 }}>
            {inProgress ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', border: '2px solid #d8b4fe', borderTopColor: '#9333ea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state.total > 0 ? `${state.done}/${state.total} — ` : ''}{state.step}</span>
              </span>
            ) : isDone ? <span style={{ color: '#16a34a', fontWeight: 600 }}>All {seedTotal} records in database</span>
              : <span>{seedTotal - dbCount} record{seedTotal - dbCount !== 1 ? 's' : ''} ready to import</span>}
          </div>
          <button
            onClick={onSeed}
            disabled={inProgress || disabled}
            style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: inProgress || disabled ? 'not-allowed' : 'pointer', background: inProgress ? '#9333ea' : isDone ? '#f3f4f6' : '#E8000D', color: inProgress ? '#fff' : isDone ? '#6b7280' : '#fff', display: 'flex', alignItems: 'center', gap: '7px', opacity: disabled && !inProgress ? 0.5 : 1, flexShrink: 0 }}
          >
            {inProgress ? <><Spinner /> Working…</> : <><Icon name="upload" size={13} />{isDone ? 'Re-import' : 'Import Now'}</>}
          </button>
        </div>
      </div>
    )
  }

  // Determine if there are any RLS issues from diagnostics
  const hasRlsIssues = diagnostics && Object.values(diagnostics.tables || {}).some(
    t => t.read === 'rls_blocked' || t.write === 'rls_blocked'
  )
  const hasKeyIssue = diagnostics && Object.values(diagnostics.tables || {}).some(
    t => t.read === 'key_invalid' || t.write === 'key_invalid'
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Setup & Import Data</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Diagnose your Supabase connection, set up permissions, and import all data.</p>
      </div>

      {/* ── STEP 1: Diagnostics ── */}
      <div style={{ ...card }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Step 1 — Test Connection & Permissions</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>Run this first to see exactly what is and isn't working.</p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={diagRunning}
            style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: '1.5px solid #e5e7eb', background: diagRunning ? '#f9fafb' : '#fff', color: '#374151', cursor: diagRunning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}
          >
            {diagRunning ? <><Spinner color="#e5e7eb" top="#6b7280" /> Running…</> : <><Icon name="refresh" size={14} /> Run Diagnostics</>}
          </button>
        </div>

        {!diagnostics && !diagRunning && (
          <div style={{ padding: '24px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Click "Run Diagnostics" to test your Supabase connection and table permissions.
          </div>
        )}

        {diagnostics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Key info */}
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#6b7280', minWidth: '120px' }}>Supabase URL:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#111827', wordBreak: 'break-all' }}>{diagnostics.url}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#6b7280', minWidth: '120px' }}>Anon Key:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#111827' }}>{diagnostics.keyPrefix}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: diagnostics.keySet ? '#f0fdf4' : '#fef2f2', color: diagnostics.keySet ? '#16a34a' : '#dc2626' }}>
                  {diagnostics.keySet ? '✓ Set' : '✗ Missing'}
                </span>
              </div>
            </div>

            {/* Table results */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Table', 'Exists', 'Read (SELECT)', 'Write (INSERT)'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontWeight: 700, color: '#6b7280', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(diagnostics.tables).map(([table, r]) => (
                    <tr key={table} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827', fontFamily: 'monospace', fontSize: '13px' }}>{table}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: r.exists ? '#f0fdf4' : '#fef3c7', color: r.exists ? '#16a34a' : '#d97706' }}>
                          {r.exists ? '✓ Yes' : '✗ Missing'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}><StatusBadge status={r.read} /></td>
                      <td style={{ padding: '10px 14px' }}><StatusBadge status={r.write} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Guidance */}
            {hasKeyIssue && (
              <div style={{ padding: '14px 16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '13px', color: '#dc2626', lineHeight: 1.6 }}>
                <strong>Invalid API key</strong> — Go to your Supabase dashboard → Project Settings → API → copy the <strong>anon / public</strong> key and update <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code> file, then restart the dev server.
              </div>
            )}

            {hasRlsIssues && !hasKeyIssue && (
              <div style={{ padding: '14px 16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '13px', color: '#92400e', lineHeight: 1.7 }}>
                <strong>Row Level Security (RLS) is blocking reads or writes.</strong> This is the most common reason why adding categories/products doesn't work. Run the SQL in Step 2 below to fix it.
              </div>
            )}

            {!hasRlsIssues && !hasKeyIssue && diagnostics && (
              <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#166534', lineHeight: 1.6 }}>
                <strong>Connection and permissions look good!</strong> You can proceed to import data below.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── STEP 2: RLS SQL ── */}
      <div style={{ ...card }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: showRlsSql ? '16px' : 0 }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Step 2 — Fix Permissions (RLS)</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>Run this SQL in Supabase → SQL Editor to allow reads and writes.</p>
          </div>
          <button
            onClick={() => setShowRlsSql(v => !v)}
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name={showRlsSql ? 'chevDown' : 'eye'} size={13} />
            {showRlsSql ? 'Hide' : 'Show SQL'}
          </button>
        </div>
        {showRlsSql && (
          <div style={{ position: 'relative' }}>
            <pre style={{ background: '#0f172a', color: '#94a3b8', padding: '16px 20px', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace', overflow: 'auto', lineHeight: 1.7, margin: 0, maxHeight: '360px' }}>
              {RLS_SQL}
            </pre>
            <button
              onClick={() => copyToClipboard(RLS_SQL, 'rls')}
              style={{ position: 'absolute', top: '10px', right: '10px', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: 'none', background: copied === 'rls' ? '#16a34a' : '#334155', color: '#fff', cursor: 'pointer' }}
            >
              {copied === 'rls' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* ── STEP 2b: Services SQL ── */}
      {servicesTableMissing && (
        <div style={{ ...card, border: '1.5px solid #fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: showServicesSql ? '16px' : 0 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ color: '#d97706', marginTop: '1px', flexShrink: 0 }}><Icon name="warning" size={18} /></div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Step 2b — Create Services Table</h2>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>The services table doesn't exist yet. Run this SQL first, then click "Check Again" below.</p>
              </div>
            </div>
            <button
              onClick={() => setShowServicesSql(v => !v)}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name={showServicesSql ? 'chevDown' : 'eye'} size={13} />
              {showServicesSql ? 'Hide' : 'Show SQL'}
            </button>
          </div>
          {showServicesSql && (
            <div style={{ position: 'relative' }}>
              <pre style={{ background: '#0f172a', color: '#94a3b8', padding: '16px 20px', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace', overflow: 'auto', lineHeight: 1.7, margin: 0 }}>
                {SERVICES_SQL}
              </pre>
              <button
                onClick={() => copyToClipboard(SERVICES_SQL, 'svc')}
                style={{ position: 'absolute', top: '10px', right: '10px', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: 'none', background: copied === 'svc' ? '#16a34a' : '#334155', color: '#fff', cursor: 'pointer' }}
              >
                {copied === 'svc' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          )}
          <button onClick={fetchCounts} style={{ marginTop: '14px', padding: '9px 18px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#374151', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="refresh" size={14} /> Check Again
          </button>
        </div>
      )}

      {/* ── STEP 3: Import data ── */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Step 3 — Import Data</h2>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
          Images are uploaded to Cloudinary (<strong>{CLOUD}</strong>) before being saved. Same image files are only uploaded once.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SeedCard title="Categories" description="24 car brands — no image upload needed" icon="categories" dbCount={counts.categories} seedTotal={CATEGORIES_SEED.length} state={catState} onSeed={seedCategories} />
          <SeedCard title="Services" description="15 signage & print services — images uploaded to Cloudinary" icon="services" dbCount={counts.services} seedTotal={SERVICES_SEED.length} state={srvState} onSeed={seedServices} disabled={servicesTableMissing} />
          <SeedCard title="Products" description="12 vehicle wrap packages — images uploaded to Cloudinary" icon="products" dbCount={counts.products} seedTotal={PRODUCTS_SEED.length} state={prodState} onSeed={seedProducts} />
        </div>
      </div>
    </div>
  )
}
