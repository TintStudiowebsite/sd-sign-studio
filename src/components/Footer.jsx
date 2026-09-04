import { Link } from 'react-router-dom'
import { CONFIG } from '../data/config'

// Real brand glyphs for the footer social row (hardcoded here since there's
// no admin field for these — same spirit as the other hardcoded fallbacks).
const SOCIAL_ICON_PATHS = {
  facebook: 'M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z',
  instagram: 'M12 0c-3.259 0-3.667.014-4.947.072-1.277.06-2.148.261-2.913.558-.789.306-1.459.717-2.126 1.384s-1.079 1.335-1.384 2.126c-.297.765-.499 1.636-.558 2.913-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.789.718 1.459 1.384 2.126.667.667 1.336 1.079 2.126 1.384.766.297 1.636.499 2.913.558 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.06 2.148-.261 2.913-.558.789-.306 1.459-.717 2.126-1.384.667-.667 1.079-1.335 1.384-2.126.297-.766.499-1.636.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.261-2.148-.558-2.913-.306-.789-.718-1.459-1.384-2.126-.667-.667-1.336-1.079-2.126-1.384-.766-.297-1.636-.499-2.913-.558-1.28-.058-1.688-.072-4.947-.072zm0 2.161c3.204 0 3.584.012 4.849.07 1.171.053 1.807.249 2.229.413.56.218.96.478 1.38.898.42.42.68.82.898 1.38.164.422.36 1.058.413 2.229.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.053 1.171-.249 1.807-.413 2.229-.218.56-.478.96-.898 1.38-.42.42-.82.68-1.38.898-.422.164-1.058.36-2.229.413-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.171-.053-1.807-.249-2.229-.413-.56-.218-.96-.478-1.38-.898-.42-.42-.68-.82-.898-1.38-.164-.422-.36-1.058-.413-2.229-.058-1.265-.07-1.645-.07-4.849s.012-3.584.07-4.849c.053-1.171.249-1.807.413-2.229.218-.56.478-.96.898-1.38.42-.42.82-.68 1.38-.898.422-.164 1.058-.36 2.229-.413 1.265-.058 1.645-.07 4.849-.07zm0 3.678c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-10.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  tiktok: 'M16.6 0h3.9c.23 1.53.9 2.96 1.93 4.1 1.13 1.17 2.7 1.87 4.38 2.05v3.94c-1.65-.02-3.29-.36-4.79-1.04-.66-.3-1.28-.68-1.87-1.1v8.28c0 4.16-3.38 7.54-7.54 7.54-1.62 0-3.2-.52-4.5-1.48-2.02-1.49-3.24-3.89-3.24-6.44 0-4.16 3.38-7.54 7.54-7.54.4 0 .78.03 1.16.09v4.03a3.6 3.6 0 0 0-1.16-.19 3.61 3.61 0 1 0 3.61 3.61V0h.58z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
}

function SocialIcon({ name }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d={SOCIAL_ICON_PATHS[name]} />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ background: '#fff', display: 'inline-block', borderRadius: '50%', padding: '4px', marginBottom: '16px' }}>
            <img 
              src="/images/logo.png" 
              alt="SD Sign Studio" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} 
            />
          </div>
          <div className="footer-logo-text">SD <span className="red">SIGNS</span></div>
          <p>Your one-stop solution for signage, vehicle branding, and printing. We turn ideas into powerful visual identities.</p>
          <div className="footer-socials">
            <a className="soc-btn" href={CONFIG.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <SocialIcon name="facebook" />
            </a>
            <a className="soc-btn" href={CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <SocialIcon name="instagram" />
            </a>
            <a className="soc-btn" href={CONFIG.socials.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <SocialIcon name="tiktok" />
            </a>
            <a className="soc-btn" href={CONFIG.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <SocialIcon name="youtube" />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h5>Quick Links</h5>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/#services">Services</Link></li>
            <li><Link to="/shop">Products</Link></li>
            <li><Link to="/#portfolio">Portfolio</Link></li>
            <li><Link to="/#about">About Us</Link></li>
            <li><Link to="/#contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Our Services</h5>
          <ul>
            <li><a href="#">Vehicle branding</a></li>
            <li><a href="#">Commercial Signage</a></li>
            <li><a href="#">Window Graphics</a></li>
            <li><a href="#">Business Printing</a></li>
            <li><a href="#">Fleet Branding</a></li>
            <li><a href="#">Design Services</a></li>
          </ul>
        </div>

        <div className="footer-col" id="contact-footer">
          <h5>Contact Us</h5>
          <div className="contact-item">
            <span className="icon">📞</span>
            <span>{CONFIG.phone}</span>
          </div>
          <div className="contact-item">
            <span className="icon">✉️</span>
            <span>{CONFIG.email}</span>
          </div>
          <div className="contact-item">
            <span className="icon">📍</span>
            <span>{CONFIG.address}</span>
          </div>
          <div className="contact-item">
            <span className="icon">🕐</span>
            <span>{CONFIG.openingHours}</span>
          </div>
          <div className="map-wrap">
            <iframe
              src={CONFIG.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 SD Sign Studio. All Rights Reserved.
      </div>
    </footer>
  )
}
