import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { Routes, Route, Link, useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import './App.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Dress {
  id: number
  name: string
  designer: string
  retailPrice: number
  rentalPrice: number
  size: string[]
  color: string
  image: string
  imageFlat: string
  imageAlt: string
  category: string
  description: string
}

interface CartItem {
  dress: Dress
  size: string
  startDate: string
  endDate: string
  days: number
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'info'
}

// ─── Data ────────────────────────────────────────────────────────────────────

const dresses: Dress[] = [
  {
    id: 1,
    name: 'The Midnight Satin Slip',
    designer: 'Valentina Roma',
    retailPrice: 1200,
    rentalPrice: 89,
    size: ['XS', 'S', 'M', 'L'],
    color: 'Midnight',
    image: '/dresses/dress-1.jpg',
    imageFlat: '/dresses/dress-1-flat.jpg',
    imageAlt: 'Woman in a midnight blue satin slip dress with cowl neckline',
    category: 'Evening',
    description: 'A floor-length satin slip dress with a cowl neckline and delicate chain-link back detail. The midnight blue fabric catches light beautifully, creating subtle dimension as you move.',
  },
  {
    id: 2,
    name: 'Ros\u00e9 Garden Midi',
    designer: 'Elara Atelier',
    retailPrice: 890,
    rentalPrice: 65,
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Dusty Rose',
    image: '/dresses/dress-2.jpg',
    imageFlat: '/dresses/dress-2-flat.jpg',
    imageAlt: 'Woman in a dusty rose tiered chiffon midi dress',
    category: 'Cocktail',
    description: 'A romantic midi dress in flowing chiffon layers. Features a square neckline with subtle ruching at the waist and a cascading asymmetric hem.',
  },
  {
    id: 3,
    name: 'Ivory Column Gown',
    designer: 'Maison Blanche',
    retailPrice: 2400,
    rentalPrice: 145,
    size: ['S', 'M', 'L'],
    color: 'Ivory',
    image: '/dresses/dress-3.jpg',
    imageFlat: '/dresses/dress-3-flat.jpg',
    imageAlt: 'Woman in a structured ivory column gown with V-back',
    category: 'Gala',
    description: 'Architectural elegance meets modern romance. This column gown features structured shoulders with a plunging V-back, crafted from Italian double-faced crepe.',
  },
  {
    id: 4,
    name: 'Emerald Wrap Dress',
    designer: 'Vert Studio',
    retailPrice: 680,
    rentalPrice: 52,
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Emerald',
    image: '/dresses/dress-4.jpg',
    imageFlat: '/dresses/dress-4-flat.jpg',
    imageAlt: 'Woman in an emerald green silk wrap dress with flutter sleeves',
    category: 'Cocktail',
    description: 'A versatile wrap dress in rich emerald silk. The adjustable wrap closure flatters every figure while the flutter sleeves add movement and grace.',
  },
  {
    id: 5,
    name: 'Champagne Sequin Mini',
    designer: 'LUX Collective',
    retailPrice: 1100,
    rentalPrice: 78,
    size: ['XS', 'S', 'M'],
    color: 'Champagne',
    image: '/dresses/dress-5.jpg',
    imageFlat: '/dresses/dress-5-flat.jpg',
    imageAlt: 'Woman in a champagne gold sequin mini dress',
    category: 'Party',
    description: 'All-over hand-sewn sequins catch every light in the room. This mini dress features a structured bodice and a playful flared skirt hem.',
  },
  {
    id: 6,
    name: 'Noir Velvet Blazer Dress',
    designer: 'Valentina Roma',
    retailPrice: 950,
    rentalPrice: 72,
    size: ['S', 'M', 'L', 'XL'],
    color: 'Black',
    image: '/dresses/dress-6.jpg',
    imageFlat: '/dresses/dress-6-flat.jpg',
    imageAlt: 'Woman in a black velvet tuxedo-inspired blazer dress',
    category: 'Evening',
    description: 'Power dressing redefined. A tuxedo-inspired blazer dress in plush velvet with satin lapels, a cinched waist, and a daring mini length.',
  },
  {
    id: 7,
    name: 'Lavender Dream Tulle',
    designer: 'Elara Atelier',
    retailPrice: 1650,
    rentalPrice: 110,
    size: ['XS', 'S', 'M'],
    color: 'Lavender',
    image: '/dresses/dress-7.jpg',
    imageFlat: '/dresses/dress-7-flat.jpg',
    imageAlt: 'Woman in a lavender tulle ball gown with beaded bodice',
    category: 'Gala',
    description: 'Layers of ethereal tulle create a romantic, cloud-like effect. The fitted bodice features intricate beadwork that transitions into a full, voluminous skirt.',
  },
  {
    id: 8,
    name: 'Terracotta Linen Shirt Dress',
    designer: 'Vert Studio',
    retailPrice: 520,
    rentalPrice: 42,
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Terracotta',
    image: '/dresses/dress-8.jpg',
    imageFlat: '/dresses/dress-8-flat.jpg',
    imageAlt: 'Woman in a terracotta linen shirt dress with belt',
    category: 'Day',
    description: 'Effortless Italian linen in a warm terracotta hue. Relaxed fit with a self-tie belt, mother-of-pearl buttons, and a midi-length hem.',
  },
  {
    id: 9,
    name: 'Burgundy Draped Gown',
    designer: 'Maison Blanche',
    retailPrice: 1850,
    rentalPrice: 125,
    size: ['XS', 'S', 'M', 'L'],
    color: 'Burgundy',
    image: '/dresses/dress-9.jpg',
    imageFlat: '/dresses/dress-9-flat.jpg',
    imageAlt: 'Woman in a deep burgundy one-shoulder draped gown',
    category: 'Evening',
    description: 'A Grecian-inspired one-shoulder gown in deep burgundy. Asymmetric pleating drapes the body with sculptural elegance, pooling into a subtle floor-sweeping train.',
  },
  {
    id: 10,
    name: 'Pearl Beaded Cocktail',
    designer: 'LUX Collective',
    retailPrice: 1400,
    rentalPrice: 95,
    size: ['XS', 'S', 'M', 'L'],
    color: 'Pearl White',
    image: '/dresses/dress-10.jpg',
    imageFlat: '/dresses/dress-10-flat.jpg',
    imageAlt: 'Woman in a pearl white beaded cocktail dress with art deco pattern',
    category: 'Party',
    description: 'Art deco meets modern glamour. This knee-length cocktail dress features geometric beading in lustrous pearl white, with a flattering silhouette that moves from gallery to dance floor.',
  },
]

