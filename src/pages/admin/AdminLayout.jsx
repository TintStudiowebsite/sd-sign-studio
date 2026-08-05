import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const SIDEBAR_W = 260

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { name: 'Dashboard', path: '/admin', icon: 'dashboard', exact: true },
    ],
  },
  {
    label: 'Store',
    items: [
      {
        name: 'Products',
        icon: 'products',
        children: [
          { name: 'All Products', path: '/admin/products' },
          { name: 'Add Product', path: '/admin/products/new' },
          { name: 'Categories', path: '/admin/categories' },
        ],
      },
      { name: 'Customers', path: '/admin/customers', icon: 'customers' },
      { name: 'Inquiries', path: '/admin/inquiries', icon: 'inquiries' },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        name: 'Banner Management',
        icon: 'photo',
        children: [
          { name: 'Desktop Banner', path: '/admin/banners/desktop' },
          { name: 'Mobile Banner', path: '/admin/banners/mobile' },
        ],
      },
      { name: 'Gallery Banner', path: '/admin/gallery-banner', icon: 'photo' },
      { name: 'Gallery Categories', path: '/admin/gallery-categories', icon: 'categories' },
      { name: 'Why Us Section', path: '/admin/why-us', icon: 'about' },
      { name: 'Gallery', path: '/admin/gallery', icon: 'categories' },
      { name: 'Services', path: '/admin/services', icon: 'services' },
      { name: 'Testimonials', path: '/admin/testimonials', icon: 'testimonials' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { name: 'SEO Settings', path: '/admin/seo', icon: 'seo' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { name: 'Analytics', path: '/admin/analytics', icon: 'analytics' },
    ],
  },
]

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/hero': 'Desktop Banner',
  '/admin/banners/desktop': 'Desktop Banner',
  '/admin/banners/mobile': 'Mobile Banner',
  '/admin/gallery-banner': 'Gallery Banner',
  '/admin/gallery-categories': 'Gallery Categories',
  '/admin/why-us': 'Why Us Section',
  '/admin/gallery': 'Manage Gallery',
  '/admin/products': 'Products',
  '/admin/products/new': 'Add Product',
  '/admin/categories': 'Categories',
  '/admin/customers': 'Customers',
  '/admin/inquiries': 'Inquiries',
  '/admin/services': 'Services',
  '/admin/services/new': 'Add Service',
  '/admin/testimonials': 'Testimonials',
  '/admin/seo': 'SEO Settings',
  '/admin/analytics': 'Analytics',
}

function NavItem({ item, location, depth = 0, onClose }) {
  const isChildActive = item.children?.some(c =>
    location.pathname === c.path || location.pathname.startsWith(c.path + '/')
  )
  const [open, setOpen] = useState(isChildActive)

  const isActive = item.exact
    ? location.pathname === item.path
    : item.path && (location.pathname === item.path || location.pathname.startsWith(item.path + '/'))

  const activeBase = {
    color: '#ffffff',
    background: 'rgba(232,0,13,0.14)',
    borderLeftColor: '#E8000D',
  }
  const inactiveBase = {
    color: 'rgba(255,255,255,0.58)',
    background: 'transparent',
    borderLeftColor: 'transparent',
  }

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: depth > 0 ? '7px 14px 7px 38px' : '10px 14px',
    borderRadius: '8px',
    fontSize: depth > 0 ? '13px' : '14px',
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    textDecoration: 'none',
    userSelect: 'none',
    borderLeft: '3px solid transparent',
    ...(isActive ? activeBase : inactiveBase),
  }

  if (item.children) {
    return (
      <div>
        <div
          onClick={() => setOpen(o => !o)}
          style={{
            ...baseStyle,
            justifyContent: 'space-between',
            color: isChildActive ? '#fff' : 'rgba(255,255,255,0.58)',
            background: isChildActive ? 'rgba(232,0,13,0.1)' : 'transparent',
            borderLeftColor: isChildActive ? '#E8000D' : 'transparent',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name={item.icon} size={16} />
            {item.name}
          </span>
          <span style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)', display: 'flex', opacity: 0.5 }}>
            <Icon name="chevDown" size={13} />
          </span>
        </div>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
            {item.children.map(child => (
              <NavItem key={child.path} item={child} location={location} depth={1} onClose={onClose} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link to={item.path} style={baseStyle} onClick={onClose}>
      {depth === 0 && <Icon name={item.icon} size={16} />}
      {depth > 0 && (
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
          background: isActive ? '#E8000D' : 'rgba(255,255,255,0.25)',
          marginLeft: '2px',
        }} />
      )}
      {item.name}
    </Link>
  )
}

function Sidebar({ location, onClose }) {
  return (
    <aside style={{
      width: SIDEBAR_W,
      background: '#111111',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '38px', height: '38px', background: '#E8000D', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: '15px', fontFamily: 'serif', letterSpacing: '-0.5px' }}>SD</span>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Sign Studio</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: '2px' }}>Admin Panel</div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '0 14px', marginBottom: '6px' }}>
                {group.label}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item, ii) => (
                <NavItem key={ii} item={item} location={location} onClose={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Link
          to="/"
          target="_blank"
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', border: '3px solid transparent' }}
        >
          <Icon name="external" size={15} />
          View Website
        </Link>
      </div>
    </aside>
  )
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || 'A'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f5f7', fontFamily: 'var(--font)' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .admin-sidebar-wrap { position: fixed; top: 0; left: 0; height: 100vh; z-index: 50; transform: translateX(-${SIDEBAR_W}px); transition: transform 0.28s ease; }
          .admin-sidebar-wrap.open { transform: translateX(0); }
          .admin-main { margin-left: 0 !important; }
          .admin-hamburger { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .admin-sidebar-wrap { position: sticky; top: 0; height: 100vh; flex-shrink: 0; z-index: 10; }
          .admin-overlay { display: none !important; }
        }
        .nav-item-link:hover { background: rgba(255,255,255,0.05) !important; color: rgba(255,255,255,0.85) !important; }
        .admin-topbar-btn:hover { background: #f3f4f6 !important; }
      `}</style>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="admin-overlay"
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40 }}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`admin-sidebar-wrap${mobileOpen ? ' open' : ''}`}>
        <Sidebar location={location} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main Area */}
      <div className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e8eaed', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {/* Mobile hamburger */}
            <button
              className="admin-hamburger admin-topbar-btn"
              onClick={() => setMobileOpen(o => !o)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: '8px', borderRadius: '8px', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="menu" size={22} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {PAGE_TITLES[location.pathname] || (location.pathname.includes('edit') ? 'Edit' : 'Admin')}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Link
              to="/"
              target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', textDecoration: 'none', border: '1.5px solid #e5e7eb', background: '#fff', transition: 'all 0.15s' }}
            >
              <Icon name="external" size={14} />
              <span style={{ display: 'none' }} className="sm-show">View Site</span>
            </Link>

            <button
              className="admin-topbar-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '8px', borderRadius: '8px', display: 'flex', position: 'relative' }}
            >
              <Icon name="bell" size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid #e5e7eb' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
                <span style={{ fontSize: '11px', color: '#E8000D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Administrator</span>
              </div>
              <div style={{ width: '36px', height: '36px', background: '#E8000D', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>
                {userInitial}
              </div>
              <button
                onClick={handleLogout}
                className="admin-topbar-btn"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '8px', borderRadius: '8px', display: 'flex' }}
                title="Logout"
              >
                <Icon name="logout" size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '28px 28px 40px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
