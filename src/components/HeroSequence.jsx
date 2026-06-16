/**
 * HeroSequence.jsx — unified hero + scroll-driven PNG sequence
 *
 * Layer order (back → front)
 *   z:0    Solid blue background
 *   z:20   Parallax bubbles — different speed per bubble
 *   z:9999 PNG character — fixed at bottom of viewport, 80vw wide
 *
 * Scroll mapping (scrollYProgress 0 → 1)
 *   0.00–1.00  Frames 0–120 play as user scrolls through hero section
 *   0.03–0.20  Bubbles bloom in
 *
 * After the hero section ends, character stays fixed at the last frame,
 * overlapping the portfolio section below (pointer-events:none keeps
 * all portfolio interactions reachable).
 *
 * Assets
 *   /public/frames/frame_00000.png … frame_00120.png
 */

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

// ── Frame config ────────────────────────────────────────────────────
const FRAME_COUNT    = 121
const FRAME_PREFIX   = '/frames/frame_'
const FRAME_PAD      = 5
const SECTION_HEIGHT = '240vh'

function framePath(i) {
  return `${FRAME_PREFIX}${String(i).padStart(FRAME_PAD, '0')}.png`
}

function preloadAll() {
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image()
    img.src = framePath(i)
  }
}

const ALL_FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => framePath(i))

// ── Bubble data ─────────────────────────────────────────────────────
// All fully opaque — crisp glass with strong highlights.
// parallax: total px drift upward across full scroll (larger = faster)
const BUBBLES = [
  { id:  1, size: 300, x:  5, baseY: 22, parallax: -180, blur: 0, speed: 18 },
  { id:  2, size: 160, x: 81, baseY: 12, parallax: -260, blur: 4, speed: 22 },
  { id:  3, size: 220, x: 54, baseY: 64, parallax: -120, blur: 1, speed: 15 },
  { id:  4, size: 110, x: 17, baseY: 60, parallax: -310, blur: 6, speed: 25 },
  { id:  5, size: 340, x: 73, baseY: 50, parallax:  -90, blur: 0, speed: 20 },
  { id:  6, size:  95, x: 39, baseY: 22, parallax: -240, blur: 8, speed: 17 },
  { id:  7, size: 190, x: 90, baseY: 34, parallax: -150, blur: 2, speed: 23 },
  { id:  8, size: 145, x:  3, baseY: 76, parallax: -200, blur: 5, speed: 19 },
  { id:  9, size: 260, x: 46, baseY: 82, parallax:  -70, blur: 0, speed: 21 },
  { id: 10, size:  85, x: 63, baseY:  7, parallax: -280, blur: 7, speed: 16 },
  { id: 11, size: 175, x: 27, baseY: 42, parallax: -140, blur: 2, speed: 24 },
  { id: 12, size: 130, x: 84, baseY: 72, parallax: -210, blur: 4, speed: 18 },
]

/**
 * ParallaxBubble — own component so useTransform is called safely per element.
 *
 * Three-layer structure prevents CSS keyframe / Framer transform conflict:
 *   <div>       positioning (left/top + translate -50%,-50%)
 *     <motion.div>  Framer Motion parallax y
 *       <div>       CSS float animation (translateY only, no conflict)
 */
function ParallaxBubble({ size, x, baseY, parallax, blur, speed, scrollYProgress }) {
  const y = useTransform(scrollYProgress, [0, 1], [0, parallax])

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${baseY}%`,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}>
      <motion.div style={{ y }}>
        <div
          className="bubble-visual"
          style={{
            width: size,
            height: size,
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
            animationDuration: `${speed}s`,
          }}
        />
      </motion.div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────
export default function HeroSequence() {
  const sectionRef  = useRef(null)
  const [frameIndex, setFrameIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const bubbleOpacity = useTransform(scrollYProgress, [0.03, 0.20], [0, 1])
  const hintOpacity   = useTransform(scrollYProgress, [0, 0.08], [1, 0])

  useMotionValueEvent(scrollYProgress, 'change', (raw) => {
    const p = Math.max(0, Math.min(1, raw))
    setFrameIndex(Math.round(p * (FRAME_COUNT - 1)))
  })

  useEffect(() => { preloadAll() }, [])

  return (
    <section
      ref={sectionRef}
      className="hero-sequence"
      style={{ height: SECTION_HEIGHT }}
    >
      <div className="hero-sticky">
        {/* Layer 0 — solid blue base */}
        <div className="hero-bg" />

        {/* Layer 3 — parallax bubbles (z:20) */}
        <motion.div className="hero-bubbles" style={{ opacity: bubbleOpacity }}>
          {BUBBLES.map((b) => (
            <ParallaxBubble key={b.id} {...b} scrollYProgress={scrollYProgress} />
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.p className="scroll-hint" style={{ opacity: hintOpacity }}>
          scroll to continue ↓
        </motion.p>
      </div>

      {/*
       * Fixed character — position:fixed keeps it at the bottom of the
       * viewport throughout the entire page, including the portfolio section.
       * pointer-events:none means all portfolio clicks pass through.
       */}
      <div className="hero-char-track" aria-hidden="true">
        <img
          src={ALL_FRAMES[frameIndex]}
          alt=""
          className="hero-char-img"
          draggable={false}
        />
      </div>
    </section>
  )
}
