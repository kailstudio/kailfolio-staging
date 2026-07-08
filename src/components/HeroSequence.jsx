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
// parallax/drift are the px each bubble has travelled once the user has
// scrolled BUBBLE_PARALLAX_RANGE px — a fixed, fairly short distance
// (not "the whole document"), so the effect reads clearly within the
// first page or so of scrolling rather than smearing out across a very
// long page. Values bumped up from the original full-page-progress
// version for a more noticeable effect either way.
const BUBBLE_PARALLAX_RANGE = 1400

const BUBBLES = [
  // Background — large, slow
  { id:  1, size: 320, x:  9, baseY: 33, parallax:  -38, drift:   8, blur: 0, speed: 24 },
  { id:  2, size: 300, x: 77, baseY: 46, parallax:  -43, drift:  13, blur: 0, speed: 26 },
  { id:  3, size: 265, x: 88, baseY: 16, parallax:  -59, drift:  -9, blur: 1, speed: 29 },
  { id:  4, size: 240, x: 30, baseY: 74, parallax:  -51, drift:  12, blur: 0, speed: 21 },
  // Midground
  { id:  5, size: 188, x: 20, baseY: 54, parallax: -128, drift: -14, blur: 2, speed: 22 },
  { id:  6, size: 168, x: 44, baseY: 19, parallax: -146, drift:  18, blur: 2, speed: 25 },
  { id:  7, size: 200, x: 82, baseY: 62, parallax: -132, drift: -17, blur: 2, speed: 22 },
  { id:  8, size: 172, x: 66, baseY: 27, parallax: -151, drift:  21, blur: 3, speed: 25 },
  { id:  9, size: 185, x: 55, baseY: 82, parallax: -162, drift:  14, blur: 2, speed: 27 },
  // Foreground — small, fast
  { id: 10, size:  88, x: 12, baseY: 78, parallax: -270, drift:  23, blur: 5, speed: 18 },
  { id: 11, size:  72, x: 37, baseY: 46, parallax: -313, drift: -17, blur: 6, speed: 24 },
  { id: 12, size: 104, x: 50, baseY: 14, parallax: -240, drift:  12, blur: 4, speed: 20 },
  { id: 13, size:  96, x: 72, baseY: 51, parallax: -257, drift:  26, blur: 5, speed: 18 },
  { id: 14, size:  74, x: 82, baseY: 12, parallax: -321, drift: -21, blur: 7, speed: 24 },
  { id: 15, size: 110, x: 88, baseY: 38, parallax: -230, drift:  16, blur: 4, speed: 21 },
  { id: 16, size:  60, x: 62, baseY: 91, parallax: -351, drift: -23, blur: 8, speed: 26 },
]

function ParallaxBubble({ size, x, baseY, blur, speed, parallax, drift = 0, scrollY }) {
  // Fixed pixel range + clamp, NOT whole-page scrollYProgress — a bubble's
  // full travel now happens within the first ~1400px of scroll and holds
  // from there, so the movement rate stays constant (and noticeable)
  // regardless of how long the overall page is, rather than the original
  // version where the same total travel got diluted across the entire
  // document height.
  const y  = useTransform(scrollY, [0, BUBBLE_PARALLAX_RANGE], [0, parallax], { clamp: true })
  const dx = useTransform(scrollY, [0, BUBBLE_PARALLAX_RANGE], [0, drift],    { clamp: true })
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

  const { scrollY } = useScroll()
  const [scrollRange, setScrollRange] = useState(MOBILE_SPACER)

  // Don't start the character animation until a scroll-trigger point is
  // reached — same trigger condition on both breakpoints now: the instant
  // the portfolio LINKS section (PortfolioSection.jsx, id="work" /
  // .pf-section) starts entering the viewport from the bottom while
  // scrolling. Converted to an absolute scrollY offset by subtracting the
  // viewport height from that section's own page position, so
  // charStartOffset is exactly the scrollY at which its top edge lines up
  // with the bottom edge of the screen.
  //
  // This used to trigger mobile off .ptypes-section (the PortfolioTypes
  // card deck, well ABOVE the portfolio links section) instead — which is
  // exactly why the character used to start walking too early on mobile,
  // mid-deck, well before the portfolio links actually appeared. Desktop
  // read .pf-rotate-line specifically (a headline inside .pf-section)
  // rather than the section itself; using the section directly here avoids
  // depending on a child element that has its own mount-time
  // opacity/y entrance animation (a transform-based motion value that
  // could skew a getBoundingClientRect read taken before it settles).
  const [charStartOffset, setCharStartOffset] = useState(0)

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPT
      setIsMobile(mobile)

      let offset = 0
      const workEl = document.querySelector('.pf-section')
      if (workEl) {
        const workTop = workEl.getBoundingClientRect().top + window.scrollY
        offset = Math.max(workTop - window.innerHeight, 0)
      }
      setCharStartOffset(offset)

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

  const animProgress = useTransform(
    scrollY,
    [charStartOffset, charStartOffset + scrollRange],
    [0, 1],
    { clamp: true }
  )

  // Frame-cycling now plays on mobile too (it was previously hard-frozen
  // on frame 0 there). animProgress is clamped, so frameIndex naturally
  // sits at 0 for any scrollY below charStartOffset — the character shows
  // up immediately (same fade-in as desktop, see JSX below) but holds on
  // its first frame until scroll actually reaches the trigger card, then
  // starts cycling through frames as you keep scrolling.
  useMotionValueEvent(animProgress, 'change', (p) => {
    setFrameIndex(Math.round(p * (FRAME_COUNT - 1)))
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
          <ParallaxBubble key={b.id} {...b} scrollY={scrollY} />
        ))}
      </motion.div>

      {/* Character animation — fades in as soon as frame 0 is decoded, same
          on mobile as desktop. It holds on that first frame until scroll
          reaches charStartOffset (see animProgress above), so it reads as
          "present in the background from the start, starts walking once
          you reach the target card" rather than popping in mid-scroll. */}
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
