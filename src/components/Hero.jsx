/**
 * Hero.jsx — full-viewport intro hero, the first thing visitors see once
 * the loading screen exits (mounted right after <SiteHeader /> in App.jsx,
 * before the portfolio split-screen).
 *
 * Always mounted (not conditionally rendered on `loaderExited`) — visibility
 * is controlled by the `visible` prop fading opacity instead. This section
 * is 170vh of real, normal-flow document height; conditionally mounting it
 * only after the loader exits meant .site-split (and everything in it,
 * including PortfolioSection's `layout`-animated rotating-word chip) took
 * its *first* layout measurement as if this section didn't exist yet, then
 * jumped ~170vh down the moment it mounted — framer-motion's `layout` prop
 * animates that jump as a visible "slides down from the top" glitch rather
 * than it happening invisibly pre-paint. Keeping this always in the DOM
 * (hidden behind the loading screen regardless) means .site-split's true
 * position is correct from the very first layout pass.
 *

 * A centre "orbit" — two concentric glass rings around a soft gradient
 * core — with placeholder image chips that fan outward as the user
 * scrolls, revealing a headline/subtext once the centre clears. Pinned via
 * position:sticky over a tall scroll scaffold (same pattern used by
 * ScrollAnimation.jsx and .split-left elsewhere in this app), with the
 * motion itself driven by framer-motion's useScroll/useTransform against
 * that scaffold — every frame stays off the React render cycle, no manual
 * scrollY state.
 *
 * Placeholder artwork: each chip is currently a dashed glass box with a
 * generic image glyph (CHIP_ICON below) — swap that glyph for a real
 * <img src="..." /> per chip once artwork is ready; nothing else about
 * the layout, sizing, or scroll motion needs to change.
 *
 * Centre reveal: the KAIL wordmark (public/logo.svg, white fill), large,
 * centred over the core orb. A soft drop-shadow (styles.css) keeps it
 * legible against that near-white gradient without a background shape.
 */

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const CHIP_COUNT            = 6
const EXPAND_RADIUS_DESKTOP = 280  // px the chips travel from centre at full scroll
const EXPAND_RADIUS_MOBILE  = 140
const MOBILE_MQ              = '(max-width: 640px)'

// Generic "image" placeholder glyph — same dashed-glass-box language used
// for the footer's placeholder cards, so the whole site's "artwork coming
// later" treatment reads consistently.
const CHIP_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="9" cy="9.5" r="1.8" />
    <path d="M21 15.5 15.5 10 6 19" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Evenly spaced around the circle, starting from the top (-90°).
const CHIPS = Array.from({ length: CHIP_COUNT }, (_, i) => ({
  id: i,
  label: `Work ${i + 1}`,
  angle: -Math.PI / 2 + i * ((2 * Math.PI) / CHIP_COUNT),
}))

function useIsHeroMobile() {
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

// One placeholder chip. `radius` is a shared motion value (0 → max px) —
// each chip derives its own x/y from it via its fixed angle, so the whole
// fan-out is one scroll-linked value driving six cheap per-chip transforms
// rather than six independent scroll listeners.
function HeroChip({ angle, label, radius }) {
  const x = useTransform(radius, (r) => r * Math.cos(angle))
  const y = useTransform(radius, (r) => r * Math.sin(angle))
  return (
    <motion.div className="hero-intro-chip" style={{ x, y }} aria-hidden="true" title={label}>
      <span className="hero-intro-chip-icon">{CHIP_ICON}</span>
    </motion.div>
  )
}

export default function Hero({ visible }) {
  const sectionRef = useRef(null)
  const isMobile    = useIsHeroMobile()

  // Progress 0→1 across the tall scaffold below — reachable and robust
  // since there's plenty of page after this section (HeroSequence engages,
  // then the portfolio grid), unlike the footer wordmark's page-end case.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const maxRadius = isMobile ? EXPAND_RADIUS_MOBILE : EXPAND_RADIUS_DESKTOP
  const radius = useTransform(scrollYProgress, [0.08, 0.62], [0, maxRadius], { clamp: true })

  const ringScale   = useTransform(scrollYProgress, [0, 0.3],  [0.9, 1])
  const ringOpacity = useTransform(scrollYProgress, [0, 0.18], [0, 1])
  const logoOpacity = useTransform(scrollYProgress, [0.4, 0.62], [0, 1])
  const logoY       = useTransform(scrollYProgress, [0.4, 0.62], [14, 0])
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  return (
    <motion.section
      className="hero-intro"
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="hero-intro-sticky">
        <div className="hero-intro-orbit">
          <motion.div
            className="hero-intro-ring hero-intro-ring--outer"
            style={{ opacity: ringOpacity, scale: ringScale }}
            aria-hidden="true"
          />
          <motion.div
            className="hero-intro-ring hero-intro-ring--inner"
            style={{ opacity: ringOpacity, scale: ringScale }}
            aria-hidden="true"
          />

          <div className="hero-intro-core-orb" aria-hidden="true" />

          {CHIPS.map((chip) => (
            <HeroChip key={chip.id} angle={chip.angle} label={chip.label} radius={radius} />
          ))}

          <motion.div className="hero-intro-logo-badge" style={{ opacity: logoOpacity, y: logoY }}>
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="Studio KAIL"
              className="hero-intro-logo-img"
              draggable={false}
            />
          </motion.div>
        </div>

        <motion.p className="hero-intro-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
          Scroll to explore ↓
        </motion.p>
      </div>
    </motion.section>
  )
}
