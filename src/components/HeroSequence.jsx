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
// x / baseY are % of the full VIEWPORT.  Panel is position:fixed; inset:0.
//
// Design rules:
//  • Bubbles span x: 8–88 % — centres stay inside viewport so overflow:hidden
//    on the panel never clips an orb mid-body (even with parallax drift).
//  • Left side  (x ≤ 44 %) : atmosphere behind the glassmorphism portfolio panel.
//  • Right side (x ≥ 56 %) : more visible, behind the character animation.
//  • Centre band (x 44–56 %): subtle linking presence.
//  • Three depth layers: bg (large, slow), mid (medium), fg (small, fast).
//    parallax and drift scale inversely with size for natural depth.
const BUBBLES = [
  // ── Background — large, glacially slow — balanced L / R ───────────
  { id:  1, size: 320, x:  9, baseY: 33, parallax:  -28, drift:   6, blur: 0, speed: 24 }, // far-left
  { id:  2, size: 300, x: 77, baseY: 46, parallax:  -32, drift:  10, blur: 0, speed: 26 }, // right
  { id:  3, size: 265, x: 88, baseY: 16, parallax:  -44, drift:  -7, blur: 1, speed: 29 }, // far-right
  { id:  4, size: 240, x: 30, baseY: 74, parallax:  -38, drift:   9, blur: 0, speed: 21 }, // left-center

  // ── Midground — moderate speed and drift ──────────────────────────
  { id:  5, size: 188, x: 20, baseY: 54, parallax:  -95, drift: -11, blur: 2, speed: 22 }, // left
  { id:  6, size: 168, x: 44, baseY: 19, parallax: -108, drift:  14, blur: 2, speed: 25 }, // center-left
  { id:  7, size: 200, x: 82, baseY: 62, parallax:  -98, drift: -13, blur: 2, speed: 22 }, // right
  { id:  8, size: 172, x: 66, baseY: 27, parallax: -112, drift:  16, blur: 3, speed: 25 }, // center-right
  { id:  9, size: 185, x: 55, baseY: 82, parallax: -120, drift:  11, blur: 2, speed: 27 }, // center-low

  // ── Foreground — small, fast, dynamic — both sides ────────────────
  { id: 10, size:  88, x: 12, baseY: 78, parallax: -200, drift:  18, blur: 5, speed: 18 }, // far-left
  { id: 11, size:  72, x: 37, baseY: 46, parallax: -232, drift: -13, blur: 6, speed: 24 }, // center-left
  { id: 12, size: 104, x: 50, baseY: 14, parallax: -178, drift:   9, blur: 4, speed: 20 }, // center-top
  { id: 13, size:  96, x: 72, baseY: 51, parallax: -190, drift:  20, blur: 5, speed: 18 }, // right
  { id: 14, size:  74, x: 82, baseY: 12, parallax: -238, drift: -16, blur: 7, speed: 24 }, // right-top
  { id: 15, size: 110, x: 88, baseY: 38, parallax: -170, drift:  12, blur: 4, speed: 21 }, // far-right-mid
  { id: 16, size:  60, x: 62, baseY: 91, parallax: -260, drift: -18, blur: 8, speed: 26 }, // center-low
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
