import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Icon } from './icon'
import { formatCurrency, getProductPrice } from '../../context/CountryContext'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }

const STAT_CONFIG = [
  { key: 'products',    label: 'Total Products',   icon: 'products',     color: '#3b82f6', bg: '#eff6ff', link: '/admin/products' },
  { key: 'categories', label: 'Categories',        icon: 'categories',   color: '#10b981', bg: '#f0fdf4', link: '/admin/categories' },
  { key: 'services',   label: 'Services',          icon: 'services',     color: '#8b5cf6', bg: '#f5f3ff', link: '/admin/services' },
  { key: 'customers',  label: 'Customers',         icon: 'customers',    color: '#f59e0b', bg: '#fffbeb', link: '/admin/customers' },
  { key: 'inquiries',  label: 'Open Inquiries',    icon: 'inquiries',    color: '#E8000D', bg: '#fff1f2', link: '/admin/inquiries' },
]

const QUICK_ACTIONS = [
  { label: 'Add Product',    path: '/admin/products/new', icon: 'products', color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Add Service',    path: '/admin/services/new', icon: 'services',  color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'View Inquiries', path: '/admin/inquiries',    icon: 'inquiries', color: '#E8000D', bg: '#fff1f2' },
  { label: 'Desktop Banner', path: '/admin/banners/desktop', icon: 'photo', color: '#f97316', bg: '#fff7ed' },
  { label: 'Mobile Banner',  path: '/admin/banners/mobile',  icon: 'photo', color: '#ec4899', bg: '#fdf2f8' },
  { label: 'SEO Settings',   path: '/admin/seo',          icon: 'seo',       color: '#10b981', bg: '#f0fdf4' },
]

async function safeCount(table, filter = null) {
  try {
    let q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (filter) q = q.eq(filter.col, filter.val)
    const { count } = await q
    return count || 0
  } catch {
    return 0
  }
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ products: 0, categories: 0, services: 0, customers: 0, inquiries: 0 })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    async function load() {
      const [products, categories, services, customers, inquiries] = await Promise.all([
        safeCount('products'),
        safeCount('categories'),
        safeCount('services'),
        safeCount('user_roles'),
        safeCount('contact_submissions', { col: 'is_read', val: false }),
      ])
      setStats({ products, categories, services, customers, inquiries })

      const { data } = await supabase
        .from('products')
        .select('id, name, category, price, price_inr, price_gbp, primary_image, created_at')
        .order('created_at', { ascending: false })
        .limit(6)
      setRecentProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const firstName = user?.email?.split('@')[0] || 'Admin'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Welcome Banner */}
      <div style={{ ...card, padding: '28px 32px', background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(232,0,13,0.12)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '80px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(232,0,13,0.07)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: 0 }}>
            {greeting}, <span style={{ color: '#E8000D' }}>{firstName}</span>!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontSize: '14px' }}>
            Welcome back to SD Sign Studio admin panel.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ ...card, padding: '24px', height: '110px', background: '#f9fafb' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {STAT_CONFIG.map(({ key, label, icon, color, bg, link }) => (
            <Link key={key} to={link} style={{ ...card, padding: '24px', textDecoration: 'none', display: 'block', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  <Icon name={icon} size={20} />
                </div>
                <Icon name="chevRight" size={14} color="#9ca3af" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{stats[key]}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginTop: '6px' }}>{label}</div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Quick Actions */}
        <div style={{ ...card, padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="plus" size={16} />
            Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {QUICK_ACTIONS.map(({ label, path, icon, color, bg }) => (
              <Link
                key={path}
                to={path}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: bg, textDecoration: 'none', fontSize: '13px', fontWeight: 600, color: '#111827', transition: 'opacity 0.15s', border: `1.5px solid ${color}18` }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <span style={{ color }}>
                  <Icon name={icon} size={16} />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div style={{ ...card, padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="info" size={16} />
            System Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Database', status: 'Connected', ok: true },
              { label: 'Image Storage', status: 'Cloudinary Active', ok: true },
              { label: 'Authentication', status: 'Supabase Auth', ok: true },
              { label: 'Inquiries Table', status: 'Ready', ok: true },
            ].map(({ label, status, ok }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: '#f9fafb' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: ok ? '#10b981' : '#f59e0b' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ok ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div style={{ ...card }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="products" size={16} />
            Recent Products
          </h3>
          <Link to="/admin/products" style={{ fontSize: '13px', fontWeight: 600, color: '#E8000D', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Product', 'Category', 'Price', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentProducts.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No products yet. <Link to="/admin/products/new" style={{ color: '#E8000D', fontWeight: 700 }}>Add your first product →</Link></td></tr>
              ) : recentProducts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.primary_image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', background: '#f3f4f6' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: '#6b7280' }}>{p.category}</td>
                  <td style={{ padding: '13px 20px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                    <div>{formatCurrency(getProductPrice(p, 'IN'), 'IN')}</div>
                    <div style={{ marginTop: '2px', color: '#6b7280', fontSize: '12px' }}>{formatCurrency(getProductPrice(p, 'GB'), 'GB')}</div>
                  </td>
                  <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                    <Link to={`/admin/products/edit/${p.id}`} style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', textDecoration: 'none', padding: '6px 12px', background: '#eff6ff', borderRadius: '6px' }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
