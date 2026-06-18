/**
 * HeroSequence.jsx — scroll-driven character animation
 *
 * Assets: 121 RGBA PNGs in /public/frames/ (optimised, ~215 KB each)
 *
 * Scroll driver
 *   animProgress maps [0, scrollRange] → [0, 1]
 *   Frame index = Math.round(progress × 120)
 *
 * Mobile scroll scaffold
 *   hero-mobile-spacer (2500 px) gives the fixed animation enough room
 *   to play all the way through before the portfolio section appears.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

// ── Frame config ─────────────────────────────────────────────────────
const FRAME_COUNT  = 121
const FRAME_PREFIX = `${import.meta.env.BASE_URL}frames/frame_`
const FRAME_PAD    = 5
const FRAME_EXT    = '.png'

function framePath(i) {
  return `${FRAME_PREFIX}${String(i).padStart(FRAME_PAD, '0')}${FRAME_EXT}`
}
function preloadAll() {
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image(); img.src = framePath(i)
  }
}
const ALL_FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => framePath(i))

// ── Scroll scaffold constants ────────────────────────────────────────
const MOBILE_SPACER  = 2500
const MOBILE_BREAKPT = 900

// ── Bubble data ──────────────────────────────────────────────────────
const BUBBLES = [
  // Background — large, slow
  { id:  1, size: 320, x:  9, baseY: 33, parallax:  -28, drift:   6, blur: 0, speed: 24 },
  { id:  2, size: 300, x: 77, baseY: 46, parallax:  -32, drift:  10, blur: 0, speed: 26 },
  { id:  3, size: 265, x: 88, baseY: 16, parallax:  -44, drift:  -7, blur: 1, speed: 29 },
  { id:  4, size: 240, x: 30, baseY: 74, parallax:  -38, drift:   9, blur: 0, speed: 21 },
  // Midground
  { id:  5, size: 188, x: 20, baseY: 54, parallax:  -95, drift: -11, blur: 2, speed: 22 },
  { id:  6, size: 168, x: 44, baseY: 19, parallax: -108, drift:  14, blur: 2, speed: 25 },
  { id:  7, size: 200, x: 82, baseY: 62, parallax:  -98, drift: -13, blur: 2, speed: 22 },
  { id:  8, size: 172, x: 66, baseY: 27, parallax: -112, drift:  16, blur: 3, speed: 25 },
  { id:  9, size: 185, x: 55, baseY: 82, parallax: -120, drift:  11, blur: 2, speed: 27 },
  // Foreground — small, fast
  { id: 10, size:  88, x: 12, baseY: 78, parallax: -200, drift:  18, blur: 5, speed: 18 },
  { id: 11, size:  72, x: 37, baseY: 46, parallax: -232, drift: -13, blur: 6, speed: 24 },
  { id: 12, size: 104, x: 50, baseY: 14, parallax: -178, drift:   9, blur: 4, speed: 20 },
  { id: 13, size:  96, x: 72, baseY: 51, parallax: -190, drift:  20, blur: 5, speed: 18 },
  { id: 14, size:  74, x: 82, baseY: 12, parallax: -238, drift: -16, blur: 7, speed: 24 },
  { id: 15, size: 110, x: 88, baseY: 38, parallax: -170, drift:  12, blur: 4, speed: 21 },
  { id: 16, size:  60, x: 62, baseY: 91, parallax: -260, drift: -18, blur: 8, speed: 26 },
]

function ParallaxBubble({ size, x, baseY, blur, speed, parallax, drift = 0, scrollYProgress }) {
  const y  = useTransform(scrollYProgress, [0, 1], [0, parallax])
  const dx = useTransform(scrollYProgress, [0, 1], [0, drift])
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${baseY}%`,
      transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
      <motion.div style={{ x: dx, y }}>
        <div className="bubble-visual" style={{
          width: size, height: size,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          animationDuration: `${speed}s`,
        }} />
      </motion.div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────
export default function HeroSequence() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [frameReady, setFrameReady] = useState(false)
  const [isMobile,   setIsMobile]   = useState(() => window.innerWidth <= MOBILE_BREAKPT)
  const charTrackRef = useRef(null)

  const { scrollY, scrollYProgress } = useScroll()
  const [scrollRange, setScrollRange] = useState(MOBILE_SPACER)

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPT
      setIsMobile(mobile)
      if (mobile) {
        setScrollRange(MOBILE_SPACER)
      } else {
        const maxScroll = Math.max(
          document.documentElement.scrollHeight - window.innerHeight, 400
        )
        setScrollRange(Math.min(maxScroll, 1200))
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const animProgress = useTransform(scrollY, [0, scrollRange], [0, 1], { clamp: true })

  // Mobile: freeze on frame 0 — no scroll-driven animation
  useMotionValueEvent(animProgress, 'change', (p) => {
    if (!isMobile) setFrameIndex(Math.round(p * (FRAME_COUNT - 1)))
  })

  // Wait for frame 0 to decode before revealing — prevents flash
  useEffect(() => {
    let cancelled = false
    const img = new Image()
    const markReady = () => { if (!cancelled) setFrameReady(true) }
    img.onload = () => {
      if (img.decode) img.decode().then(markReady).catch(markReady)
      else markReady()
    }
    img.onerror = markReady
    img.src = framePath(0)
    const cap = setTimeout(markReady, 2000)
    return () => { cancelled = true; clearTimeout(cap) }
  }, [])

  useEffect(() => { preloadAll() }, [])

  // Lift the char track so it sticks above the video section.
  // Falls back to footer if video section isn't present.
  useEffect(() => {
    const el = charTrackRef.current
    const stopper = document.querySelector('.video-section') || document.querySelector('.site-footer')
    if (!el || !stopper) return
    const update = () => {
      const overlap = Math.max(0, window.innerHeight - stopper.getBoundingClientRect().top)
      el.style.bottom = `${overlap}px`
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  const ease = [0.16, 1, 0.3, 1]

  return (
    <>
      {/* Bubble ecosystem */}
      <motion.div
        className="hero-bubbles-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: frameReady ? 1 : 0 }}
        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
      >
        {BUBBLES.map((b) => (
          <ParallaxBubble key={b.id} {...b} scrollYProgress={scrollYProgress} />
        ))}
      </motion.div>

      {/* Character animation */}
      <motion.div
        ref={charTrackRef}
        className="hero-char-track"
        aria-hidden="true"
        initial={{ opacity: 0, y: 18 }}
        animate={frameReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.85, ease, delay: 0.1 }}
      >
        <img
          src={ALL_FRAMES[frameIndex]}
          alt=""
          className="hero-char-img"
          draggable={false}
        />
      </motion.div>

      {/* Mobile scroll scaffold */}
      <div className="hero-mobile-spacer" aria-hidden="true" />
    </>
  )
}