const categories = ['All', 'Evening', 'Cocktail', 'Gala', 'Party', 'Day']

const sizeChart = [
  { size: 'XS', bust: '31-32"', waist: '24-25"', hips: '34-35"', us: '0-2' },
  { size: 'S', bust: '33-34"', waist: '26-27"', hips: '36-37"', us: '4-6' },
  { size: 'M', bust: '35-36"', waist: '28-29"', hips: '38-39"', us: '8-10' },
  { size: 'L', bust: '37-39"', waist: '30-32"', hips: '40-42"', us: '12-14' },
  { size: 'XL', bust: '40-42"', waist: '33-35"', hips: '43-45"', us: '16-18' },
]

const featuredIds = [1, 3, 5, 9]

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (index: number) => void
  updateItemSize: (index: number, size: string) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateItemSize: () => {},
  clearCart: () => {},
  total: 0,
})

interface FavoritesContextType {
  favorites: Set<number>
  toggle: (id: number) => void
  isFavorite: (id: number) => boolean
  count: number
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: new Set(),
  toggle: () => {},
  isFavorite: () => false,
  count: 0,
})

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'info') => void
}

const ToastContext = createContext<ToastContextType>({
  addToast: () => {},
})

function useLocalStorageSet(key: string): [Set<number>, (s: Set<number>) => void] {
  const [value, setValue] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  const setAndPersist = useCallback((newSet: Set<number>) => {
    setValue(newSet)
    localStorage.setItem(key, JSON.stringify([...newSet]))
  }, [key])

  return [value, setAndPersist]
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.7 6.3a.75.75 0 00-1.06-1.06L9 10.88 7.36 9.24a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.09-4.25z" />
    </svg>
  )
}

// ─── Toast System ────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          <span className="toast__message">{toast.message}</span>
          <button className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Shared Components ───────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const cart = useContext(CartContext)
  const favs = useContext(FavoritesContext)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <button className="navbar__hamburger" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <Link to="/" className="navbar__logo">RTR</Link>
          <div className="navbar__links">
            <Link to="/collection" className={isActive('/collection') ? 'navbar__link--active' : ''}>Collection</Link>
            <Link to="/try-on" className={location.pathname.startsWith('/try-on') ? 'navbar__link--active' : ''}>AI Try On</Link>
            <Link to="/how-it-works" className={isActive('/how-it-works') ? 'navbar__link--active' : ''}>How It Works</Link>
          </div>
          <div className="navbar__actions">
            <button
              className={`navbar__icon-btn ${favs.count > 0 ? 'navbar__icon-btn--active' : ''}`}
              onClick={() => navigate('/collection?favorites=true')}
              aria-label="Favorites"
            >
              <HeartIcon filled={favs.count > 0} />
              {favs.count > 0 && <span className="navbar__badge">{favs.count}</span>}
            </button>
            <Link to="/cart" className="navbar__icon-btn" aria-label="Cart">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
              {cart.items.length > 0 && <span className="navbar__badge">{cart.items.length}</span>}
            </Link>
            <Link to="/early-access" className="navbar__cta">Get Early Access</Link>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <button className="mobile-menu__close" onClick={() => setMobileOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
            <div className="mobile-menu__brand">RTR</div>
            <div className="mobile-menu__links">
              <Link to="/">Home</Link>
              <Link to="/collection">Collection</Link>
              <Link to="/try-on">AI Try On</Link>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/collection?favorites=true">
                Favorites {favs.count > 0 && `(${favs.count})`}
              </Link>
              <Link to="/cart">
                Bag {cart.items.length > 0 && `(${cart.items.length})`}
              </Link>
              <Link to="/early-access">Get Early Access</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">RTR</Link>
          <p className="footer__tagline">Wear the dress. Not the price tag.</p>
        </div>
        <div className="footer__links">
          <div className="footer__col">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#careers">Careers</a>
            <a href="#press">Press</a>
          </div>
          <div className="footer__col">
            <h4>Support</h4>
            <a href="#faq">FAQ</a>
            <a href="#sizing">Size Guide</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer__col">
            <h4>Legal</h4>
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
            <a href="#returns">Return Policy</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; 2026 Rent the Runway. All rights reserved.</p>
      </div>
    </footer>
  )
}

