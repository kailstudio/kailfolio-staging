/**
 * PortfolioSection.jsx
 *
 * Glassmorphic portfolio section — left column of the split-screen layout.
 *
 *   logo → headline (scroll-reveal) → subtitle → body → accordion pills
 *   Each pill expands an auto-scroll inline carousel.
 *   Clicking any carousel card calls props.onProjectOpen(cat).
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useMotionValue, LayoutGroup } from 'framer-motion'
import { TextRotate } from './TextRotate'

// ── Category data (extended for ProjectDetail) ──────────────────────
export const CATEGORIES = [
  {
    id: 'brand',
    name: 'Brand Strategy, Voice & Identity',
    tagline: 'Systems that speak with a singular, unmistakable voice.',
    description:
      'We build strategic brand foundations — positioning, personality, visual language, and tone of voice — into cohesive systems that scale across every touchpoint and endure through time.',
    accent: '#C4B8F0',
    accentDark: '#7050d8',
    stats: [
      { label: 'Brands Built', value: '24+' },
      { label: 'Industries', value: '12' },
      { label: 'Retention',   value: '94%' },
    ],
    slides: [
      { id: 1, bg: '#C4B8F0', label: 'Identity System' },
      { id: 2, bg: '#D4C8FF', label: 'Voice & Tone Guide' },
      { id: 3, bg: '#B8ADDC', label: 'Brand Strategy Deck' },
      { id: 4, bg: '#DDD4FF', label: 'Logo Suite' },
    ],
  },
  {
    id: 'packaging',
    name: 'Packaging, Print & Physical Design',
    tagline: 'Tactile design that earns shelf presence and consumer trust.',
    description:
      'From cosmetics to food and beverage, we craft packaging and print systems that communicate quality, sustainability, and brand identity — at a glance, on any shelf, in any market.',
    accent: '#A8D4BC',
    accentDark: '#3a9068',
    stats: [
      { label: 'SKUs Designed',    value: '180+' },
      { label: 'Retail Channels',  value: '40+'  },
      { label: 'Sales Lift',       value: '2.8×' },
    ],
    slides: [
      { id: 1, bg: '#A8D4BC', label: 'Cosmetics Range' },
      { id: 2, bg: '#C4ECD8', label: 'Food & Beverage' },
      { id: 3, bg: '#90C4A8', label: 'Editorial Spread' },
      { id: 4, bg: '#D0F0DC', label: 'Retail Display' },
    ],
  },
  {
    id: 'motion',
    name: 'Motion Design & Animation',
    tagline: 'Frames that move audiences and brands forward.',
    description:
      'Character animation, brand motion reels, title sequences, and social content — we bring brands to life through purposeful, premium motion design that resonates globally.',
    accent: '#A8C4EC',
    accentDark: '#2a60c8',
    stats: [
      { label: 'Films & Reels',    value: '60+'  },
      { label: 'Total Views',      value: '12M+' },
      { label: 'Engagement Lift',  value: '4.1×' },
    ],
    slides: [
      { id: 1, bg: '#A8C4EC', label: 'Brand Animation Reel' },
      { id: 2, bg: '#C0B8F0', label: 'Character Motion' },
      { id: 3, bg: '#90B8E4', label: 'Title Sequence' },
      { id: 4, bg: '#B4CCEC', label: 'Social Content' },
    ],
  },
  {
    id: 'web',
    name: 'Web, Digital & UX Design',
    tagline: 'Digital experiences as intentional as the brands behind them.',
    description:
      'Portfolio sites, campaign pages, app UIs, and full design systems — we create digital presence that converts visitors to customers and earns long-term loyalty through craft.',
    accent: '#F0CABB',
    accentDark: '#c06038',
    stats: [
      { label: 'Sites Launched',   value: '38+'  },
      { label: 'Lighthouse Score', value: '97'   },
      { label: 'Conversion Lift',  value: '3.5×' },
    ],
    slides: [
      { id: 1, bg: '#F0CABB', label: 'Portfolio Site' },
      { id: 2, bg: '#F8DCCC', label: 'App UI Design' },
      { id: 3, bg: '#E8C4B0', label: 'Campaign Page' },
      { id: 4, bg: '#F4D8C8', label: 'Design System' },
    ],
  },
]

const CARD_W    = 224
const CARD_GAP  = 14
const SPEED_PPS = 38

// ── Inline carousel — RAF-driven infinite auto-scroll ───────────────
function InlineCarousel({ slides, visible, onCardClick }) {
  const x           = useMotionValue(0)
  const pausedRef   = useRef(false)
  const rafRef      = useRef(null)
  const prevTimeRef = useRef(null)

  const tripled     = useMemo(() => [...slides, ...slides, ...slides], [slides])
  const singleWidth = slides.length * (CARD_W + CARD_GAP)

  useEffect(() => {
    if (!visible) {
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
  }, [visible, singleWidth])

  return (
    <div
      className="ic-wrap"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div className="ic-viewport">
        <motion.div className="ic-track" style={{ x }}>
          {tripled.map((slide, i) => (
            <div
              key={`${slide.id}-${i}`}
              className="ic-card"
              style={{ background: slide.bg }}
              onClick={onCardClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onCardClick?.()}
            >
              <span className="ic-card-label">{slide.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ── Panel bubble decoration ─────────────────────────────────────────
function PanelBubble({ size, top, left, right, bottom, opacity = 1 }) {
  const style = {
    width: `${size}%`,
    aspectRatio: '1',
    position: 'absolute',
    borderRadius: '50%',
    background: `radial-gradient(
      circle at 30% 30%,
      rgba(255,255,255,0.65) 0%,
      rgba(200,220,255,0.30) 38%,
      rgba(120,160,255,0.10) 100%
    )`,
    border: '1.5px solid rgba(255,255,255,0.45)',
    opacity,
  }
  if (top    !== undefined) style.top    = `${top}%`
  if (left   !== undefined) style.left   = `${left}%`
  if (right  !== undefined) style.right  = `${right}%`
  if (bottom !== undefined) style.bottom = `${bottom}%`
  return <div style={style} />
}

// ── Main section ────────────────────────────────────────────────────
export default function PortfolioSection({ onProjectOpen }) {
  const [openId, setOpenId] = useState(null)
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <section className="pf-section" id="portfolio">

      {/* Glass top-edge highlight */}
      <div className="pf-glass-lip" aria-hidden="true" />

      <div className="pf-inner">

        {/* ═══ LEFT COLUMN ════════════════════════════════════════════ */}
        <div className="pf-left">

          {/* Logo — fades in first */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="Studio KAIL"
              className="pf-logo-sm"
              draggable={false}
            />
          </motion.div>

          {/* Headline — word-by-word stagger; lime underline draws after 1s */}
          <div className="pf-rotate-wrap">
            <LayoutGroup>
              <h2 className="pf-rotate-line" aria-label="From spark to screen, shelf, sales, and more">

                {/* Row 1 — "From" then "spark" stagger in individually */}
                <span className="pf-rotate-row">
                  <motion.span
                    style={{ display: 'inline-block' }}
                    initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                  >
                    From
                  </motion.span>

                  {/* "spark" + lime underline */}
                  <motion.span
                    style={{ display: 'inline-block', position: 'relative' }}
                    initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
                  >
                    spark
                    <motion.span
                      className="pf-spark-underline"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94], delay: 1.0 }}
                    />
                  </motion.span>

                  {/* "to" — same row, no underline */}
                  <motion.span
                    style={{ display: 'inline-block' }}
                    initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}
                  >
                    to
                  </motion.span>
                </span>

                {/* Row 2 — rotating chip */}
                <motion.span
                  className="pf-rotate-row"
                  layout
                  initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.31 }}
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
            </LayoutGroup>
          </div>

          {/* Subtitle — sequences after the headline words */}
          <motion.p
            className="pf-subtitle"
            initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.44 }}
          >
            and <mark className="hl-between">everything in between.</mark>
          </motion.p>

          {/* Body copy */}
          <motion.p
            className="pf-body"
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.36 }}
          >
            We design strategic brand foundations across identity, websites,
            animation, print, and packaging — building cohesive systems that
            work seamlessly across digital and physical spaces.
          </motion.p>

          {/* Expandable category pills */}
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
                  <InlineCarousel
                    slides={cat.slides}
                    visible={openId === cat.id}
                    onCardClick={() => onProjectOpen?.(cat)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
