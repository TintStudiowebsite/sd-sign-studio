import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CartPage from './pages/CartPage'
import AccountPage from './pages/AccountPage'
import ProtectedRoute from './components/ProtectedRoute'
import GalleryPage from './pages/GalleryPage'
import QuotePage from './pages/QuotePage'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import DashboardHome from './pages/admin/DashboardHome'
import ManageProducts from './pages/admin/ManageProducts'
import ProductForm from './pages/admin/ProductForm'
import ManageCategories from './pages/admin/ManageCategories'
import ManageGalleryCategories from './pages/admin/ManageGalleryCategories'
import ManageServices from './pages/admin/ManageServices'
import ManageCustomers from './pages/admin/ManageCustomers'
import ManageInquiries from './pages/admin/ManageInquiries'
import ManageTestimonials from './pages/admin/ManageTestimonials'
import ManageSEO from './pages/admin/ManageSEO'
import Analytics from './pages/admin/Analytics'
import ManageHero from './pages/admin/ManageHero'
import ManageGalleryBanner from './pages/admin/ManageGalleryBanner'
import ManageGallery from './pages/admin/ManageGallery'
import ManageWhyUs from './pages/admin/ManageWhyUs'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:id" element={<ProductDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          {/* Products */}
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          {/* Categories */}
          <Route path="categories" element={<ManageCategories />} />
          {/* Store */}
          <Route path="customers" element={<ManageCustomers />} />
          <Route path="inquiries" element={<ManageInquiries />} />
          {/* Content */}
          <Route path="hero" element={<ManageHero />} />
          <Route path="gallery-banner" element={<ManageGalleryBanner />} />
          <Route path="gallery-categories" element={<ManageGalleryCategories />} />
          <Route path="why-us" element={<ManageWhyUs />} />
          <Route path="gallery" element={<ManageGallery />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="testimonials" element={<ManageTestimonials />} />
          {/* Marketing & Admin */}
          <Route path="seo" element={<ManageSEO />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </>
  )
}