function DressCard({ dress }: { dress: Dress }) {
  const favs = useContext(FavoritesContext)
  const toast = useContext(ToastContext)

  return (
    <div className="dress-card">
      <Link to={`/dress/${dress.id}`} className="dress-card__image">
        <img src={dress.image} alt={dress.imageAlt} loading="lazy" />
        <div className="dress-card__overlay">
          <span>View Details</span>
        </div>
      </Link>
      <button
        className={`dress-card__fav ${favs.isFavorite(dress.id) ? 'dress-card__fav--active' : ''}`}
        onClick={() => {
          favs.toggle(dress.id)
          toast.addToast(
            favs.isFavorite(dress.id) ? 'Removed from favorites' : 'Added to favorites',
            'info'
          )
        }}
        aria-label={favs.isFavorite(dress.id) ? 'Remove from favorites' : 'Add to favorites'}
      >
        <HeartIcon filled={favs.isFavorite(dress.id)} />
      </button>
      <div className="dress-card__info">
        <p className="dress-card__designer">{dress.designer}</p>
        <h3 className="dress-card__name">{dress.name}</h3>
        <div className="dress-card__pricing">
          <span className="dress-card__rental">${dress.rentalPrice} rental</span>
          <span className="dress-card__retail">Retail ${dress.retailPrice}</span>
        </div>
      </div>
    </div>
  )
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="search-bar">
      <svg className="search-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder="Search by name, designer, or color..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="search-bar__input"
      />
      {value && (
        <button className="search-bar__clear" onClick={() => onChange('')} aria-label="Clear search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}

function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="breadcrumbs__item">
          {i > 0 && <span className="breadcrumbs__sep">/</span>}
          {item.to ? (
            <Link to={item.to} className="breadcrumbs__link">{item.label}</Link>
          ) : (
            <span className="breadcrumbs__current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

// ─── Landing Page Sections ───────────────────────────────────────────────────

function Hero() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="hero">
      <div className="hero__bg-pattern" />
      <div className={`hero__content ${loaded ? 'hero__content--visible' : ''}`}>
        <p className="hero__eyebrow">Designer Dress Rental</p>
        <h1 className="hero__title">
          Wear the dress.<br />
          <em>Not the price tag.</em>
        </h1>
        <p className="hero__subtitle">
          Rent designer dresses from $42/occasion. Free shipping, free dry cleaning,
          zero commitment. Your closet just got an upgrade.
        </p>
        <div className="hero__actions">
          <Link to="/collection" className="btn btn--primary">
            Browse Collection
          </Link>
          <a href="#how-it-works" className="btn btn--outline">
            How It Works
          </a>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-number">200+</span>
            <span className="hero__stat-label">Designer Pieces</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-number">85%</span>
            <span className="hero__stat-label">Return Rate</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-number">$42</span>
            <span className="hero__stat-label">Starting Price</span>
          </div>
        </div>
      </div>
      <div className={`hero__visual ${loaded ? 'hero__visual--visible' : ''}`}>
        <div className="hero__dress-showcase">
          <div className="hero__dress-card hero__dress-card--1">
            <img src={dresses[2].image} alt={dresses[2].imageAlt} loading="eager" />
          </div>
          <div className="hero__dress-card hero__dress-card--2">
            <img src={dresses[0].image} alt={dresses[0].imageAlt} loading="eager" />
          </div>
          <div className="hero__dress-card hero__dress-card--3">
            <img src={dresses[1].image} alt={dresses[1].imageAlt} loading="eager" />
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const section = useInView(0.1)

  const steps = [
    {
      number: '01',
      title: 'Browse & Choose',
      desc: 'Explore our curated collection of designer dresses. Filter by occasion, size, or designer.',
    },
    {
      number: '02',
      title: 'Rent & Receive',
      desc: 'Select your dates, confirm your rental. We ship your dress in a signature garment bag \u2014 free.',
    },
    {
      number: '03',
      title: 'Wear & Shine',
      desc: 'Make your entrance. Every dress is professionally cleaned and inspected before delivery.',
    },
    {
      number: '04',
      title: 'Return & Repeat',
      desc: 'Drop it in the prepaid return envelope. We handle the dry cleaning. Already eyeing the next one?',
    },
  ]

  return (
    <section id="how-it-works" className={`how-it-works ${section.isVisible ? 'how-it-works--visible' : ''}`} ref={section.ref}>
      <div className="how-it-works__inner">
        <div className="how-it-works__header">
          <p className="section-eyebrow">The Process</p>
          <h2 className="section-title">Effortlessly simple</h2>
          <p className="section-subtitle">
            From browsing to returning &mdash; we've made every step seamless so you can focus on the moment.
          </p>
        </div>
        <div className="how-it-works__timeline">
          {steps.map((step, i) => (
            <div key={step.number} className="how-it-works__step" style={{ animationDelay: `${i * 0.18}s` }}>
              <div className="how-it-works__step-marker">
                <span className="how-it-works__step-number">{step.number}</span>
                <div className="how-it-works__step-dot" />
              </div>
              <div className="how-it-works__step-content">
                <h3 className="how-it-works__step-title">{step.title}</h3>
                <p className="how-it-works__step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
          <div className="how-it-works__line" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

function FeaturedPicks() {
  const section = useInView(0.1)
  const featured = dresses.filter(d => featuredIds.includes(d.id))

  return (
    <section className={`featured ${section.isVisible ? 'featured--visible' : ''}`} ref={section.ref}>
      <div className="featured__header">
        <p className="section-eyebrow">Editor's Picks</p>
        <h2 className="section-title">This season's standouts</h2>
        <p className="section-subtitle">Hand-picked by our stylists for the events that matter.</p>
      </div>
      <div className="featured__grid">
        {featured.map((dress, i) => (
          <div key={dress.id} className="featured__item" style={{ animationDelay: `${i * 0.1}s` }}>
            <DressCard dress={dress} />
          </div>
        ))}
      </div>
      <div className="featured__cta">
        <Link to="/collection" className="btn btn--primary">View Full Collection</Link>
      </div>
    </section>
  )
}

function Testimonials() {
  const section = useInView(0.1)
  const testimonials = [
    {
      quote: "I wore a $2,400 gown to my sister's wedding for $145. The compliments were endless \u2014 nobody knew it was a rental.",
      name: 'Sarah M.',
      occasion: 'Wedding Guest',
    },
    {
      quote: "As someone who attends 10+ galas a year, Rent the Runway has saved me thousands. The quality and selection are incredible.",
      name: 'Priya K.',
      occasion: 'Charity Gala',
    },
    {
      quote: "The return process is unbelievably easy. Prepaid envelope, drop at USPS, done. I'm obsessed.",
      name: 'Camille R.',
      occasion: 'Cocktail Party',
    },
  ]

  return (
    <section className={`testimonials ${section.isVisible ? 'testimonials--visible' : ''}`} ref={section.ref}>
      <div className="testimonials__inner">
        <div className="testimonials__header">
          <p className="section-eyebrow">What They Say</p>
          <h2 className="section-title">Real moments, rented dresses</h2>
        </div>
        <div className="testimonials__grid">
          {testimonials.map((t, i) => (
            <blockquote key={i} className="testimonial" style={{ animationDelay: `${i * 0.15}s` }}>
              <span className="testimonial__mark" aria-hidden="true">&ldquo;</span>
              <p className="testimonial__quote">{t.quote}</p>
              <footer className="testimonial__footer">
                <cite className="testimonial__name">{t.name}</cite>
                <span className="testimonial__occasion">{t.occasion}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

function SignupSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const section = useInView(0.1)

  return (
    <section id="signup" className={`signup ${section.isVisible ? 'signup--visible' : ''}`} ref={section.ref}>
      <div className="signup__inner">
        <div className="signup__content">
          <p className="section-eyebrow section-eyebrow--light">Join the Waitlist</p>
          <h2 className="signup__title">Be first in line</h2>
          <p className="signup__subtitle">
            We're launching with a limited collection. Sign up for early access, exclusive pricing, and first pick of new arrivals.
          </p>
          {submitted ? (
            <div className="signup__success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                <path d="M5 12l5 5L19 7" />
              </svg>
              <p>You're on the list! We'll be in touch soon.</p>
            </div>
          ) : (
            <form
              className="signup__form"
              onSubmit={e => {
                e.preventDefault()
                if (email) setSubmitted(true)
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="signup__input"
              />
              <button type="submit" className="btn btn--light">
                Get Early Access
              </button>
            </form>
          )}
        </div>
        <div className="signup__decoration">
          <div className="signup__circle signup__circle--1" />
          <div className="signup__circle signup__circle--2" />
          <div className="signup__circle signup__circle--3" />
        </div>
      </div>
    </section>
  )
}

// ─── Pages ───────────────────────────────────────────────────────────────────

function HowItWorksPage() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  const steps = [
    {
      number: '01',
      title: 'Browse & Choose',
      desc: 'Explore our curated collection of designer dresses. Filter by occasion, size, or designer to find the perfect piece for your event.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="32" height="32">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Rent & Receive',
      desc: 'Select your dates and confirm your rental. We ship your dress in a signature garment bag with free two-day delivery, right to your door.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="32" height="32">
          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 00-8 0v2" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Wear & Shine',
      desc: 'Make your entrance. Every dress is professionally cleaned and inspected before delivery so you can step out with total confidence.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="32" height="32">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      number: '04',
      title: 'Return & Repeat',
      desc: 'Drop it in the prepaid return envelope. We handle the dry cleaning. Already eyeing the next one? Your closet is limitless.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="32" height="32">
          <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
      ),
    },
  ]

  const perks = [
    {
      label: 'Free Shipping',
      value: 'Two-day delivery and prepaid returns, both ways, every time. No hidden fees.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" width="28" height="28">
          <rect x="1" y="3" width="15" height="13" rx="1" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      label: 'Dry Cleaning',
      value: 'Professional cleaning after every rental is on us. Just drop it in the return bag.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" width="28" height="28">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M8 12l2.5 2.5L16 9" />
        </svg>
      ),
    },
    {
      label: 'Damage Insurance',
      value: 'Minor wear and tear is covered. Spill something? We handle it — no stress, no charges.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" width="28" height="28">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: 'Flexible Dates',
      value: 'Rent for 4 days or 2 weeks. Extend anytime with a tap — life happens, we get it.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" width="28" height="28">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ]

  return (
    <div className={`how-it-works-page ${loaded ? 'how-it-works-page--visible' : ''}`}>
      <div className="how-it-works-page__hero">
        <div className="how-it-works-page__hero-inner">
          <Breadcrumbs items={[
            { label: 'Home', to: '/' },
            { label: 'How It Works' },
          ]} />
          <p className="section-eyebrow">The Process</p>
          <h1 className="how-it-works-page__title">Four steps to your<br /><em>perfect dress</em></h1>
          <p className="how-it-works-page__subtitle">
            From browsing to returning &mdash; we've made every step seamless so you can focus on the moment that matters.
          </p>
        </div>
      </div>

      <div className="how-it-works-page__steps">
        {steps.map((step, i) => (
          <div key={step.number} className="hiw-band" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="hiw-band__inner">
              <span className="hiw-band__watermark" aria-hidden="true">{step.number}</span>
              <div className="hiw-band__left">
                <div className="hiw-band__icon">{step.icon}</div>
                <h3 className="hiw-band__title">{step.title}</h3>
              </div>
              <div className="hiw-band__right">
                <p className="hiw-band__desc">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="how-it-works-page__perks">
        <div className="how-it-works-page__perks-inner">
          <div className="perks-header">
            <p className="section-eyebrow">What's Included</p>
            <h2 className="perks-header__title">Everything you need,<br /><em>nothing you don't</em></h2>
          </div>
          <div className="how-it-works-page__perks-grid">
            {perks.map((perk, i) => (
              <div key={i} className="perk-item">
                <div className="perk-item__icon">{perk.icon}</div>
                <h3 className="perk-item__label">{perk.label}</h3>
                <p className="perk-item__value">{perk.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="how-it-works-page__cta-section">
        <div className="how-it-works-page__cta-inner">
          <h2 className="how-it-works-page__cta-title">Ready to find your dress?</h2>
          <p className="how-it-works-page__cta-desc">Browse our curated collection of 200+ designer pieces, starting at $42.</p>
          <div className="how-it-works-page__cta-actions">
            <Link to="/collection" className="btn btn--primary">Browse the Collection</Link>
            <Link to="/early-access" className="btn btn--outline">Get Early Access</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function EarlyAccessPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  const benefits = [
    { title: 'First Pick', desc: 'Access new arrivals before anyone else' },
    { title: 'Exclusive Pricing', desc: 'Founding member rates locked in' },
    { title: 'Priority Support', desc: 'Dedicated styling assistance' },
  ]

  return (
    <div className={`early-access-page ${loaded ? 'early-access-page--visible' : ''}`}>
      <div className="early-access-page__main">
        <div className="early-access-page__inner">
          <Breadcrumbs items={[
            { label: 'Home', to: '/' },
            { label: 'Get Early Access' },
          ]} />

          <div className="early-access-page__content">
            <p className="section-eyebrow">Join the Waitlist</p>
            <h1 className="early-access-page__title">Be first<br /><em>in line</em></h1>
            <p className="early-access-page__subtitle">
              We're launching with a limited collection of 200+ designer pieces. Sign up for early access, exclusive founding-member pricing, and first pick of every new arrival.
            </p>

            {submitted ? (
              <div className="early-access-page__success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                  <path d="M5 12l5 5L19 7" />
                </svg>
                <h3>You're on the list!</h3>
                <p>We'll be in touch soon with your exclusive access details.</p>
                <Link to="/collection" className="btn btn--primary" style={{ marginTop: '1.5rem' }}>Preview the Collection</Link>
              </div>
            ) : (
              <form
                className="early-access-page__form"
                onSubmit={e => {
                  e.preventDefault()
                  if (email) setSubmitted(true)
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="early-access-page__input"
                />
                <button type="submit" className="btn btn--primary">
                  Get Early Access
                </button>
              </form>
            )}

            <div className="early-access-page__benefits">
              {benefits.map((b, i) => (
                <div key={i} className="ea-benefit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                    <path d="M5 12l5 5L19 7" />
                  </svg>
                  <div>
                    <span className="ea-benefit__title">{b.title}</span>
                    <span className="ea-benefit__desc">{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="early-access-page__decoration">
          <div className="early-access-page__circle early-access-page__circle--1" />
          <div className="early-access-page__circle early-access-page__circle--2" />
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedPicks />
      <Testimonials />
      <SignupSection />
    </>
  )
}

function CollectionPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams] = useSearchParams()
  const showFavorites = searchParams.get('favorites') === 'true'
  const section = useInView(0.05)
  const favs = useContext(FavoritesContext)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  let filtered = showFavorites
    ? dresses.filter(d => favs.isFavorite(d.id))
    : dresses

  if (activeCategory !== 'All' && !showFavorites) {
    filtered = filtered.filter(d => d.category === activeCategory)
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.designer.toLowerCase().includes(q) ||
      d.color.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    )
  }

  return (
    <div className="page-container">
      <Breadcrumbs items={[
        { label: 'Home', to: '/' },
        { label: showFavorites ? 'Favorites' : 'Collection' },
      ]} />
      <section className={`collection ${section.isVisible ? 'collection--visible' : ''}`} ref={section.ref}>
        <div className="collection__header">
          <p className="section-eyebrow">{showFavorites ? 'Your Favorites' : 'The Collection'}</p>
          <h2 className="section-title">{showFavorites ? 'Saved pieces' : 'Curated for every occasion'}</h2>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        {!showFavorites && (
          <div className="collection__filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`collection__filter ${activeCategory === cat ? 'collection__filter--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="collection__empty">
            {showFavorites ? (
              <>
                <HeartIcon filled={false} />
                <p>No favorites yet. Browse the collection and tap the heart to save pieces you love.</p>
              </>
            ) : (
              <p>No dresses match your search. Try a different term.</p>
            )}
          </div>
        ) : (
          <div className="collection__grid">
            {filtered.map((dress, i) => (
              <div key={dress.id} style={{ animationDelay: `${i * 0.08}s` }} className="collection__item">
                <DressCard dress={dress} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ProductPage() {
  const { id } = useParams()
  const cart = useContext(CartContext)
  const favs = useContext(FavoritesContext)
  const toast = useContext(ToastContext)

  const dress = dresses.find(d => d.id === Number(id))

  const [selectedSize, setSelectedSize] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rentalPreset, setRentalPreset] = useState<string>('event')
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
    setActiveImage(0)
  }, [id])

  if (!dress) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <h2 className="section-title">Dress not found</h2>
        <p style={{ color: '#7a6e66', marginBottom: '2rem' }}>This dress may have been removed from our collection.</p>
        <Link to="/collection" className="btn btn--primary">Browse Collection</Link>
      </div>
    )
  }

  const presets = [
    { key: 'weekend', label: 'Weekend', days: 3 },
    { key: 'event', label: 'Event', days: 4 },
    { key: 'week', label: 'Week', days: 7 },
    { key: 'custom', label: 'Custom', days: 0 },
  ]

  const presetDays = presets.find(p => p.key === rentalPreset)?.days || 4

  const rentalDays = rentalPreset === 'custom' && startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : presetDays

  const totalPrice = rentalDays <= 4
    ? dress.rentalPrice
    : dress.rentalPrice + Math.ceil((rentalDays - 4) * dress.rentalPrice * 0.15)

  const minDate = new Date().toISOString().split('T')[0]

  const handleAdd = () => {
    if (!selectedSize) return
    const sd = startDate || minDate
    const ed = endDate || new Date(Date.now() + rentalDays * 86400000).toISOString().split('T')[0]
    cart.addItem({ dress, size: selectedSize, startDate: sd, endDate: ed, days: rentalDays })
    toast.addToast('Added to bag!', 'success')
  }

  const related = dresses.filter(d => d.id !== dress.id && (d.category === dress.category || d.designer === dress.designer)).slice(0, 4)

  return (
    <div className="page-container">
      <Breadcrumbs items={[
        { label: 'Home', to: '/' },
        { label: 'Collection', to: '/collection' },
        { label: dress.name },
      ]} />

      <div className="product">
        <div className="product__gallery">
          <div className="product__image">
            <img
              src={activeImage === 0 ? dress.image : dress.imageFlat}
              alt={activeImage === 0 ? dress.imageAlt : `${dress.name} flat lay`}
              key={activeImage}
            />
            <div className="product__badge">{dress.category}</div>
            <button
              className={`product__fav ${favs.isFavorite(dress.id) ? 'product__fav--active' : ''}`}
              onClick={() => {
                favs.toggle(dress.id)
                toast.addToast(
                  favs.isFavorite(dress.id) ? 'Removed from favorites' : 'Added to favorites',
                  'info'
                )
              }}
            >
              <HeartIcon filled={favs.isFavorite(dress.id)} />
            </button>
            <div className="product__thumbs">
              <button
                className={`product__thumb ${activeImage === 0 ? 'product__thumb--active' : ''}`}
                onClick={() => setActiveImage(0)}
              >
                <img src={dress.image} alt={dress.imageAlt} />
              </button>
              <button
                className={`product__thumb ${activeImage === 1 ? 'product__thumb--active' : ''}`}
                onClick={() => setActiveImage(1)}
              >
                <img src={dress.imageFlat} alt={`${dress.name} flat lay`} />
              </button>
            </div>
          </div>
        </div>

        <div className="product__details">
          <p className="product__designer">{dress.designer}</p>
          <h1 className="product__name">{dress.name}</h1>
          <p className="product__color">{dress.color}</p>
          <p className="product__desc">{dress.description}</p>

          <div className="product__pricing">
            <div className="product__price-main">
              <span className="product__rental-price">${totalPrice}</span>
              <span className="product__rental-label">/ {rentalDays}-day rental</span>
            </div>
            <div className="product__pricing-row">
              <p className="product__retail-note">Retail value: ${dress.retailPrice} — you save ${dress.retailPrice - totalPrice}</p>
              <Link to={`/try-on/${dress.id}`} className="product__try-on-link">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2a4 4 0 014 4v1H8V6a4 4 0 014-4zM4 9h16l-1.5 11a2 2 0 01-2 1.5h-9A2 2 0 015.5 20L4 9z" />
                </svg>
                AI Try On
              </Link>
            </div>
          </div>

          <div className="product__rental-period">
            <p className="product__field-label">Rental Period</p>
            <div className="product__presets">
              {presets.map(p => (
                <button
                  key={p.key}
                  className={`product__preset ${rentalPreset === p.key ? 'product__preset--active' : ''}`}
                  onClick={() => setRentalPreset(p.key)}
                >
                  {p.label}{p.days > 0 && ` (${p.days} days)`}
                </button>
              ))}
            </div>
            {rentalPreset === 'custom' && (
              <div className="product__date-inputs">
                <div className="product__date-field">
                  <label>Start</label>
                  <input
                    type="date"
                    value={startDate}
                    min={minDate}
                    onChange={e => {
                      setStartDate(e.target.value)
                      if (endDate && e.target.value > endDate) setEndDate('')
                    }}
                  />
                </div>
                <span className="product__date-arrow">&rarr;</span>
                <div className="product__date-field">
                  <label>Return by</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || minDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="product__sizes">
            <div className="product__sizes-header">
              <p className="product__field-label">Select Size</p>
              <button className="product__size-guide-link" onClick={() => setSizeGuideOpen(!sizeGuideOpen)}>
                Size Guide {sizeGuideOpen ? '\u25B2' : '\u25BC'}
              </button>
            </div>
            <div className="product__size-grid">
              {dress.size.map(s => (
                <button
                  key={s}
                  className={`product__size ${selectedSize === s ? 'product__size--selected' : ''}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {sizeGuideOpen && (
            <div className="product__size-guide">
              <table className="size-guide__table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>US</th>
                    <th>Bust</th>
                    <th>Waist</th>
                    <th>Hips</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map(row => (
                    <tr key={row.size}>
                      <td><strong>{row.size}</strong></td>
                      <td>{row.us}</td>
                      <td>{row.bust}</td>
                      <td>{row.waist}</td>
                      <td>{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="product__size-tip">Between sizes? We recommend sizing up. Every rental includes a free backup size.</p>
            </div>
          )}

          <button
            className="btn btn--primary btn--full product__add-btn"
            disabled={!selectedSize}
            onClick={handleAdd}
          >
            {selectedSize ? `Add to Bag \u2014 $${totalPrice}` : 'Select a Size'}
          </button>

          <div className="product__perks">
            <div className="product__perk"><CheckIcon /> Free shipping & returns</div>
            <div className="product__perk"><CheckIcon /> Dry cleaning included</div>
            <div className="product__perk"><CheckIcon /> Backup size available</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2 className="related__title">You may also like</h2>
          <div className="related__grid">
            {related.map(d => (
              <DressCard key={d.id} dress={d} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function CartPage() {
  const cart = useContext(CartContext)
  const toast = useContext(ToastContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [insurance, setInsurance] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const subtotal = cart.total
  const insuranceCost = insurance ? Math.round(subtotal * 0.1) : 0
  const grandTotal = subtotal + insuranceCost

  const handleRemove = (index: number) => {
    if (confirmRemove === index) {
      cart.removeItem(index)
      toast.addToast('Removed from bag', 'info')
      setConfirmRemove(null)
    } else {
      setConfirmRemove(index)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const orderNumber = `DRP-${Date.now().toString(36).toUpperCase()}`
    const orderItems = [...cart.items]
    const orderTotal = grandTotal
    cart.clearCart()
    navigate('/order-confirmed', { state: { orderNumber, items: orderItems, total: orderTotal, email } })
  }

  const isFormValid = email && phone && fullName && address && city && state && zip

  return (
    <div className="page-container">
      <Breadcrumbs items={[
        { label: 'Home', to: '/' },
        { label: 'Collection', to: '/collection' },
        { label: 'Your Bag' },
      ]} />

      <h1 className="cart-page__title">Your Bag</h1>

      {cart.items.length === 0 ? (
        <div className="cart-page__empty">
          <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
          <p>Your bag is empty</p>
          <Link to="/collection" className="btn btn--primary">Browse Collection</Link>
        </div>
      ) : (
        <form className="cart-page__layout" onSubmit={handleSubmit}>
          <div className="cart-page__items">
            <h2 className="cart-page__section-title">Review Items ({cart.items.length})</h2>
            {cart.items.map((item, i) => (
              <div key={i} className="cart-page__item">
                <Link to={`/dress/${item.dress.id}`} className="cart-page__item-img-link">
                  <img src={item.dress.image} alt={item.dress.imageAlt} className="cart-page__item-img" />
                </Link>
                <div className="cart-page__item-info">
                  <p className="cart-page__item-designer">{item.dress.designer}</p>
                  <p className="cart-page__item-name">{item.dress.name}</p>
                  <div className="cart-page__item-meta">
                    <label className="cart-page__item-size-label">
                      Size:
                      <select
                        value={item.size}
                        onChange={e => cart.updateItemSize(i, e.target.value)}
                        className="cart-page__item-size-select"
                      >
                        {item.dress.size.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <span className="cart-page__item-dates">{item.days} days</span>
                  </div>
                  <p className="cart-page__item-price">${item.dress.rentalPrice}</p>
                </div>
                <button
                  type="button"
                  className={`cart-page__item-remove ${confirmRemove === i ? 'cart-page__item-remove--confirm' : ''}`}
                  onClick={() => handleRemove(i)}
                >
                  {confirmRemove === i ? 'Confirm?' : 'Remove'}
                </button>
              </div>
            ))}

            <Link to="/collection" className="cart-page__continue-link">&larr; Continue Shopping</Link>

            <h2 className="cart-page__section-title">Contact Information</h2>
            <div className="cart-page__form-row">
              <div className="form-group">
                <label htmlFor="cart-email">Email</label>
                <input id="cart-email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="cart-phone">Phone</label>
                <input id="cart-phone" type="tel" placeholder="(555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </div>

            <h2 className="cart-page__section-title">Shipping Address</h2>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label htmlFor="cart-name">Full Name</label>
              <input id="cart-name" type="text" placeholder="Jane Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label htmlFor="cart-address">Street Address</label>
              <input id="cart-address" type="text" placeholder="123 Main St, Apt 4" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="cart-page__form-row cart-page__form-row--three">
              <div className="form-group">
                <label htmlFor="cart-city">City</label>
                <input id="cart-city" type="text" placeholder="New York" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="cart-state">State</label>
                <input id="cart-state" type="text" placeholder="NY" value={state} onChange={e => setState(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="cart-zip">ZIP</label>
                <input id="cart-zip" type="text" placeholder="10001" value={zip} onChange={e => setZip(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="cart-page__summary">
            <div className="cart-page__summary-sticky">
              <h2 className="cart-page__section-title">Order Summary</h2>
              <div className="cart-page__summary-row">
                <span>Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})</span>
                <span>${subtotal}</span>
              </div>
              <div className="cart-page__summary-row">
                <span>Shipping</span>
                <span className="cart-page__free-badge">FREE</span>
              </div>
              <div className="cart-page__summary-row cart-page__summary-row--insurance">
                <label className="cart-page__insurance-label">
                  <input type="checkbox" checked={insurance} onChange={e => setInsurance(e.target.checked)} />
                  Rental Insurance
                </label>
                <span>{insurance ? `$${insuranceCost}` : '\u2014'}</span>
              </div>
              {insurance && (
                <p className="cart-page__insurance-note">Covers accidental damage, stains, and minor repairs.</p>
              )}
              <div className="cart-page__summary-total">
                <span>Total</span>
                <strong>${grandTotal}</strong>
              </div>
              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={!isFormValid}
              >
                Place Order &mdash; ${grandTotal}
              </button>
              <p className="cart-page__note">
                We'll call or text to confirm your order and arrange delivery details.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

function DressPicker({ currentDress, onSelect }: { currentDress: Dress; onSelect: (d: Dress) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="dress-picker" ref={ref}>
      <button className="dress-picker__trigger" onClick={() => setOpen(!open)}>
        <img src={currentDress.imageFlat} alt="" className="dress-picker__trigger-img" />
        <div className="dress-picker__trigger-text">
          <span className="dress-picker__trigger-designer">{currentDress.designer}</span>
          <span className="dress-picker__trigger-name">{currentDress.name}</span>
        </div>
        <svg className={`dress-picker__chevron ${open ? 'dress-picker__chevron--open' : ''}`} viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="dress-picker__dropdown">
          {dresses.map(d => (
            <button
              key={d.id}
              className={`dress-picker__option ${d.id === currentDress.id ? 'dress-picker__option--active' : ''}`}
              onClick={() => { onSelect(d); setOpen(false) }}
            >
              <img src={d.imageFlat} alt="" className="dress-picker__option-img" />
              <div className="dress-picker__option-text">
                <span className="dress-picker__option-designer">{d.designer}</span>
                <span className="dress-picker__option-name">{d.name}</span>
              </div>
              {d.id === currentDress.id && (
                <svg className="dress-picker__check" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="var(--copper)" strokeWidth="2">
                  <path d="M3 8l4 4 6-6" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TryOnPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dress = dresses.find(d => d.id === Number(id))
  const [mode, setMode] = useState<'sample' | 'upload'>('sample')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    setResult(null)
    setError(null)
  }, [id])

  if (!dress) {
    return (
      <div className="page-container">
        <Breadcrumbs items={[
          { label: 'Home', to: '/' },
          { label: 'AI Try On' },
        ]} />
        <div className="try-on-page">
          <div className="try-on-page__header">
            <h1 className="try-on-page__name">AI Try On</h1>
            <p className="try-on-page__pick-prompt">Select a dress to get started</p>
          </div>
          <div className="try-on-page__grid">
            {dresses.map(d => (
              <button
                key={d.id}
                className="try-on-page__dress-card"
                onClick={() => navigate(`/try-on/${d.id}`)}
              >
                <img src={d.imageFlat} alt={d.name} />
                <div className="try-on-page__dress-card-info">
                  <span className="try-on-page__dress-card-designer">{d.designer}</span>
                  <span className="try-on-page__dress-card-name">{d.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setResult(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleGenerate = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    const body: { dressImagePath: string; personImageBase64?: string } = {
      dressImagePath: dress.imageFlat,
    }

    if (mode === 'upload' && uploadedImage) {
      body.personImageBase64 = uploadedImage.split(',')[1]
    }

    try {
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        if (data?.error && typeof data.error === 'string') {
          throw new Error(data.error)
        }
        throw new Error('Try-on failed')
      }
      setResult(data.image)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Generation failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  const canGenerate = mode === 'sample' || (mode === 'upload' && uploadedImage)

  return (
    <div className="page-container">
      <Breadcrumbs items={[
        { label: 'Home', to: '/' },
        { label: 'Collection', to: '/collection' },
        { label: dress.name, to: `/dress/${dress.id}` },
        { label: 'AI Try On' },
      ]} />

      <div className="try-on-page">
        <div className="try-on-page__header">
          <p className="try-on-page__designer">{dress.designer}</p>
          <h1 className="try-on-page__name">{dress.name}</h1>
          <DressPicker currentDress={dress} onSelect={(d) => navigate(`/try-on/${d.id}`)} />
        </div>

        <div className="try-on-page__layout">
          <div className="try-on-page__controls">
            <div className="try-on-page__mode-toggle">
              <button
                className={`try-on-page__mode-btn ${mode === 'sample' ? 'try-on-page__mode-btn--active' : ''}`}
                onClick={() => { setMode('sample'); setResult(null); setError(null) }}
              >
                Use Sample Model
              </button>
              <button
                className={`try-on-page__mode-btn ${mode === 'upload' ? 'try-on-page__mode-btn--active' : ''}`}
                onClick={() => { setMode('upload'); setResult(null); setError(null) }}
              >
                Upload Your Photo
              </button>
            </div>

            <div className="try-on-page__images">
              <div className="try-on-page__source">
                {mode === 'sample' ? (
                  <div className="try-on-page__preview">
                    <img src="/sample-image.jpg" alt="Sample model" />
                    <p className="try-on-page__preview-label">Sample Model</p>
                  </div>
                ) : (
                  <>
                    {uploadedImage ? (
                      <div className="try-on-page__preview">
                        <img src={uploadedImage} alt="Your uploaded photo" />
                        <button
                          className="try-on-page__change-photo"
                          onClick={() => { setUploadedImage(null); setResult(null) }}
                        >
                          Change Photo
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`try-on-page__upload ${dragOver ? 'try-on-page__upload--drag' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                      >
                        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M8 32l10-10 8 8 6-6 8 8" />
                          <rect x="4" y="4" width="40" height="40" rx="4" />
                          <circle cx="16" cy="16" r="4" />
                        </svg>
                        <p className="try-on-page__upload-text">
                          Drag & drop your photo here<br />
                          <span>or click to browse</span>
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileSelect(file)
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="try-on-page__dress-preview">
                <img src={dress.imageFlat} alt={`${dress.name} flat lay`} />
                <p className="try-on-page__preview-label">Dress: {dress.name}</p>
              </div>
            </div>

            {!result && (
              <button
                className="btn btn--try-on btn--full"
                disabled={!canGenerate || loading}
                onClick={handleGenerate}
              >
                {loading ? (
                  <>
                    <span className="try-on-spinner" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            )}

            {error && (
              <p className="try-on-page__error">{error}</p>
            )}
          </div>

          <div className="try-on-page__result">
            {loading && (
              <div className="try-on-page__loading">
                <span className="try-on-spinner try-on-spinner--lg" />
                <p>Creating your AI try-on...</p>
                <p className="try-on-page__loading-sub">This may take 15-30 seconds</p>
              </div>
            )}
            {result && !loading && (
              <div className="try-on-page__result-image">
                <img src={result} alt={`${dress.name} virtual try-on`} />
                <span className="try-on-page__ai-badge">AI Generated</span>
                <button
                  className="btn btn--try-on btn--full"
                  onClick={handleReset}
                  style={{ marginTop: '1rem' }}
                >
                  Try Again
                </button>
              </div>
            )}
            {!result && !loading && (
              <div className="try-on-page__placeholder">
                <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                  <rect x="8" y="8" width="48" height="48" rx="4" />
                  <path d="M8 44l14-14 10 10 8-8 16 16" />
                  <circle cx="22" cy="24" r="5" />
                </svg>
                <p>Your AI try-on will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="try-on-page__back">
          <Link to={`/dress/${dress.id}`} className="btn btn--outline">
            Back to {dress.name}
          </Link>
        </div>
      </div>
    </div>
  )
}

function OrderConfirmationPage() {
  const location = useLocation()
  const orderState = location.state as { orderNumber: string; items: CartItem[]; total: number; email: string } | null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!orderState) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <h2 className="section-title">No order found</h2>
        <p style={{ color: '#7a6e66', marginBottom: '2rem' }}>It looks like you haven't placed an order yet.</p>
        <Link to="/collection" className="btn btn--primary">Browse Collection</Link>
      </div>
    )
  }

  const { orderNumber, items, total, email } = orderState

  const timeline = [
    { label: 'Confirmation email sent', detail: `Sent to ${email}`, icon: '\u2709' },
    { label: 'Dress ships to you', detail: '1-2 business days', icon: '\uD83D\uDCE6' },
    { label: 'Wear it & shine', detail: 'Your event!', icon: '\u2728' },
    { label: 'Return with prepaid label', detail: 'Drop at USPS', icon: '\uD83D\uDD04' },
  ]

  return (
    <div className="page-container">
      <div className="confirmation">
        <div className="confirmation__hero">
          <div className="confirmation__check">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" width="80" height="80">
              <circle cx="32" cy="32" r="28" />
              <path d="M20 32l8 8 16-16" />
            </svg>
          </div>
          <div className="confirmation__particles">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="confirmation__particle" style={{
                '--angle': `${i * 30}deg`,
                '--delay': `${i * 0.08}s`,
                '--distance': `${50 + Math.random() * 40}px`,
              } as React.CSSProperties} />
            ))}
          </div>
          <h1 className="confirmation__title">Order Confirmed!</h1>
          <p className="confirmation__order-number">Order {orderNumber}</p>
        </div>

        <div className="confirmation__content">
          <div className="confirmation__items">
            <h2 className="cart-page__section-title">Order Summary</h2>
            {items.map((item, i) => (
              <div key={i} className="confirmation__item">
                <img src={item.dress.image} alt={item.dress.imageAlt} className="confirmation__item-img" />
                <div className="confirmation__item-info">
                  <p className="confirmation__item-designer">{item.dress.designer}</p>
                  <p className="confirmation__item-name">{item.dress.name}</p>
                  <p className="confirmation__item-meta">Size {item.size} &middot; {item.days} days</p>
                  <p className="confirmation__item-price">${item.dress.rentalPrice}</p>
                </div>
              </div>
            ))}
            <div className="confirmation__total">
              <span>Total paid</span>
              <strong>${total}</strong>
            </div>
          </div>

          <div className="confirmation__timeline">
            <h2 className="cart-page__section-title">What happens next</h2>
            <div className="confirmation__steps">
              {timeline.map((step, i) => (
                <div key={i} className="confirmation__step">
                  <div className="confirmation__step-icon">{step.icon}</div>
                  <div className="confirmation__step-content">
                    <p className="confirmation__step-label">{step.label}</p>
                    <p className="confirmation__step-detail">{step.detail}</p>
                  </div>
                  {i < timeline.length - 1 && <div className="confirmation__step-line" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="confirmation__actions">
          <Link to="/collection" className="btn btn--primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

function WelcomeSplash() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem('drape-splash-seen'))
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (!visible) return
    sessionStorage.setItem('drape-splash-seen', '1')
    document.body.style.overflow = 'hidden'

    const exitTimer = setTimeout(() => setExiting(true), 2500)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      document.body.style.overflow = ''
    }, 3100)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(hideTimer)
      document.body.style.overflow = ''
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`welcome-splash${exiting ? ' welcome-splash--exiting' : ''}`}>
      <div className="welcome-splash__logo">RTR</div>
      <div className="welcome-splash__line" />
      <div className="welcome-splash__tagline">Wear the dress. Not the price tag.</div>
    </div>
  )
}

function App() {
  // ── Toast state ──
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(0)

  const addToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // ── Cart state ──
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('drape-cart')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('drape-cart', JSON.stringify(cartItems))
  }, [cartItems])

  const cartContext: CartContextType = {
    items: cartItems,
    addItem: (item) => setCartItems(prev => [...prev, item]),
    removeItem: (index) => setCartItems(prev => prev.filter((_, i) => i !== index)),
    updateItemSize: (index, size) => setCartItems(prev =>
      prev.map((item, i) => i === index ? { ...item, size } : item)
    ),
    clearCart: () => setCartItems([]),
    total: cartItems.reduce((sum, item) => sum + item.dress.rentalPrice, 0),
  }

  // ── Favorites state ──
  const [favorites, setFavorites] = useLocalStorageSet('drape-favorites')

  const favoritesContext: FavoritesContextType = {
    favorites,
    toggle: (id) => {
      const next = new Set(favorites)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setFavorites(next)
    },
    isFavorite: (id) => favorites.has(id),
    count: favorites.size,
  }

  const toastContext: ToastContextType = { addToast }

  // Scroll to top on route change
  const location = useLocation()
  useEffect(() => {
    // Don't scroll on hash changes (handled by LandingPage)
    if (!location.hash) {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.hash])

  return (
    <CartContext.Provider value={cartContext}>
      <FavoritesContext.Provider value={favoritesContext}>
        <ToastContext.Provider value={toastContext}>
          <WelcomeSplash />
          <div className="app">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/dress/:id" element={<ProductPage />} />
                <Route path="/try-on" element={<TryOnPage />} />
                <Route path="/try-on/:id" element={<TryOnPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/order-confirmed" element={<OrderConfirmationPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/early-access" element={<EarlyAccessPage />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
          </div>
        </ToastContext.Provider>
      </FavoritesContext.Provider>
    </CartContext.Provider>
  )
}

export default App
