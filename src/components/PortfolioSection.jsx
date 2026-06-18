/**
 * PortfolioSection.jsx
 *
 * Left column: headline → subtitle → body → accordion category pills.
 * Each pill expands a RAF-driven infinite auto-scroll carousel.
 * Cards: lime / lilac alternating, oval image, tag chips, bordered title pill.
 * Mobile: native horizontal swipe, no auto-scroll.
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { TextRotate } from './TextRotate'

// ── Carousel constants ───────────────────────────────────────────────
const CARD_W    = 210   // px — card width inside the track
const CARD_GAP  = 12    // px — gap between cards
const SPEED_PPS = 24    // px/s ≈ one card every 8–9 s

// ── Brand colour classes (tints applied via CSS on glass cards) ──────
// Even → lilac tint  |  Odd → blue tint

// Converts hex → rgba for tinted oval placeholders
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Category + project data ──────────────────────────────────────────
export const CATEGORIES = [
  {
    id: 'brand',
    name: 'Brand Strategy, Voice & Identity',
    tagline: 'Purposeful identity for organisations that mean what they say.',
    description:
      'We craft brand foundations for mission-driven organisations — building positioning, visual identity, messaging architecture, and tone of voice into cohesive systems that scale across every touchpoint and stand the test of time.',
    accent: '#C4B8F0',
    accentDark: '#7050d8',
    stats: [
      { label: 'Brands Developed', value: '2+' },
      { label: 'Mission Alignment', value: '100%' },
      { label: 'Repeat Clients',   value: '✦' },
    ],
    slides: [
      {
        id: 1, bg: '#C4B8F0', label: 'Care-Based Safety',
        tags: ['Brand Strategy', 'Visual Identity', 'Tone of Voice'],
      },
      {
        id: 2, bg: '#B0A2E4', label: 'Participatory Grantmaking Community',
        tags: ['Brand Strategy', 'Community Design', 'Visual Identity'],
      },
    ],
  },
  {
    id: 'motion',
    name: 'Motion Design & Animation',
    tagline: 'Animation that moves minds, not just pixels.',
    description:
      'From charity sector explainers to brand reels and mindfulness toolkits, we create motion work that communicates complex ideas with warmth, clarity, and lasting impact — across digital platforms, presentations, and broadcast.',
    accent: '#A8C4EC',
    accentDark: '#2a60c8',
    stats: [
      { label: 'Projects Delivered', value: '7+' },
      { label: 'Sectors',            value: '3+' },
      { label: 'Client Repeat Rate', value: '80%' },
    ],
    slides: [
      {
        id: 1, bg: '#B8D4EC', label: 'Well Lab',
        tags: ['Motion Design', 'Brand Animation', 'Social Content'],
      },
      {
        id: 2, bg: '#F0C8B0', label: 'Spurgeons Explainer Videos',
        tags: ['Motion Design', 'Explainer Video', 'Charity'],
      },
      {
        id: 3, bg: '#C0D4B8', label: 'Disordered Eating Toolkit',
        tags: ['Motion Design', 'Health & Wellbeing', 'Educational'],
      },
      {
        id: 4, bg: '#A8C0E4', label: 'Spurgeons Box Breathing Animation',
        tags: ['Motion Design', 'Mindfulness', 'Wellness'],
      },
      {
        id: 5, bg: '#B4D0A8', label: 'Spurgeons Leaves on a Stream Animation',
        tags: ['Motion Design', 'Mindfulness', 'Animation'],
      },
      {
        id: 6, bg: '#C4B4F0', label: 'Studio KAIL Promotional Animations',
        tags: ['Motion Design', 'Brand Animation', 'Self-Promotion'],
      },
      {
        id: 7, bg: '#D4CCE8', label: 'Fiverr Small Projects',
        tags: ['Motion Design', 'Illustration', 'Freelance'],
      },
    ],
  },
  {
    id: 'packaging',
    name: 'Packaging, Print & Physical Design',
    tagline: 'Tactile design with shelf presence and soul.',
    description:
      'From artisan food brands to wellness products and spiritual tools, we craft packaging and print that earns attention on shelf, communicates quality at a glance, and tells a story worth holding.',
    accent: '#A8D4BC',
    accentDark: '#3a9068',
    stats: [
      { label: 'Products Designed', value: '5+' },
      { label: 'Countries',         value: '3+' },
      { label: 'Sectors',           value: '3' },
    ],
    slides: [
      {
        id: 1, bg: '#C8B898', img: 'projects/woodco.jpg', label: 'Woodco',
        tags: ['Packaging', 'Label Design', 'Visual Identity'],
      },
      {
        id: 2, bg: '#E8B098', img: 'projects/la-terra-rossa.jpg', label: 'La Terra Rossa',
        tags: ['Packaging', 'Label Design', 'Brand Identity'],
      },
      {
        id: 3, bg: '#C8A8D8', img: 'projects/oracle-cards.jpg', label: 'Self Awakening Oracle Cards',
        tags: ['Print', 'Book Design', 'Visual Identity'],
      },
      {
        id: 4, bg: '#F0C8C0', img: 'projects/signature-balm.jpg', label: 'Signature Balm',
        tags: ['Packaging', 'Label Design', 'Wellness'],
      },
      {
        id: 5, bg: '#F0D898', img: 'projects/lucciola.jpg', label: 'Lucciola',
        tags: ['Packaging', 'Label Design', 'Food & Beverage'],
      },
    ],
  },
  {
    id: 'web',
    name: 'Web, Digital & UX Design',
    tagline: 'Digital experiences are coming.',
    description:
      'Portfolio sites, campaign pages, app UIs, and full design systems — digital presence built with the same craft and intention as every Studio KAIL discipline. Coming soon.',
    accent: '#F0CABB',
    accentDark: '#c06038',
    comingSoon: true,
    stats: [
      { label: 'In Development', value: '✦' },
      { label: 'Launching',      value: '2025' },
      { label: 'Stay tuned',     value: '→' },
    ],
    slides: [],
  },
]

// ── Single project card ──────────────────────────────────────────────
function ProjectCard({ slide, index, onCardClick }) {
  const tint = index % 2 === 0 ? 'pj-card--lilac' : 'pj-card--blue'

  return (
    <div
      className={`pj-card ${tint}`}
      onClick={onCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onCardClick?.()}
    >
      {/* Stacked photo cards */}
      <div className="pj-photo-area">
        <div className="pj-photo-stack">
          <div className="pj-photo-back pj-photo-back--2" />
          <div className="pj-photo-back pj-photo-back--1" />
          <div className="pj-photo-front">
            {slide.img ? (
              <div
                className="pj-photo-img"
                style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${slide.img})` }}
              />
            ) : (
              <div
                className="pj-photo-placeholder"
                style={{ background: hexToRgba(slide.bg, 0.35) }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tag chips */}
      {slide.tags && slide.tags.length > 0 && (
        <div className="pj-tags">
          {slide.tags.map((tag, i) => (
            <span key={i} className="pj-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Bordered title pill */}
      <div className="pj-footer">
        <div className="pj-title-pill">
          <span className="pj-title">{slide.label}</span>
          <span className="pj-arrow">↗</span>
        </div>
      </div>
    </div>
  )
}

// ── RAF-driven infinite auto-scroll carousel ─────────────────────────
function InlineCarousel({ slides, visible, onCardClick }) {
  const x           = useMotionValue(0)
  const pausedRef   = useRef(false)
  const rafRef      = useRef(null)
  const prevTimeRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect touch device — disable auto-scroll, enable native swipe
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const tripled     = useMemo(() => [...slides, ...slides, ...slides], [slides])
  const singleWidth = slides.length * (CARD_W + CARD_GAP)

  // RAF auto-scroll (desktop only)
  useEffect(() => {
    if (!visible || isMobile) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      prevTimeRef.current = null
      return
    }
    const tick = (timestamp) => {
      if (prevTimeRef.current !== null && !pausedRef.current) {
        const delta = timestamp - prevTimeRef.current
        let next = x.get() - (SPEED_PPS * delta) / 1000
        if (Math.abs(next) >= singleWidth) next += singleWidth
        x.set(next)
      }
      prevTimeRef.current = timestamp
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [visible, singleWidth, isMobile])

  // ── Mobile: native swipe, single set of slides ──────────────────
  if (isMobile) {
    return (
      <div className="ic-wrap ic-wrap--mobile">
        <div className="ic-viewport--mobile">
          {slides.map((slide, i) => (
            <ProjectCard
              key={slide.id}
              slide={slide}
              index={i}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Desktop: RAF infinite scroll ────────────────────────────────
  return (
    <div
      className="ic-wrap"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div className="ic-viewport">
        <motion.div className="ic-track" style={{ x }}>
          {tripled.map((slide, i) => (
            <ProjectCard
              key={`${slide.id}-${i}`}
              slide={slide}
              index={i % slides.length}
              onCardClick={onCardClick}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ── Coming soon placeholder ──────────────────────────────────────────
function ComingSoonCard() {
  return (
    <div className="pf-coming-soon">
      <div className="pf-coming-soon-pill">
        <span className="pf-coming-soon-dots">
          <span className="pf-coming-soon-dot" />
          <span className="pf-coming-soon-dot" />
          <span className="pf-coming-soon-dot" />
        </span>
        <span className="pf-coming-soon-label">Coming soon</span>
      </div>
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────
export default function PortfolioSection({ onProjectOpen }) {
  const [openId, setOpenId] = useState(null)
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <section className="pf-section" id="portfolio">

      <div className="pf-glass-lip" aria-hidden="true" />

      <div className="pf-inner">
        <div className="pf-left">

          {/* ── Hero headline glass panel ── */}
          <motion.div
            className="hero-text-glass"
            initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            <div className="pf-rotate-wrap">
                <h2 className="pf-rotate-line" aria-label="From spark to screen, shelf, sales, and more">

                  <span className="pf-rotate-row">
                    <motion.span
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.20 }}
                    >
                      From
                    </motion.span>

                    <motion.span
                      style={{ display: 'inline-block', position: 'relative' }}
                      initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.33 }}
                    >
                      spark
                      {/* Smooth ellipse, drawn in via SVG pathLength */}
                      <svg className="pf-spark-circle" viewBox="0 0 110 46" aria-hidden="true" fill="none">
                        <motion.ellipse
                          cx="55" cy="23" rx="50" ry="19"
                          stroke="#c8ff00"
                          strokeWidth="5"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94], delay: 1.9 }}
                        />
                      </svg>
                    </motion.span>

                    <motion.span
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.41 }}
                    >
                      to
                    </motion.span>
                  </span>

                  <motion.span
                    className="pf-rotate-row"
                    initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.46 }}
                  >
                    <TextRotate
                      texts={['screen', 'shelf', 'sales', 'substance', 'sustainability', 'solutions']}
                      mainClassName="pf-rotate-chip"
                      staggerFrom="last"
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '-120%' }}
                      staggerDuration={0.03}
                      splitLevelClassName="pf-rotate-char-slot"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                      rotationInterval={2200}
                    />
                  </motion.span>

                </h2>
            </div>

            <motion.p
              className="pf-subtitle"
              initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.58 }}
            >
              and <mark className="hl-between">everything in between.</mark>
            </motion.p>
          </motion.div>

          {/* ── Body copy glass panel ── */}
          <motion.div
            className="pf-body-glass"
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            <p className="pf-body">
              We design strategic brand foundations across identity, websites,
              animation, print, and packaging — building cohesive systems that
              work seamlessly across digital and physical spaces.
            </p>
          </motion.div>

          {/* ── Accordion category pills + carousels ── */}
          <div className="pf-cats">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                className={`pf-cat-block${openId === cat.id ? ' open' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 + 0.1, duration: 0.5 }}
              >
                <button
                  className={`pf-pill${openId === cat.id ? ' pf-pill--open' : ''}`}
                  onClick={() => toggle(cat.id)}
                >
                  <span className="pf-pill-name">{cat.name}</span>
                  <span className={`pf-pill-icon${openId === cat.id ? ' rotated' : ''}`}>↙</span>
                </button>

                <div className="pf-carousel-inner">
                  {cat.comingSoon ? (
                    <ComingSoonCard />
                  ) : (
                    <InlineCarousel
                      slides={cat.slides}
                      visible={openId === cat.id}
                      onCardClick={() => onProjectOpen?.(cat)}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
