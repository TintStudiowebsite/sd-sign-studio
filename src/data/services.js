import {
  Store,
  Truck,
  Lightbulb,
  Printer,
  Shield,
  Layout,
  Monitor,
  Type,
  Shirt,
  FileText,
  Flag,
  Menu,
  UtensilsCrossed,
  Construction,
  Sparkles,
} from 'lucide-react'

export const STATIC_SERVICES = [
  { title: 'Van Branding', short_description: 'Turn your company vehicle into a powerful moving advertisement with professional branding that gets your business noticed.', image: '/images/NewProducts/van-branding.webp', popular: true },
  { title: 'Shop Front Signs', short_description: 'We create eye-catching shop front signs that attract attention and make your business stand out from the crowd.', image: '/images/NewProducts/shop-front-signs.webp' },
  { title: '3D Lettering Signs', short_description: 'Add depth and dimension to your brand with premium 3D lettering signs, built to leave a lasting impression.', image: '/images/NewProducts/3d-lettering-signs.webp' },
  { title: 'Illuminated & Neon Signs', short_description: 'Day or night, give your business a stunning glow with our illuminated and neon signs.', image: '/images/NewProducts/Illuminated-neon-signs.webp' },
  { title: 'Window Graphics', short_description: 'Make the most of your glass space with custom window graphics that promote your business in style.', image: '/images/NewProducts/window-graphics.webp' },
  { title: 'Projecting Signs & Lightboxes', short_description: 'High-impact projecting signs and lightboxes designed to ensure your business is seen from every angle.', image: '/images/NewProducts/projecting-signs.webp' },
  { title: 'Banner & Logo Printing', short_description: 'From banners to business cards, we deliver high-quality printing that represents your brand perfectly.', image: '/images/NewProducts/banner-logo-printing.webp' },
  { title: 'Safety & Interior Signs', short_description: 'Professional safety and interior signs to help you maintain a safe, organised and compliant environment.', image: '/images/NewProducts/safety-interrior-signs.webp' },
  { title: 'Shop Awnings', short_description: 'Stylish branded awnings that protect your storefront and add a premium look to your business.', image: '/images/client-images/awnings.jpeg' },
  { title: 'Custom Workwear', short_description: 'Professionally printed or embroidered branded workwear across our full clothing range.', image: '/images/client-images/van_wrapping.jpg' },
  { title: 'Flyers & Brochures', short_description: 'Professional flyers and brochures that tell your brand story and drive real customer interest.', image: '/images/client-images/flyers.webp' },
  { title: 'Exhibition Stands & Flags', short_description: 'Fully branded exhibition stands and feather flags tailored to your budget and space.', image: '/images/client-images/exhibition.jpeg' },
  { title: 'Menu Displays', short_description: 'Custom-designed menu boards that highlight your offerings and elevate your venue\'s look.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg' },
  { title: 'Food Truck/Trailer Wraps', short_description: 'Bold food trailer wraps and signage that make your mobile business impossible to miss.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg' },
  { title: 'Heras Fence Banners', short_description: 'Turn construction site hoardings into powerful brand advertising visible to thousands daily.', image: '/images/client-images/car2.jpg' },
]

export const SERVICE_ICONS = [
  { match: /3d letter/i, Icon: Type },
  { match: /shop front/i, Icon: Store },
  { match: /illuminat|neon/i, Icon: Lightbulb },
  { match: /projecting|lightbox/i, Icon: Monitor },
  { match: /van brand/i, Icon: Truck },
  { match: /vehicle|wrap/i, Icon: Truck },
  { match: /window/i, Icon: Layout },
  { match: /awning/i, Icon: Store },
  { match: /banner|logo printing/i, Icon: Printer },
  { match: /workwear|clothing/i, Icon: Shirt },
  { match: /flyer|brochure/i, Icon: FileText },
  { match: /exhibition|flag/i, Icon: Flag },
  { match: /menu/i, Icon: Menu },
  { match: /safety|interior/i, Icon: Shield },
  { match: /food truck|trailer/i, Icon: UtensilsCrossed },
  { match: /heras|fence/i, Icon: Construction },
]

export function getServiceIcon(title = '') {
  const match = SERVICE_ICONS.find(({ match: pattern }) => pattern.test(title))
  return match ? match.Icon : Sparkles
}

export function slugify(title = '') {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
