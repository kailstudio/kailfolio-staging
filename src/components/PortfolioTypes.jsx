/**
 * PortfolioTypes.jsx — "stacked deck" story section: an intro cover card
 * (INTRO_PANEL below) plus one card per portfolio discipline (Brand /
 * Motion / Packaging / Web — reusing the real CATEGORIES data from
 * PortfolioSection.jsx, so the copy here is the same source of truth as
 * the carousel further down, not invented placeholder text). Sits
 * directly below Hero, above the portfolio links section.
 *
 * Effect: all cards sit overlapping in a loose, hand-shuffled stack from
 * the moment this section is reached — not one full-screen arrival at a
 * time. As the user scrolls, the front-most card slides/rotates away and
 * fades, revealing the card that was already sitting behind it. Repeats
 * card by card until only the last one remains.
 *
 * Mechanics:
 *   One scroll range for the whole deck — useScroll targets the outer
 *   .ptypes-section (height = PANELS.length × 100vh) with the same
 *   ['start start','end end'] pattern Hero.jsx uses, giving one 0→1
 *   `deckProgress`. That's sliced into (PANELS.length − 1) equal windows,
 *   one per card transition; card i owns window
 *   [i/(N-1), (i+1)/(N-1)] and animates its own exit across it. The very
 *   last card's "window" falls past the end of deckProgress's 0..1 range,
 *   so it never gets a nonzero exit value — it just stays put.
 *   Each card's rendered offset = its fixed "resting" stack scatter
 *   (small x/y/rotate, so the ones behind visibly peek out) PLUS its own
 *   exit motion once its window is reached — the two are combined into a
 *   single transform per card rather than fought over by two separate
 *   ones (same reasoning as everywhere else transform ownership matters
 *   in this codebase: one owner per property, no CSS/JS fighting).
 *
 * Mobile (≤900px, matching the site's main layout breakpoint): same pin +
 * overlapping-deck + scroll-reveal mechanic as desktop. `isMobile` is only
 * used to tighten the resting scatter offsets for narrow viewports — the
 * pin, exit motion, and stage sizing itself are handled by CSS (a smaller
 * .ptypes-stage and a column-direction .ptypes-card at that breakpoint).
 */

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CATEGORIES } from './PortfolioSection.jsx'

const MOBILE_MQ    = '(max-width: 900px)'
const EXIT_Y       = -1300  // px an exiting card travels (comfortably past any viewport)
const EXIT_ROTATE  = 11     // extra deg an exiting card picks up on its way out

// Cover card ahead of the four discipline cards — same shape as a
// CATEGORIES entry (so PortfolioTypeCard doesn't need special-casing).
// Colours reuse the site's own blue/lilac aurora tones as a neutral
// lead-in rather than borrowing any one discipline's accent.
const INTRO_PANEL = {
  id: 'intro',
  eyebrow: 'Portfolio',
  name: 'Four Disciplines, One Studio',
  tagline: 'A closer look at how Studio KAIL works, discipline by discipline.',
  accent: '#C4B8F0',
  accentDark: '#3d5cff',
}

// Combined, normalised list PortfolioTypeCard actually renders — the
// intro card plus every real category, each given an `eyebrow` label
// derived from its id.
const PANELS = [
  INTRO_PANEL,
  ...CATEGORIES.map((cat) => ({
    ...cat,
    eyebrow: cat.id.charAt(0).toUpperCase() + cat.id.slice(1),
  })),
]

// Exported so other sections (HeroSequence's "start when the last card
// arrives" scroll math) can derive the deck's exit-window fractions
// without hardcoding the panel count separately.
export const PANEL_COUNT = PANELS.length

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// Generic "image" placeholder glyph — same one used for the footer's
// placeholder cards and the hero orbit's chips, so "artwork coming later"
// reads as one consistent language across the whole site.
const IMAGE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="9" cy="9.5" r="1.8" />
    <path d="M21 15.5 15.5 10 6 19" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function useIsPTypesMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const onChange = (e) => setIsMobile(e.matches)
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange)
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange)
    }
  }, [])
  return isMobile
}

function PortfolioTypeCard({ cat, index, total, deckProgress, isMobile }) {
  // This card's slice of the overall deck scroll. For the last card this
  // range sits entirely past deckProgress's max of 1 (e.g. [1, 1.25] for
  // a 5-card deck), so clamp:true below keeps its exit value pinned at 0
  // for the whole scroll — it never needs a special case.
  const segStart = index / (total - 1)
  const segEnd   = (index + 1) / (total - 1)
  const exitP    = useTransform(deckProgress, [segStart, segEnd], [0, 1], { clamp: true })

  // Resting "hand-shuffled deck" scatter — alternating sides, growing
  // slightly with depth so cards further back peek out further. Tighter
  // on mobile so the scatter doesn't push cards past a narrow viewport's
  // edges, but still very much present — the overlap is the whole point.
  const stackX      = (index % 2 === 0 ? 1 : -1) * (isMobile ? 5 + index * 2 : 8 + index * 4)
  const stackY       = index * (isMobile ? 8 : 11)
  const stackRotate  = (index % 2 === 0 ? -1 : 1) * (isMobile ? 0.8 + index * 0.4 : 1 + index * 0.55)

  const y       = useTransform(exitP, (v) => stackY + v * EXIT_Y)
  const rotate  = useTransform(exitP, (v) => stackRotate + v * (index % 2 === 0 ? -EXIT_ROTATE : EXIT_ROTATE))
  const opacity = useTransform(exitP, [0, 0.6, 1], [1, 1, 0])
  const scale   = useTransform(exitP, [0, 1], [1, 1.03])

  const tint = {
    background: `linear-gradient(150deg, ${hexToRgba(cat.accent, 0.30)} 0%, ${hexToRgba(cat.accentDark, 0.22)} 55%, ${hexToRgba(cat.accent, 0.14)} 100%)`,
    borderColor: hexToRgba(cat.accentDark, 0.28),
  }

  return (
    <motion.div
      className="ptypes-card"
      style={{
        ...tint,
        zIndex: total - index,
        x: stackX,
        y,
        rotate,
        opacity,
        scale,
      }}
    >
      <div className="ptypes-content">
        <div className="ptypes-eyebrow-row">
          <span className="ptypes-eyebrow">{String(index + 1).padStart(2, '0')} — {cat.eyebrow}</span>
          {cat.comingSoon && <span className="pf-coming-soon-label">Coming soon</span>}
        </div>

        <h2 className="ptypes-heading">{cat.name}</h2>
        <p className="ptypes-tagline">{cat.tagline}</p>
      </div>

      {/* Placeholder image — swap for real project imagery whenever it's
          ready; layout/sizing stays the same either way. */}
      <div className="ptypes-image-slot" aria-hidden="true">
        <span className="ptypes-image-slot-icon">{IMAGE_ICON}</span>
      </div>
    </motion.div>
  )
}

export default function PortfolioTypes() {
  const isMobile   = useIsPTypesMobile()
  const sectionRef = useRef(null)

  const { scrollYProgress: deckProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section
      className="ptypes-section"
      ref={sectionRef}
      style={{ height: `${PANELS.length * 100}vh` }}
      aria-label="Portfolio disciplines"
    >
      <div className="ptypes-sticky">
        <div className="ptypes-stage">
          {PANELS.map((cat, i) => (
            <PortfolioTypeCard
              key={cat.id}
              cat={cat}
              index={i}
              total={PANELS.length}
              deckProgress={deckProgress}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
