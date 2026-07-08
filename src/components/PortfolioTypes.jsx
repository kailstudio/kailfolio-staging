/**
 * PortfolioTypes.jsx — "fanned deck" story section: an intro cover card
 * (INTRO_PANEL below) plus one card per portfolio discipline (Brand /
 * Motion / Packaging / Web — reusing the real CATEGORIES data from
 * PortfolioSection.jsx, so the copy here is the same source of truth as
 * the carousel further down, not invented placeholder text). Sits
 * directly below Hero, above the portfolio links section.
 *
 * Each card is a tall photo card — the discipline's picture fills the top
 * of the card uncropped by any overlay, with a separate glass panel
 * (eyebrow/heading/tagline) sitting below it, not on top of it, so the
 * full picture is always visible.
 *
 * Effect: the intro card is the only thing resting in view the moment
 * this section is reached — pulled left of centre (FAN_START_X in
 * PortfolioTypeCard) rather than dead-centre, so the fan has visible room
 * to spread into as the rest of the deck arrives. As the user scrolls,
 * each following card slides in from off-screen right and settles into a
 * loose fanned stack (cascading slightly down-and-right, alternating
 * tilt) in front of the ones already there — repeats card by card until
 * all PANELS.length cards have arrived, at which point continued
 * scrolling carries past this section into whatever comes next.
 *
 * Mechanics:
 *   One scroll range for the whole deck — useScroll targets the outer
 *   .ptypes-section (height = PANELS.length × 100vh) with the same
 *   ['start start','end end'] pattern Hero.jsx uses, giving one 0→1
 *   `deckProgress`. That's sliced into (PANELS.length − 1) equal CYCLEs,
 *   one per card-to-card transition. Each CYCLE is itself split into a
 *   dwell portion (DWELL_FRACTION, the front card just sits there, fully
 *   settled) followed by a slide portion (the next card actually moves in)
 *   — so cards don't hand off back-to-back the instant one arrives; every
 *   card gets a real pause in the middle first. Card i (i ≥ 1) slides in
 *   during the tail end of card (i-1)'s cycle
 *   [(i-1)*CYCLE + DWELL_FRACTION*CYCLE, i*CYCLE] — 0 at that window's
 *   start (fully off-screen right, holding there through the preceding
 *   dwell) to 1 at its end (settled in its resting fan position), clamped
 *   so it simply holds at whichever end it's closest to outside that
 *   window. Card 0 (the intro) has no window of its own — it's mapped to
 *   a constant `entryP` of 1 the whole time, i.e. always "already
 *   arrived"; ITS dwell-then-cede-the-spotlight timing instead comes from
 *   its own dimP window (see below), same as every other card.
 *   Each card's rendered offset = its fixed "resting" fan position (small
 *   x/y/rotate, growing with index so later cards cascade further) PLUS
 *   its own entrance motion — the two are combined into a single
 *   transform per card rather than fought over by two separate ones (same
 *   reasoning as everywhere else transform ownership matters in this
 *   codebase: one owner per property, no CSS/JS fighting). z-index climbs
 *   with index so later arrivals land in front of earlier ones, matching
 *   the visual order they slide in.
 *
 * Mobile (≤900px, matching the site's main layout breakpoint): identical
 * mechanic — `isMobile` only tightens the resting fan offsets for a
 * narrow viewport. Stage sizing itself is handled by CSS.
 */

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CATEGORIES } from './PortfolioSection.jsx'
import PTypesBanner from './PTypesBanner.jsx'

const BASE = import.meta.env.BASE_URL

const MOBILE_MQ   = '(max-width: 900px)'
const ENTRY_X     = 1400  // px off-screen to the right an arriving card starts from
const ENTRY_ROTATE = 14   // extra deg an arriving card sheds on its way in

