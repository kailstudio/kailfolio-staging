/**
 * HeroSequence.jsx — scroll-driven character animation, split-screen layout
 *
 * No scroll scaffold — portfolio content is visible from the first frame.
 * Both panels (left content, right animation) load simultaneously.
 *
 * Layer order (back → front)
 *   app-bg     (z:-1)  Fixed aurora gradient — handled by App
 *   bubbles    (z:1)   Full-viewport parallax orbs — depth-layered by size
 *   split-left (z:2)   Left column solid bg — covers bubbles in content area
 *   char       (z:9999) Character animation — bottom-pinned, right panel
 *
 * Scroll driver
 *   useScroll() (window) — animProgress maps [0, 0.7] page scroll → [0, 1].
 *   Frames 0–120 advance as user scrolls; animation holds at frame 120 beyond 70%.
 *
 * Bubble ecosystem
 *   Full-viewport fixed layer with no overflow constraints.
 *   Each bubble has an independent parallax rate (size-inverse) and a
 *   horizontal drift for organic, spatial movement.
 *
 * Assets
 *   /public/frames/frame_00000.png … frame_00120.png  (character)
 */

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

// ── Character frame config ───────────────────────────────────────────
const FRAME_COUNT  = 121
const FRAME_PREFIX = `${import.meta.env.BASE_URL}frames/frame_`
const FRAME_PAD    = 5

function framePath(i) {
  return `${FRAME_PREFIX}${String(i).padStart(FRAME_PAD, '0')}.png`
}
function preloadAll() {
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image(); img.src = framePath(i)
  }
}
const ALL_FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => framePath(i))

// ── Bubble data ──────────────────────────────────────────────────────
// x / baseY are % of the full VIEWPORT (not a sub-panel).
// The bubbles panel is position:fixed; inset:0 so coordinates are viewport-relative.
// Three depth layers — parallax and drift are inversely proportional to size.
// drift: horizontal pixel offset at full scroll, creating organic lateral motion.
const BUBBLES = [
  // ── Background — large, glacially slow ────────────────────────────
  { id:  1, size: 360, x: 74, baseY: 42, parallax:  -35, drift:  12, blur: 0, speed: 22 },
  { id:  2, size: 295, x: 88, baseY: 18, parallax:  -48, drift:  -8, blur: 1, speed: 28 },
  { id:  3, size: 250, x: 62, baseY: 70, parallax:  -55, drift:  10, blur: 0, speed: 19 },

  // ── Midground — moderate speed and drift ──────────────────────────
  { id:  4, size: 200, x: 80, baseY: 58, parallax: -105, drift: -15, blur: 2, speed: 21 },
  { id:  5, size: 178, x: 67, baseY: 26, parallax: -118, drift:  18, blur: 3, speed: 24 },
  { id:  6, size: 215, x: 94, baseY: 64, parallax:  -92, drift:  -6, blur: 2, speed: 18 },
  { id:  7, size: 162, x: 72, baseY: 83, parallax: -128, drift:  12, blur: 3, speed: 26 },
  { id:  8, size: 188, x: 84, baseY:  9, parallax: -112, drift: -10, blur: 2, speed: 20 },

  // ── Foreground — small, fast, dynamic ─────────────────────────────
  { id:  9, size: 102, x: 70, baseY: 50, parallax: -198, drift:  22, blur: 5, speed: 17 },
  { id: 10, size:  78, x: 78, baseY: 14, parallax: -248, drift: -18, blur: 7, speed: 23 },
  { id: 11, size: 118, x: 92, baseY: 38, parallax: -178, drift:  14, blur: 4, speed: 20 },
  { id: 12, size:  65, x: 59, baseY: 87, parallax: -272, drift: -20, blur: 8, speed: 25 },
]

// ── ParallaxBubble ────────────────────────────────────────────────────
// Vertical: each bubble moves at its own parallax rate tied to scroll.
// Horizontal: each bubble drifts a unique amount as the page scrolls,
// giving the environment an organic, floating quality.
function ParallaxBubble({ size, x, baseY, blur, speed, parallax, drift = 0, scrollYProgress }) {
  const y  = useTransform(scrollYProgress, [0, 1], [0, parallax])
  const dx = useTransform(scrollYProgress, [0, 1], [0, drift])

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${baseY}%`,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}>
      <motion.div style={{ x: dx, y }}>
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
  const [frameIndex, setFrameIndex] = useState(0)

  // Window scroll drives the animation.
  // animProgress maps the first 1500 px of scroll → frames 0–120.
  // Pixel-based (scrollY) rather than page-relative (scrollYProgress)
  // gives a consistent ~5 s feel regardless of total page height.
  const { scrollY, scrollYProgress } = useScroll()
  const animProgress = useTransform(scrollY, [0, 3000], [0, 1], { clamp: true })

  useMotionValueEvent(animProgress, 'change', (p) => {
    setFrameIndex(Math.round(p * (FRAME_COUNT - 1)))
  })

  useEffect(() => { preloadAll() }, [])

  return (
    <>
      {/*
       * Bubble ecosystem — full-viewport fixed layer.
       * z:1 places it above the aurora (z:-1) but below the left portfolio
       * column (split-left z:2), so bubbles are visible only where the
       * aurora shows through (the right panel and beyond), never covering
       * the portfolio text or navigation.
       * overflow:visible (default) — no rectangular clipping boundary.
       */}
      <motion.div
        className="hero-bubbles-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.25 }}
      >
        {BUBBLES.map((b) => (
          <ParallaxBubble key={b.id} {...b} scrollYProgress={scrollYProgress} />
        ))}
      </motion.div>

      {/*
       * Character animation — position:fixed, bottom-pinned, right panel.
       * padding-right:10vw keeps the right edge 10 vw from the browser frame.
       * Fades in with a slight upward drift on load.
       */}
      <motion.div
        className="hero-char-track"
        aria-hidden="true"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        <img
          src={ALL_FRAMES[frameIndex]}
          alt=""
          className="hero-char-img"
          draggable={false}
        />
      </motion.div>
    </>
  )
}
