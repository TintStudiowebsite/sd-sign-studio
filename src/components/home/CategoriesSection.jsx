import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export const BRAND_ICONS = {
  'Audi': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/audi.svg',
  'Bentley': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/bentley.svg',
  'BMW': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/bmw.svg',
  'BYD': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '75%', height: '75%', color: '#ffffff' }}>
      <ellipse cx="12" cy="12" rx="10" ry="7" strokeWidth="1.5" />
      <path d="M6 9 v6 M6 9 h2.2 a1.5 1.5 0 0 1 0 3 M6 12 h2.2 a1.5 1.5 0 0 1 0 3" />
      <path d="M10.5 9 L12 12.2 L13.5 9 M12 12.2 V15" />
      <path d="M15.5 9 H17.5 A3 3 0 0 1 17.5 15 H15.5 V9" />
    </svg>
  ),
  'Hyundai': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/hyundai.svg',
  'Jaguar': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/jaguar.svg',
  'Jeep': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/jeep.svg',
  'Kia': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/kia.svg',
  'Land Rover': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/landrover.svg',
  'Lexus': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '65%', height: '65%', color: '#ffffff' }}>
      <ellipse cx="12" cy="12" rx="9.5" ry="7" />
      <path d="M14.5 7.5 L8.2 14.5 H16.5" strokeWidth="2.2" />
    </svg>
  ),
  'Mahindra': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mahindra.svg',
  'Maruti Suzuki': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/suzuki.svg',
  'Maserati': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/maserati.svg',
  'Renault': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/renault.svg',
  'Mercedes Benz': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mercedes.svg',
  'MG': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mg.svg',
  'Mini': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mini.svg',
  'Porsche': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/porsche.svg',
  'Skoda': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/skoda.svg',
  'Tata': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tata.svg',
  'Toyota': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/toyota.svg',
  'Vinfast': (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '60%', height: '60%', color: '#ffffff' }}>
      <path d="M3 6.5 L12 19 L21 6.5 H17.5 L12 14.5 L6.5 6.5 Z M6.5 4.5 L12 12 L17.5 4.5 H14.5 L12 8.5 L9.5 4.5 Z" />
    </svg>
  ),
  'Volkswagen': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/volkswagen.svg',
  'Volvo': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/volvo.svg',
}

// Real service photos shown in the circles of the "Popular Categories"
// section on the landing page. To add another, drop an image into
// public/images/categories/ and add a matching entry here — if the image
// is missing (like the 3rd one below, still to be added), the circle
// safely falls back to a letter monogram instead of breaking.
const PHOTO_CATEGORIES = [
  { name: 'Car Interior Film ', icon: '/images/categories/film.webp', hasImage: true },
  { name: 'Car Interior PPF', icon: '/images/categories/int_ppf.jpg', hasImage: true },
  { name: 'Car Exterior PPF', icon: 'https://th.bing.com/th/id/OIP.u5DE_NTjY2iaX_ek-UwlpwHaE8?w=263&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', hasImage: true },
]

const STATIC_CATEGORIES = [
  ...PHOTO_CATEGORIES,
  // ...Object.keys(BRAND_ICONS).map(name => ({ name, icon: BRAND_ICONS[name] })),
]

export default function CategoriesSection() {
  const [categories, setCategories] = useState(STATIC_CATEGORIES)
  const parentCategories = categories.filter(cat => !cat.parent_id)

  // Per-category image failure tracking: 0 = nothing has failed yet,
  // 1 = the admin-uploaded photo failed to load (fall back to the
  // hardcoded brand icon), 2 = even that failed (fall back to the
  // letter monogram, which can never fail since it's plain text).
  const [iconFailures, setIconFailures] = useState({})
  const handleIconError = (key) => {
    setIconFailures(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
  }

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })
        if (!error && data && data.length > 0) {
          const dbCategories = data.map(c => ({
            ...c,
            icon: c.icon_url || BRAND_ICONS[c.name] || null,
            hasImage: Boolean(c.icon_url),
          }))
          // Keep the hardcoded photo categories (Interior Film Wrap, Interior
          // PPF, Exterior PPF) showing even once real categories load from
          // the database, instead of replacing them outright.
          const dbNames = new Set(dbCategories.map(c => c.name))
          const extraPhotoCategories = PHOTO_CATEGORIES.filter(c => !dbNames.has(c.name))
          setCategories([...extraPhotoCategories])
        }
      } catch {
        // keep static fallback
      }
    }
    fetchCategories()
  }, [])

  return (
    <section className="section categories-section" id="products">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-eyebrow">Our Services</span>
          <h2 className="section-title">Popular <span className="red">Categories</span></h2>
        </div>
        <div className="cat-grid">
          {parentCategories.map((cat) => {
            const key = cat.id || cat.name
            const failureLevel = iconFailures[key] || 0

            let resolvedIcon = null
            let isPhoto = false
            if (failureLevel === 0 && cat.hasImage && cat.icon) {
              // The admin-uploaded circle photo, when present and not (yet) broken.
              resolvedIcon = cat.icon
              isPhoto = true
            } else if (failureLevel <= 1 && BRAND_ICONS[cat.name]) {
              // Hardcoded brand icon fallback — used when there's no admin photo,
              // or the admin photo failed to load.
              resolvedIcon = BRAND_ICONS[cat.name]
              isPhoto = false
            }
            // Anything else (no match, or even the hardcoded icon failed to load)
            // falls through to the letter monogram below, which always renders.

            return (
              <Link className="cat-card" key={key} to={`/shop?category=${encodeURIComponent(cat.name)}`}>
                <div className="cat-logo-circle">
                  {typeof resolvedIcon === 'string' ? (
                    <img
                      className={isPhoto ? 'cat-photo' : 'cat-icon'}
                      src={resolvedIcon}
                      alt={cat.name}
                      onError={() => handleIconError(key)}
                    />
                  ) : resolvedIcon ? (
                    resolvedIcon
                  ) : (
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>{cat.name.charAt(0)}</span>
                  )}
                </div>
                <div className="cat-name">{cat.name}</div>
              </Link>
            )
          })}
        </div>
        <div className="section-footer">
          <a href="/shop" className="btn-red">View All Products</a>
        </div>
      </div>
    </section>
  )
}