// Real card art, keyed by panel id — public/portfolio-types/*.webp. Falls
// back to IMAGE_ICON (below) for any panel without an entry here, so a
// future discipline card added without art yet doesn't break.
const PANEL_IMAGES = {
  intro:     `${BASE}portfolio-types/portfoliotype-intro.webp`,
  brand:     `${BASE}portfolio-types/portfoliotype-branding.webp`,
  motion:    `${BASE}portfolio-types/portfoliotype-motion.webp`,
  packaging: `${BASE}portfolio-types/portfoliotype-packaging.webp`,
  web:       `${BASE}portfolio-types/portfoliotype-web.webp`,
}

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
  const isFirst = index === 0

  // Resting fan position once a card has fully arrived — cascades toward
  // the bottom-right as index grows (the direction cards arrive FROM),
  // with a gentle alternating tilt so it reads as hand-fanned rather than
  // a rigid grid. The intro card starts the fan pulled left of centre
  // (FAN_START_X) rather than sitting dead-centre, so there's visibly more
  // room for the rest of the deck to spread out across as it arrives,
  // instead of bunching toward one side. Tighter on mobile so it doesn't
  // push cards past a narrow viewport's edges.
  const FAN_START_X = isMobile ? -26 : -70
  const FAN_STEP_X  = isMobile ? 16 : 34
  const stackX      = FAN_START_X + index * FAN_STEP_X
  const stackY      = index * (isMobile ? 9 : 16)
  const stackRotate = (index % 2 === 0 ? -1 : 1) * (isMobile ? 1 + index * 0.5 : 1.5 + index * 0.8)

  // Each card-to-card transition owns one equal CYCLE of the overall deck
  // scroll ([i/(N-1), (i+1)/(N-1)]). That used to be spent entirely on the
  // slide — the moment one card finished arriving, the next was already
  // due to start, so nothing ever got to just sit there. Now each cycle
  // is split: the front card dwells, fully settled, for the first
  // DWELL_FRACTION of it, THEN the next card slides in during the
  // remainder — so every card (including the intro one, at the very start
  // of the whole scroll) gets a real pause in the middle before ceding
  // the spotlight, rather than transitions running back-to-back.
  const CYCLE = 1 / (total - 1)
  const DWELL_FRACTION = 0.45

  // The intro card is already "arrived" the instant this section is
  // reached — entryP is pinned to a constant 1 for it (output range
  // [1, 1], so whatever deckProgress is doesn't matter). Every other
  // card's own entrance is the SLIDE portion of the PREVIOUS cycle
  // ((index-1)'s cycle) — i.e. it stays put until that cycle's dwell
  // portion has passed, then runs 0→1 for the rest of it, clamped so it
  // simply holds at 0 before that and 1 after — no special-casing needed
  // for "not yet due" vs "already settled".
  const prevCycleStart = (index - 1) * CYCLE
  const segStart = isFirst ? 0 : prevCycleStart + DWELL_FRACTION * CYCLE
  const segEnd   = isFirst ? 1 : prevCycleStart + CYCLE
  const entryP   = useTransform(deckProgress, [segStart, segEnd], isFirst ? [1, 1] : [0, 1], { clamp: true })

  const x       = useTransform(entryP, (v) => stackX + (1 - v) * ENTRY_X)
  const rotate  = useTransform(entryP, (v) => stackRotate + (1 - v) * (index % 2 === 0 ? ENTRY_ROTATE : -ENTRY_ROTATE))
  const scale   = useTransform(entryP, [0, 1], [0.94, 1])

  // Own fade-in as this card arrives (0 while off-screen, 1 once settled).
  const enterOpacity = useTransform(entryP, [0, 0.4, 1], [0, 1, 1])

  // Once the NEXT card starts sliding in (i.e. once THIS card's own cycle
  // has dwelled and reached its slide portion), this one dims to a low
  // opacity instead of staying fully opaque underneath it — with several
  // cards fanned out and overlapping, every earlier card sitting at full
  // opacity made the frontmost one hard to read against all that stacked
  // text/photo behind it. Dimming tracks the next card's own entry window
  // exactly (the slide portion of THIS card's cycle), so the old card
  // fades down in sync with the new one fading/sliding in — staying fully
  // visible through its own dwell period first — and (clamp:true) holds
  // it at 0.2 once that's done rather than only dimming momentarily. The
  // very last card has no "next" card to cede the spotlight to, so it
  // never dims.
  const isLast = index === total - 1
  const ownCycleStart = index * CYCLE
  const dimP = useTransform(
    deckProgress,
    [ownCycleStart + DWELL_FRACTION * CYCLE, ownCycleStart + CYCLE],
    isLast ? [1, 1] : [1, 0.2],
    { clamp: true }
  )

  const opacity = useTransform([enterOpacity, dimP], ([enter, dim]) => enter * dim)

  // Thin brand-coloured edge, mixed from this category's own accentDark
  // (same colours the carousel further down uses) — the only per-card
  // tint now, since the photo (not a flat wash) is the card's main visual.
  const borderTint = { borderColor: hexToRgba(cat.accentDark, 0.28) }

  return (
    <motion.div
      className="ptypes-card"
      style={{
        ...borderTint,
        zIndex: index + 1,
        x,
        y: stackY,
        rotate,
        opacity,
        scale,
      }}
    >
      {/* Full picture, uncropped by any overlay — real art where available
          (PANEL_IMAGES), placeholder glyph otherwise. Fills the top of the
          card; the glass panel below is a separate area, not laid over
          this one, so nothing ever covers the photo. */}
      <div className="ptypes-image-slot" aria-hidden="true">
        {PANEL_IMAGES[cat.id] ? (
          <img
            src={PANEL_IMAGES[cat.id]}
            alt=""
            className="ptypes-image-slot-img"
            draggable={false}
          />
        ) : (
          <span className="ptypes-image-slot-icon">{IMAGE_ICON}</span>
        )}
      </div>

      <div className="ptypes-content">
        <div className="ptypes-eyebrow-row">
          <span className="ptypes-eyebrow">{String(index + 1).padStart(2, '0')} — {cat.eyebrow}</span>
          {cat.comingSoon && <span className="pf-coming-soon-label">Coming soon</span>}
        </div>

        <h2 className="ptypes-heading">{cat.name}</h2>
        <p className="ptypes-tagline">{cat.tagline}</p>
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
        {/* Sits behind .ptypes-stage in normal DOM/paint order — no
            z-index tug-of-war needed, the opaque cards on top simply
            cover it wherever they overlap, and it shows through in the
            gaps around the fan. */}
        <PTypesBanner />
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
