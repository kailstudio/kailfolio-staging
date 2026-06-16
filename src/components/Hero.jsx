import { motion, useScroll, useTransform } from 'framer-motion'

const BUBBLE_DATA = [
  { id: 1,  size: 220, x: 8,   y: 15,  delay: 0.0, speed: 18 },
  { id: 2,  size: 140, x: 80,  y: 10,  delay: 0.1, speed: 22 },
  { id: 3,  size: 180, x: 55,  y: 70,  delay: 0.2, speed: 15 },
  { id: 4,  size: 100, x: 20,  y: 65,  delay: 0.3, speed: 25 },
  { id: 5,  size: 260, x: 75,  y: 55,  delay: 0.4, speed: 20 },
  { id: 6,  size: 90,  x: 40,  y: 20,  delay: 0.5, speed: 17 },
  { id: 7,  size: 160, x: 92,  y: 30,  delay: 0.6, speed: 23 },
  { id: 8,  size: 120, x: 5,   y: 80,  delay: 0.7, speed: 19 },
  { id: 9,  size: 200, x: 50,  y: 88,  delay: 0.8, speed: 21 },
  { id: 10, size: 80,  x: 65,  y: 8,   delay: 0.9, speed: 16 },
  { id: 11, size: 150, x: 30,  y: 45,  delay: 1.0, speed: 24 },
  { id: 12, size: 110, x: 85,  y: 78,  delay: 1.1, speed: 18 },
]

function Bubble({ size, x, y, delay, speed }) {
  return (
    <div
      className="bubble"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${speed}s`,
      }}
    />
  )
}

export default function Hero({ containerRef }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Logo fades + lifts as user scrolls out of hero
  const logoOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const logoScale   = useTransform(scrollYProgress, [0, 0.3], [1, 0.88])
  const logoY       = useTransform(scrollYProgress, [0, 0.3], [0, -50])

  // Bubbles bloom in as user scrolls
  const bubbleOpacity = useTransform(scrollYProgress, [0.04, 0.22], [0, 1])

  return (
    <section className="hero">
      {/* ── Bubbles (behind the logo, below z-index 10) ── */}
      <motion.div className="bubbles-container" style={{ opacity: bubbleOpacity }}>
        {BUBBLE_DATA.map((b) => (
          <Bubble key={b.id} {...b} />
        ))}
      </motion.div>

      {/* ── Official Studio KAIL logo ── */}
      <motion.div
        className="hero-logo"
        style={{ opacity: logoOpacity, scale: logoScale, y: logoY }}
      >
        {/*
         * SVG rendered as <img> — preserves transparency, crisp at all
         * sizes, and needs no extra bundler config.
         * Logo colour (#d4c7ff lavender) reads beautifully on blue.
         */}
        <img
          src="/logo.svg"
          alt="Studio KAIL"
          className="hero-logo-img"
          draggable={false}
        />
      </motion.div>
    </section>
  )
}
