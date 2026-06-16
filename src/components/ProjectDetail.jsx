/**
 * ProjectDetail.jsx
 *
 * Full-screen glassmorphic overlay that opens when a portfolio card is clicked.
 * Rendered at App-root level (sibling of PortfolioSection) so position:fixed
 * works correctly even though PortfolioSection uses backdrop-filter.
 *
 * Layout
 * ┌──────────────────────────────────────────────────────────┐
 * │  [← Back]    Studio KAIL                           [×]  │  ← glass header
 * │  ─────────────────────────────────────────────────────  │
 * │  Category name                                           │  ← hero text
 * │  Tagline                                                 │
 * │                                                          │
 * │  ┌──────────────────┐  ┌──────────────────┐            │
 * │  │  VISUAL CARD     │  │  ABOUT CARD      │            │  ← 2×2 grid
 * │  │  (colour block)  │  │  (description)   │            │
 * │  ├──────────────────┤  ├──────────────────┤            │
 * │  │  STATS CARD      │  │  CTA CARD        │            │
 * │  │  (3 metrics)     │  │  (start project) │            │
 * │  └──────────────────┘  └──────────────────┘            │
 * └──────────────────────────────────────────────────────────┘
 */

import { motion } from 'framer-motion'

// ── Overlay entry / exit transitions ───────────────────────────────
const OVERLAY = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit:     { opacity: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
}

const CONTENT = {
  initial:  { opacity: 0, y: 28, scale: 0.97, filter: 'blur(8px)' },
  animate:  { opacity: 1, y:  0, scale: 1.00, filter: 'blur(0px)',
              transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.06 } },
  exit:     { opacity: 0, y: 12, scale: 0.98, filter: 'blur(6px)',
              transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
}

const CARD = {
  initial:  { opacity: 0, y: 20 },
  animate:  (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1], delay: 0.18 + i * 0.07 },
  }),
}

// ── Decorative rings for visual card ───────────────────────────────
function VisualCard({ cat }) {
  return (
    <motion.div
      className="pd-card pd-card--visual"
      custom={0}
      variants={CARD}
      style={{
        background: `linear-gradient(145deg, ${cat.accentDark} 0%, ${cat.accent} 55%, ${cat.accent}bb 100%)`,
      }}
    >
      {/* Decorative concentric rings */}
      <div className="pd-ring pd-ring--1" />
      <div className="pd-ring pd-ring--2" />
      <div className="pd-ring pd-ring--3" />

      {/* Giant category initial */}
      <span className="pd-vis-initial">{cat.id[0].toUpperCase()}</span>

      {/* Bottom label */}
      <div className="pd-vis-footer">
        <span className="pd-vis-label">Studio KAIL</span>
        <span className="pd-vis-sub">{cat.slides[0].label}</span>
      </div>
    </motion.div>
  )
}

function AboutCard({ cat }) {
  return (
    <motion.div className="pd-card pd-card--about" custom={1} variants={CARD}>
      <span className="pd-card-tag">About</span>
      <p className="pd-about-text">{cat.description}</p>
      <div className="pd-tags">
        {cat.slides.map((s) => (
          <span key={s.id} className="pd-tag" style={{ background: `${cat.accent}55`, color: cat.accentDark }}>
            {s.label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function StatsCard({ cat }) {
  return (
    <motion.div className="pd-card pd-card--stats" custom={2} variants={CARD}>
      <span className="pd-card-tag">Impact</span>
      <div className="pd-stats-row">
        {cat.stats.map((s) => (
          <div key={s.label} className="pd-stat">
            <span className="pd-stat-val" style={{ color: cat.accentDark }}>{s.value}</span>
            <span className="pd-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function CtaCard({ cat }) {
  return (
    <motion.div className="pd-card pd-card--cta" custom={3} variants={CARD}>
      <span className="pd-card-tag">Start Here</span>
      <p className="pd-cta-heading">Ready to build something exceptional?</p>
      <a
        href="mailto:hello@kail.studio"
        className="pd-cta-btn"
        style={{ background: cat.accentDark }}
      >
        Get in touch →
      </a>
    </motion.div>
  )
}

// ── Main overlay component ──────────────────────────────────────────
export default function ProjectDetail({ cat, onClose }) {
  return (
    <motion.div
      className="pd-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={cat.name}
      {...OVERLAY}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div className="pd-sheet" {...CONTENT}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="pd-header">
          <button className="pd-back" onClick={onClose} aria-label="Close">
            ← Back
          </button>
          <img src="/logo.svg" alt="Studio KAIL" className="pd-header-logo" />
          <button className="pd-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        {/* ── Hero text ───────────────────────────────────────────── */}
        <div className="pd-hero">
          <h1 className="pd-title">{cat.name}</h1>
          <p className="pd-tagline">{cat.tagline}</p>
        </div>

        {/* ── 2×2 card grid ───────────────────────────────────────── */}
        <motion.div className="pd-grid" initial="initial" animate="animate" exit="exit">
          <VisualCard cat={cat} />
          <AboutCard  cat={cat} />
          <StatsCard  cat={cat} />
          <CtaCard    cat={cat} />
        </motion.div>

      </motion.div>
    </motion.div>
  )
}
