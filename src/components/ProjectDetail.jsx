/**
 * ProjectDetail.jsx — 8-card editorial bento grid
 *
 * Overlay structure (unchanged)
 *   pd-overlay → pd-sheet → pd-header | pd-hero | pd-grid-8
 *
 * Bento grid (3-col desktop, 2-col tablet, 1-col mobile)
 * ┌─────────────────────────┬───────────────┐
 * │                         │  Dark intro   │
 * │  Visual / Brand card    ├───────────────┤
 * │                         │  Deliverables │
 * ├──────────────────────┬──┴───────────────┤
 * │  About / Description │  Scope (blue)   │
 * ├──────────┬───────────┼─────────────────┤
 * │  Stat 1  │  Stat 2   │  CTA + Stat 3   │
 * └──────────┴───────────┴─────────────────┘
 */

import { motion } from 'framer-motion'

// ── Transitions ─────────────────────────────────────────────────────
const OVERLAY = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] } },
}

const CONTENT = {
  initial: { opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' },
  animate: { opacity: 1, y:  0, scale: 1.00, filter: 'blur(0px)',
             transition: { duration: 0.44, ease: [0.16, 1, 0.3, 1], delay: 0.06 } },
  exit:    { opacity: 0, y: 10, scale: 0.98, filter: 'blur(6px)',
             transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] } },
}

// Custom index controls stagger
const CARD = {
  initial: { opacity: 0, y: 16 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1], delay: 0.12 + i * 0.055 },
  }),
}

// ── Card 1 — Large visual brand anchor ─────────────────────────────
function VisualCard({ cat }) {
  return (
    <motion.div
      className="pdc pdc-visual"
      custom={0}
      variants={CARD}
      style={{
        background: `linear-gradient(148deg, ${cat.accentDark} 0%, ${cat.accent} 58%, ${cat.accent}bb 100%)`,
      }}
    >
      {/* Decorative concentric rings */}
      <div className="pdc-ring pdc-ring--1" />
      <div className="pdc-ring pdc-ring--2" />
      <div className="pdc-ring pdc-ring--3" />

      {/* Ghost initial */}
      <span className="pdc-initial">{cat.id[0].toUpperCase()}</span>

      {/* Bottom identity label */}
      <div className="pdc-visual-footer">
        <span className="pdc-visual-studio">Studio KAIL</span>
        <span className="pdc-visual-service">{cat.slides[0].label}</span>
      </div>
    </motion.div>
  )
}

// ── Card 2 — Dark atmospheric intro ────────────────────────────────
function DarkIntroCard({ cat }) {
  return (
    <motion.div className="pdc pdc-dark" custom={1} variants={CARD}>
      <span className="pdc-dark-pill">Studio KAIL</span>
      <span className="pdc-dark-star" style={{ color: cat.accent }}>✦</span>
      <p className="pdc-dark-text">{cat.tagline}</p>
    </motion.div>
  )
}

// ── Card 3 — Deliverables tag cloud ────────────────────────────────
function DeliverablesCard({ cat }) {
  return (
    <motion.div className="pdc pdc-tags" custom={2} variants={CARD}>
      <span className="pdc-eyebrow">Deliverables</span>
      <div className="pdc-chips">
        {cat.slides.map((s) => (
          <span
            key={s.id}
            className="pdc-chip"
            style={{ color: cat.accentDark, background: `${cat.accent}28` }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// ── Card 4 — Full description (spans 2 cols) ────────────────────────
function AboutCard({ cat }) {
  return (
    <motion.div className="pdc pdc-about" custom={3} variants={CARD}>
      <span className="pdc-eyebrow">About</span>
      <p className="pdc-about-body">{cat.description}</p>
    </motion.div>
  )
}

// ── Card 5 — Scope / approach list (blue) ──────────────────────────
function ScopeCard({ cat }) {
  return (
    <motion.div className="pdc pdc-scope" custom={4} variants={CARD}>
      <span className="pdc-eyebrow pdc-eyebrow--light">Our Scope</span>
      <ul className="pdc-scope-list">
        {cat.slides.map((s, i) => (
          <li key={s.id} className="pdc-scope-item">
            <span className="pdc-scope-num">0{i + 1}</span>
            {s.label}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

// ── Card 6 — Stat 1 (light) ─────────────────────────────────────────
function StatLightCard({ cat }) {
  const s = cat.stats[0]
  return (
    <motion.div className="pdc pdc-stat-lt" custom={5} variants={CARD}>
      <span className="pdc-eyebrow">Impact</span>
      <span className="pdc-big-num" style={{ color: cat.accentDark }}>{s.value}</span>
      <span className="pdc-stat-label">{s.label}</span>
    </motion.div>
  )
}

// ── Card 7 — Stat 2 (dark) ──────────────────────────────────────────
function StatDarkCard({ cat }) {
  const s = cat.stats[1]
  return (
    <motion.div className="pdc pdc-stat-dk" custom={6} variants={CARD}>
      <span className="pdc-eyebrow pdc-eyebrow--light">Result</span>
      <span className="pdc-big-num pdc-big-num--white">{s.value}</span>
      <span className="pdc-stat-label pdc-stat-label--muted">{s.label}</span>
    </motion.div>
  )
}

// ── Card 8 — CTA (lime) + Stat 3 ────────────────────────────────────
function CtaCard({ cat }) {
  const s = cat.stats[2]
  return (
    <motion.div className="pdc pdc-cta" custom={7} variants={CARD}>
      {/* Third stat at top */}
      <span className="pdc-cta-stat-val">{s.value}</span>
      <span className="pdc-cta-stat-lbl">{s.label}</span>

      <div className="pdc-cta-divider" />

      <p className="pdc-cta-heading">
        Ready to build something exceptional?
      </p>

      {/* Arrow CTA link */}
      <a
        href="mailto:hello@kail.studio"
        className="pdc-cta-arrow-btn"
        aria-label="Get in touch with Studio KAIL"
      >
        ↗
      </a>
    </motion.div>
  )
}

// ── Main overlay ────────────────────────────────────────────────────
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

        {/* ── Header (unchanged) ─────────────────────────────────── */}
        <header className="pd-header">
          <button className="pd-back" onClick={onClose} aria-label="Close">
            ← Back
          </button>
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Studio KAIL"
            className="pd-header-logo"
          />
          <button className="pd-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        {/* ── Hero text (unchanged) ──────────────────────────────── */}
        <div className="pd-hero">
          <h1 className="pd-title">{cat.name}</h1>
          <p className="pd-tagline">{cat.tagline}</p>
        </div>

        {/* ── 8-card bento grid ──────────────────────────────────── */}
        <motion.div
          className="pd-grid-8"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <VisualCard        cat={cat} />
          <DarkIntroCard     cat={cat} />
          <DeliverablesCard  cat={cat} />
          <AboutCard         cat={cat} />
          <ScopeCard         cat={cat} />
          <StatLightCard     cat={cat} />
          <StatDarkCard      cat={cat} />
          <CtaCard           cat={cat} />
        </motion.div>

      </motion.div>
    </motion.div>
  )
}
