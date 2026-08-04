import {
  Award,
  BadgeCheck,
  Building2,
  ClipboardList,
  Clock,
  Cog,
  Construction,
  Factory,
  FileText,
  Flag,
  Gift,
  Layers,
  Layout,
  Lightbulb,
  Megaphone,
  Menu,
  Monitor,
  Package,
  PaintBucket,
  Palette,
  PenTool,
  Printer,
  Shield,
  ShieldCheck,
  Shirt,
  Sparkles,
  Store,
  Sun,
  Truck,
  Type,
  Umbrella,
  UtensilsCrossed,
  Wind,
  Wrench,
} from 'lucide-react'
import { slugify, getServiceIcon } from './services'

export const SHARED_WHY_CHOOSE = [
  { icon: PenTool, title: 'Free Design & Proofing', desc: 'Every project includes a bespoke design and a digital proof, so you can see exactly what you are getting before we produce a thing.' },
  { icon: Award, title: 'Premium Materials', desc: 'We only use industry-leading materials — 3M and Hexis vinyls, acrylic, and LED — engineered to look great and last for years.' },
  { icon: Factory, title: 'In-House Production', desc: 'Design, print, and installation all under one roof means faster delivery and total quality control on every single job.' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Clear timelines and on-time delivery. We schedule your project around your business, not the other way round.' },
  { icon: Wrench, title: 'Expert Installation', desc: 'Trained, insured fitters install every project cleanly and safely — first time, every time.' },
  { icon: ShieldCheck, title: '10+ Years Experience', desc: 'Over a decade of signage, wrapping, and print expertise — trusted by thousands of businesses across the UK.' },
]

export const SHARED_PROCESS = [
  { step: '01', title: 'Consultation', desc: 'We start with a conversation about your goals, site, brand, and budget — then recommend the perfect solution.' },
  { step: '02', title: 'Design & Proof', desc: 'Our in-house designers create a bespoke concept and send you a digital proof to approve or tweak.' },
  { step: '03', title: 'Production', desc: 'Once approved, we manufacture or print your project using premium materials and precision equipment.' },
  { step: '04', title: 'Installation', desc: 'Our expert team installs everything to a flawless finish — on time and without disrupting your business.' },
]

export const SHARED_CTA = {
  heading: 'Ready to Get Started?',
  subheading: 'Request your free quote today — no obligation, no pushy sales. Just honest advice and premium work.',
  buttonLabel: 'Request a Free Quote',
}

const PORTFOLIO = {
  a: ['/images/client-images/car2.jpg', '/images/client-images/van_wrapping.jpg', '/images/client-images/van_wrapping_2.webp'],
  b: ['/images/client-images/van_wrapping.jpg', '/images/client-images/car2.jpg', '/images/client-images/van_wrapping_2.webp'],
  c: ['/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg', '/images/client-images/van_wrapping.jpg', '/images/client-images/car2.jpg'],
  d: ['/images/client-images/van_wrapping_2.webp', '/images/client-images/car2.jpg', '/images/client-images/van_wrapping.jpg'],
  e: ['/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg', '/images/client-images/van_wrapping.jpg', '/images/client-images/car2.jpg'],
  f: ['/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg', '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg', '/images/client-images/van_wrapping.jpg'],
}

const SERVICE_CONTENT = {
  '3d-lettering-signs': {
    heroHeading: 'Make Your Brand Stand Out in Three Dimensions',
    heroIntro: 'Premium 3D letters in metal, wood, or acrylic — with optional LED halo illumination — engineered to give your brand real depth and presence.',
    overview: [
      '3D lettering is the ultimate way to make your sign genuinely impossible to miss. Each letter is precision-cut and built up from the surface to create a sculpted, premium look that catches the light and changes character as people walk past.',
      'From sleek brushed-metal lettering on high-street fascias to warm wooden logos in boutique interiors, we design, fabricate, and install dimensional signage that perfectly reflects your brand.',
    ],
    benefits: [
      'Precision-cut in-house for a flawless finish',
      'Metal, wood, acrylic, or composite builds',
      'Optional LED halo illumination for 24/7 visibility',
      'Durable, weatherproof materials that last for years',
      'Complete design, manufacture, and installation',
    ],
    subServices: [
      { icon: Type, title: 'Metal Letters', desc: 'Brushed stainless steel, brass-look, and powder-coated aluminium lettering with a premium finish.' },
      { icon: PaintBucket, title: 'Acrylic & Perspex', desc: 'Vibrant acrylic lettering in a huge range of colours, finishes, and edge styles.' },
      { icon: Lightbulb, title: 'LED Halo Illumination', desc: 'Backlit halo LEDs that make your lettering glow beautifully against the façade after dark.' },
      { icon: Wrench, title: 'Wooden & Composite', desc: 'Warm, natural wood or weatherproof composite letters for interiors and sheltered exteriors.' },
    ],
    portfolio: PORTFOLIO.a,
  },
  'shop-front-signs': {
    heroHeading: 'Transform Your Storefront Into a Customer Magnet',
    heroIntro: 'From the first site survey to the final install, we design and fit stunning shopfront signage that makes your business unmissable from the street.',
    overview: [
      'Your shopfront is your first impression — and it has just seconds to win customers over. We create bold, beautifully engineered signage that showcases your brand, catches the eye from a distance, and invites people through the door.',
      'Our team handles everything: site surveys, planning, design, fabrication, and installation. You get one accountable partner and a storefront you are genuinely proud of.',
    ],
    benefits: [
      'Free site survey and design consultation',
      'Bespoke fascia, projecting, and window signage',
      'Permit and landlord consent handled for you',
      'Professional installation with minimal disruption',
      'Premium materials backed by product warranties',
    ],
    subServices: [
      { icon: Building2, title: 'Fascia & Frontage', desc: 'High-impact frontage boards and fascias that announce your brand above the street.' },
      { icon: Store, title: 'High-Street Shops', desc: 'Complete shopfront design and installation for independent businesses and national chains.' },
      { icon: Layout, title: 'Window Branding', desc: 'Coordinated window graphics, vinyls, and posters that maximise every inch of glass.' },
      { icon: Lightbulb, title: 'Illuminated Options', desc: 'Add LED, halo-lit, or neon illumination to stay visible long after sunset.' },
    ],
    portfolio: PORTFOLIO.b,
  },
  'illuminated-neon-signs': {
    heroHeading: 'A Glow That Never Goes Out of Style',
    heroIntro: 'Bespoke LED and neon signs that give your premises a stunning, on-brand glow — day and night.',
    overview: [
      'From classic hand-bent neon to energy-efficient LED flex, illuminated signage transforms the way your business is seen after dark. It draws the eye, adds personality, and keeps your brand front of mind around the clock.',
      'We design, build, and install every illuminated sign in-house, so you get a unique piece of brand lighting — not an off-the-shelf generic.',
    ],
    benefits: [
      'Energy-efficient LED flex or classic neon',
      'Fully bespoke designs drawn from your brand',
      'Dimmable, colour-matched, and remote controllable',
      'Weatherproof builds for indoor or outdoor use',
      'Safe, certified installation with full support',
    ],
    subServices: [
      { icon: Lightbulb, title: 'LED Flex Signs', desc: 'Flexible, energy-saving LED neon that bends into any shape, word, or logo.' },
      { icon: Sparkles, title: 'Classic Neon', desc: 'Authentic hand-bent glass neon for that timeless, nostalgic glow.' },
      { icon: Monitor, title: 'LED Display Boards', desc: 'High-brightness LED message boards for menus, offers, and announcements.' },
      { icon: Palette, title: 'Brand-Colour Lighting', desc: 'Match your exact brand colours for a perfectly cohesive identity after dark.' },
    ],
    portfolio: PORTFOLIO.c,
  },
  'projecting-signs-lightboxes': {
    heroHeading: 'Full-Face Illumination, Maximum Visibility',
    heroIntro: 'Lightboxes and projecting signs that push your brand right out into the street — visible from up and down the road.',
    overview: [
      'Lightboxes deliver a wall of bright, even illumination that is impossible to ignore. Perfect for busy high streets, they keep your branding glowing at maximum brightness, from morning to midnight.',
      'Projecting signs, mounted at right angles to your façade, catch the eye of pedestrians walking along the pavement — guiding them straight to your door.',
    ],
    benefits: [
      'Bright, even full-face illumination',
      'Visible from up and down the street',
      'Durable, weather-sealed aluminium construction',
      'Energy-efficient LED light sources',
      'Designed, manufactured, and installed in-house',
    ],
    subServices: [
      { icon: Sun, title: 'Full-Face Lightboxes', desc: 'Illuminated lightboxes with a clean, bright, even glow across the whole face.' },
      { icon: Building2, title: 'Projecting Signs', desc: 'Side-mounted signs that extend from the wall and face approaching foot traffic.' },
      { icon: Umbrella, title: 'Canopy Lightboxes', desc: 'Branded lightboxes integrated into canopies and awnings for dual visibility.' },
      { icon: Cog, title: 'Maintenance & Relamping', desc: 'Fast repair, relamping, and cleaning to keep your lightbox shining bright.' },
    ],
    portfolio: PORTFOLIO.d,
  },
  'van-branding': {
    heroHeading: 'Turn Your Company Vehicles Into Powerful Moving Advertisements',
    heroIntro: 'Premium vinyl van branding that turns every journey into a powerful, paint-protecting advertisement for your business.',
    overview: [
      'A branded van is the most cost-effective advertising your business will ever buy. Every mile, every stop, and every car park turns your vehicles into a moving billboard seen by thousands of potential customers — working for you long after the working day ends.',
      'Our van wraps are printed on premium 3M and Hexis vinyl, finished by hand, and installed by trained fitters. They promote your brand with a flawless, head-turning finish while protecting your original paintwork underneath.',
    ],
    benefits: [
      'Turns your fleet into powerful moving advertisements',
      'Premium 3M and Hexis vinyl, printed in-house',
      'Protects original paintwork and boosts resale value',
      'Full, partial, or livery-only wraps to suit any budget',
      'Expert fitting with a flawless, bubble-free finish',
    ],
    subServices: [
      { icon: Truck, title: 'Full Van Wraps', desc: 'Complete branded wraps that transform your entire vehicle into a rolling billboard.' },
      { icon: PaintBucket, title: 'Colour Change', desc: 'Matt and gloss colour changes that give your vehicles a whole new look.' },
      { icon: Layout, title: 'Partial Wraps & Livery', desc: 'Cost-effective door branding, decals, and livery for any fleet size.' },
      { icon: ShieldCheck, title: 'Paint Protection Film', desc: 'Invisible protection for high-impact areas against stone chips and scratches.' },
    ],
    portfolio: PORTFOLIO.b,
  },
  'window-graphics': {
    heroHeading: 'Turn Every Window Into a Sales Pitch',
    heroIntro: 'Custom window decals, frosted films, and poster holders printed in-house — for maximum impact on minimum effort.',
    overview: [
      'Your windows are prime advertising space you are already paying for. We turn them into eye-catching displays with vibrant decals, elegant frosted branding, and seasonal posters that draw customers in.',
      'Perfect for retail windows, office fronts, and car showrooms, our window graphics are printed in-house, applied cleanly, and designed to remove without a trace when you rebrand.',
    ],
    benefits: [
      'Printed in-house for fast turnaround and best price',
      'Frosted, printed, or clear vinyl options',
      'Perfect for privacy and branding in one',
      'Simple removal with no sticky residue',
      'Seasonal posters and offers updated in minutes',
    ],
    subServices: [
      { icon: Layout, title: 'Window Decals', desc: 'Full-colour printed decals that turn passers-by into customers.' },
      { icon: Wind, title: 'Frosted Films', desc: 'Elegant, sandblasted-look films for privacy and professional branding.' },
      { icon: Gift, title: 'Poster & Offer Graphics', desc: 'Promotional posters, price boards, and seasonal offers printed instantly.' },
      { icon: Megaphone, title: 'Promo Window Wraps', desc: 'Bold, eye-catching wrap graphics for launches and sales campaigns.' },
    ],
    portfolio: PORTFOLIO.e,
  },
  'shop-awnings': {
    heroHeading: 'Premium Awnings That Work as Hard as You Do',
    heroIntro: 'Stylish branded awnings that protect your storefront from sun and rain while adding a premium finish to your business.',
    overview: [
      'An awning does double duty — it shields your entrance and windows from the elements, while printing your brand across the front of your shop in full colour. It is a classic, sophisticated look that is also deeply practical.',
      'We supply and install bespoke awnings in every size, style, and colour, with your branding printed to a crisp, fade-resistant finish.',
    ],
    benefits: [
      'Protects customers and interiors from sun and rain',
      'Printed, branded, and fully colour-matched',
      'Fold-away, fixed, or waterproof canopy options',
      'Built to withstand years of British weather',
      'Professional installation included',
    ],
    subServices: [
      { icon: Umbrella, title: 'Traditional Shop Awnings', desc: 'Classic folding awnings with crisp, branded printed fabric.' },
      { icon: Sun, title: 'Sun & Rain Canopies', desc: 'Robust canopies that shade windows and doors while staying durable.' },
      { icon: Wrench, title: 'Awning Repair & Refurb', desc: 'Replacement fabric, re-branding, and repair for existing awnings.' },
    ],
    portfolio: PORTFOLIO.c,
  },
  'banner-logo-printing': {
    heroHeading: 'High-Impact Printing, Delivered in Days',
    heroIntro: 'High-quality large-format banners and print — with free design included on every single order.',
    overview: [
      'Whether it is a site banner, a window poster, or a grand-opening display, our in-house large-format printers produce razor-sharp, colour-rich print on heavyweight materials that look great and last.',
      'Every order includes free design support — send us your logo and we will build your artwork, proof it, and deliver print-ready files before we press the button.',
    ],
    benefits: [
      'Large-format printing up to 5m wide',
      'Free design and artwork on every order',
      'Fade-resistant inks and heavyweight materials',
      'Eyelets, hemming, and hanging options available',
      'Fast turnaround, often the same week',
    ],
    subServices: [
      { icon: Printer, title: 'Banners', desc: 'Durable PVC banners with reinforced edges and eyelets, ready to hang.' },
      { icon: Megaphone, title: 'Posters & Display', desc: 'High-definition posters for windows, walls, and indoor displays.' },
      { icon: Package, title: 'Retractable Banners', desc: 'Stand-up banner displays that set up in seconds at events and in-store.' },
      { icon: Palette, title: 'Logo Design Support', desc: 'Free design help — we create and refine your artwork before printing.' },
    ],
    portfolio: PORTFOLIO.d,
  },
  'custom-workwear': {
    heroHeading: 'Dress Your Team, Promote Your Brand',
    heroIntro: 'Professionally printed or embroidered branded workwear across our full clothing range — from hi-vis to polo shirts.',
    overview: [
      'Your team is your brand on the move. Professional, branded workwear makes your staff instantly recognisable, builds customer trust, and keeps your business front of mind on every job.',
      'We supply and decorate a huge range of garments — polos, hoodies, hi-vis, jackets, and more — with crisp embroidery or full-colour print that survives the wash, the work, and the weather.',
    ],
    benefits: [
      'Huge range of garments for every role',
      'Embroidery or full-colour garment printing',
      'Bulk discounts for teams and fleets',
      'Fast turnaround on popular sizes',
      'Fade-resistant, wash-safe finishes',
    ],
    subServices: [
      { icon: Shirt, title: 'Polos & Shirts', desc: 'Classic branded polos for a professional, everyday team look.' },
      { icon: ShieldCheck, title: 'Hi-Vis & Safety Wear', desc: 'Compliant hi-vis vests, jackets, and trousers with your logo.' },
      { icon: Package, title: 'Jackets & Hoodies', desc: 'Warm, weather-ready outerwear embroidered with your branding.' },
      { icon: Gift, title: 'Caps & Accessories', desc: 'Caps, beanies, and accessories to complete the look.' },
    ],
    portfolio: PORTFOLIO.c,
  },
  'flyers-brochures': {
    heroHeading: 'Print That Gets Read, Kept, and Acted On',
    heroIntro: 'Professional flyers and brochures that tell your brand story and drive real customer interest.',
    overview: [
      'Great print still sells. From hand-delivered flyers to prestige brochures for the boardroom, we produce printed collateral that feels as good as it looks — sharp, vibrant, and on-brand.',
      'We handle design, print, and finishing in-house, so you get premium results at prices that make sense for your business.',
    ],
    benefits: [
      'Design, print, and finishing all in-house',
      'Premium papers, finishes, and stock options',
      'From single flyers to full brochure runs',
      'Fast turnaround with free proofing',
      'Consistent with your brand guidelines',
    ],
    subServices: [
      { icon: FileText, title: 'Flyers & Leaflets', desc: 'Eye-catching single-page flyers for campaigns and events.' },
      { icon: Layers, title: 'Brochures & Booklets', desc: 'Multi-page brochures that tell your full story, beautifully.' },
      { icon: Gift, title: 'Business Cards', desc: 'Premium cards that make the right first impression.' },
      { icon: Palette, title: 'Design & Branding', desc: 'Professional design support for any size of project.' },
    ],
    portfolio: PORTFOLIO.b,
  },
  'exhibition-stands-flags': {
    heroHeading: 'Own the Room at Every Event',
    heroIntro: 'Fully branded exhibition stands and feather flags tailored to your budget, your space, and your show.',
    overview: [
      'A standout exhibition space is the difference between being seen and being skipped. We design and build modular stands, printed graphics, and display systems that pull visitors to your booth and keep them talking.',
      'From feather flags at the entrance to full backlit stands inside, everything is printed in-house, so your branding is always crisp and consistent.',
    ],
    benefits: [
      'Modular stands for any space or budget',
      'Feather flags, pop-ups, and tablecloths',
      'Printed in-house for perfect colour matching',
      'Pack-flat, easy-transport designs',
      'Design support from concept to delivery',
    ],
    subServices: [
      { icon: Flag, title: 'Feather Flags', desc: 'Bold, wind-friendly flags that wave your brand at every event.' },
      { icon: Package, title: 'Pop-Up Stands', desc: 'Tool-free pop-up displays that set up in minutes.' },
      { icon: Building2, title: 'Modular Exhibition Stands', desc: 'Fully customisable stands designed for your space and message.' },
      { icon: Monitor, title: 'Event Backdrops', desc: 'Backlit graphics and backdrops that make your booth unmissable.' },
    ],
    portfolio: PORTFOLIO.c,
  },
  'menu-displays': {
    heroHeading: 'Showcase Every Dish the Way It Deserves',
    heroIntro: 'Custom-designed menu boards that highlight your offerings and elevate your venue\'s look.',
    overview: [
      'Menus are part of the dining experience. Well-designed menu boards make your food look irresistible, guide customers to your best sellers, and keep your space feeling fresh and premium.',
      'From illuminated lightbox menus to elegant chalk-style boards, we design and print menu systems that match your venue\'s atmosphere and make updating offers effortless.',
    ],
    benefits: [
      'Illuminated, wall, or counter menu boards',
      'Easy to update with magnetic or insert panels',
      'Designed to match your venue\'s style',
      'Durable, wipe-clean, food-safe finishes',
      'Fast turnaround before you relaunch',
    ],
    subServices: [
      { icon: Menu, title: 'Wall Menu Boards', desc: 'Eye-level boards that greet customers with your best offerings.' },
      { icon: Lightbulb, title: 'Illuminated Menus', desc: 'Backlit menu displays that look premium even in low light.' },
      { icon: ClipboardList, title: 'Counter & A-Frame Menus', desc: 'Portable displays for counters, windows, and walkways.' },
    ],
    portfolio: PORTFOLIO.e,
  },
  'safety-interior-signs': {
    heroHeading: 'Compliant, Clear, and Beautifully Branded',
    heroIntro: 'From safety signage to fully branded interior office signs — designed, printed, and installed by our team.',
    overview: [
      'Signage does more than advertise — it guides, protects, and reassures. We manufacture compliant safety signage, wayfinding systems, and premium interior signs that keep people safe and on-brand.',
      'Whether it is a full office rebrand with wayfinding and door signs, or a suite of mandatory safety notices, we deliver a cohesive, professional result.',
    ],
    benefits: [
      'Compliant safety and warning signage',
      'Bespoke wayfinding and door signs',
      'Frosted glass manifestations and branding',
      'Interior wall graphics and office rebrands',
      'Professional, safe, and tidy installation',
    ],
    subServices: [
      { icon: Shield, title: 'Safety & Warning Signs', desc: 'Compliant, durable safety signage for any workplace.' },
      { icon: Layout, title: 'Wayfinding Systems', desc: 'Clear, elegant directional signage for buildings and sites.' },
      { icon: Building2, title: 'Door & Office Signs', desc: 'Premium branded signs for doors, offices, and receptions.' },
      { icon: Wind, title: 'Frosted Glass Branding', desc: 'Printed frosted films for privacy and professional glass branding.' },
    ],
    portfolio: PORTFOLIO.f,
  },
  'food-truck-trailer-wraps': {
    heroHeading: 'Make Your Mobile Business Impossible to Miss',
    heroIntro: 'Bold food trailer wraps and signage that turn your mobile kitchen into a moving billboard.',
    overview: [
      'A food truck lives on visibility. The right wrap turns your trailer into a colourful, mouth-watering advertisement that stops queues before the food even comes out.',
      'We design, print, and install food-safe, heat-resistant graphics that take the heat of the kitchen and the road — keeping your brand looking fresh, event after event.',
    ],
    benefits: [
      'Heat and UV-resistant vinyl for cooking areas',
      'Full trailer, van, and cart wrapping',
      'Bold designs that stand out at festivals',
      'Front, rear, and counter-side branding',
      'Cleaning-safe, durable, and easy to maintain',
    ],
    subServices: [
      { icon: UtensilsCrossed, title: 'Full Trailer Wraps', desc: 'Complete, full-colour wraps that turn your trailer into a brand icon.' },
      { icon: Truck, title: 'Food Van Wrapping', desc: 'Branded wraps and signage for food vans and coffee carts.' },
      { icon: Menu, title: 'Counter & Serving Graphics', desc: 'Durable graphics for service windows, counters, and awnings.' },
      { icon: Sun, title: 'Festival-Ready Design', desc: 'Designs engineered to stand out on crowded festival grounds.' },
    ],
    portfolio: PORTFOLIO.c,
  },
  'heras-fence-banners': {
    heroHeading: 'Turn Your Build Site Into a Brand Billboard',
    heroIntro: 'Turn construction site hoardings into powerful brand advertising visible to thousands of people every day.',
    overview: [
      'Construction hoardings are seen by thousands of commuters and passers-by every day — yet most sites leave that prime advertising space blank. We turn your Heras fencing into a professional, full-colour brand statement.',
      'From single panels to full site hoarding wraps, we design, print, and install weatherproof banners that keep your site looking professional and your brand working around the clock.',
    ],
    benefits: [
      'Designed to fit standard Heras fence panels',
      'Weatherproof, heavy-duty banner material',
      'Full site hoarding wraps for bigger builds',
      'Free design with every order',
      'Quick, tool-free installation options',
    ],
    subServices: [
      { icon: Construction, title: 'Heras Fence Banners', desc: 'Bespoke banner panels sized to fit standard Heras fencing.' },
      { icon: Building2, title: 'Site Hoarding Wraps', desc: 'Full hoarding wraps that brand your entire construction site.' },
      { icon: Megaphone, title: 'Site Branding & Notices', desc: 'Safety notices, branding, and messaging combined on one panel.' },
      { icon: Wrench, title: 'Installation & Fixings', desc: 'Fast, tool-free installation with all fixings supplied.' },
    ],
    portfolio: PORTFOLIO.f,
  },
}

const DEFAULT_OVERVIEW = [
  'Our team designs, produces, and installs every project in-house, using premium materials and precision equipment. The result is signage, print, and wrapping that looks exceptional and stands the test of time.',
  'From your first enquiry to the final install, you get a single accountable partner who communicates clearly, hits deadlines, and delivers exactly what was approved — nothing less.',
]

const DEFAULT_BENEFITS = [
  'Free design support on every order',
  'Premium materials built to last',
  'In-house production for total quality control',
  'Fast turnaround with clear timelines',
  'Expert, insured installation',
]

export function getServiceContent(slug, service = {}) {
  const specific = SERVICE_CONTENT[slug]
  const title = service.title || (slug ? slug.replace(/-/g, ' ') : 'Service')
  const image = service.image || '/images/client-images/car2.jpg'
  const summary = service.short_description || service.description || ''

  if (specific) {
    return {
      title,
      image,
      heroHeading: specific.heroHeading,
      heroIntro: specific.heroIntro,
      overview: specific.overview,
      benefits: specific.benefits,
      subServices: specific.subServices,
      portfolio: specific.portfolio,
    }
  }

  const Icon = getServiceIcon(title)
  return {
    title,
    image,
    heroHeading: `Premium ${title} Tailored to Your Brand`,
    heroIntro: summary || `Discover how SD Signs Studio can deliver a professional, high-quality ${title} solution for your business.`,
    overview: summary ? [summary, DEFAULT_OVERVIEW[1]] : DEFAULT_OVERVIEW,
    benefits: DEFAULT_BENEFITS,
    subServices: [
      { icon: Icon, title: title, desc: summary || `Bespoke ${title.toLowerCase()} designed around your brand and goals.` },
      { icon: BadgeCheck, title: 'Free Design & Proof', desc: 'Every project includes a bespoke design and digital proof before production.' },
      { icon: Wrench, title: 'Expert Installation', desc: 'Our trained team installs everything to a flawless, professional finish.' },
    ],
    portfolio: [image, image, image],
  }
}

export const SERVICE_SLUGS = Object.keys(SERVICE_CONTENT)

export { slugify }
