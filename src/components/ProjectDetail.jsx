/**
 * ProjectDetail.jsx — Project detail overlay
 *
 * Two modes:
 *  1. 8-card bento grid  — default for category-level cards
 *  2. Premium case study — when slide.caseStudy is present
 */

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { PDFFlipbook } from './PDFFlipbook'

// ── Transitions ──────────────────────────────────────────────────────
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

const CARD = {
  initial: { opacity: 0, y: 16 },
  animate: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1], delay: 0.12 + i * 0.055 },
  }),
}

// ── CBS brand palette ────────────────────────────────────────────────
const CBS = {
  espresso: '#332824',
  cream:    '#F9F0E6',
  blue:     '#86A3B3',
  mint:     '#B1D1CE',
  peach:    '#F9C595',
}

// ═══════════════════════════════════════════════════════════════════════
//  UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

// 16-ray sunburst SVG (the CBS logo mark)
function SunburstSVG({ size = 120, color = '#F9F0E6' }) {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2
    return {
      x1: 100 + 22 * Math.cos(a), y1: 100 + 22 * Math.sin(a),
      x2: 100 + 78 * Math.cos(a), y2: 100 + 78 * Math.sin(a),
    }
  })
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      {rays.map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
          stroke={color} strokeWidth="4.5" strokeLinecap="round" />
      ))}
      <circle cx="100" cy="100" r="10" fill={color} />
    </svg>
  )
}

// Animated counter — counts up when scrolled into view
function Counter({ to, suffix = '', prefix = '' }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [val, setVal] = useState(0)
  const target = parseInt(to)
  const isNum  = !isNaN(target)

  useEffect(() => {
    if (!inView || !isNum) return
    const dur = 1600
    const t0  = performance.now()
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(e * target))
      if (p < 1) requestAnimationFrame(tick)
      else setVal(target)
    }
    requestAnimationFrame(tick)
  }, [inView, target, isNum])

  return <span ref={ref}>{prefix}{isNum ? val : to}{suffix}</span>
}

// Scroll-reveal motion wrapper
function Reveal({ children, delay = 0, className }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// Section wrapper with numbered label + title
function CSSection({ label, title, children, variant = 'light', className }) {
  const cls = ['cs-section', `cs-section--${variant}`, className].filter(Boolean).join(' ')
  return (
    <section className={cls}>
      {(label || title) && (
        <Reveal>
          <div className="cs-section-header">
            {label && <span className="cs-section-num">{label}</span>}
            {title && <h2 className="cs-section-title">{title}</h2>}
          </div>
        </Reveal>
      )}
      {children}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  EXISTING BENTO-GRID CARDS (non-case-study projects)
// ═══════════════════════════════════════════════════════════════════════

function VisualCard({ cat }) {
  return (
    <motion.div className="pdc pdc-visual" custom={0} variants={CARD}
      style={{ background: `linear-gradient(148deg, ${cat.accentDark} 0%, ${cat.accent} 58%, ${cat.accent}bb 100%)` }}>
      <div className="pdc-ring pdc-ring--1" />
      <div className="pdc-ring pdc-ring--2" />
      <div className="pdc-ring pdc-ring--3" />
      <span className="pdc-initial">{cat.id[0].toUpperCase()}</span>
      <div className="pdc-visual-footer">
        <span className="pdc-visual-studio">Studio KAIL</span>
        <span className="pdc-visual-service">{cat.slides[0].label}</span>
      </div>
    </motion.div>
  )
}

function DarkIntroCard({ cat }) {
  return (
    <motion.div className="pdc pdc-dark" custom={1} variants={CARD}>
      <span className="pdc-dark-pill">Studio KAIL</span>
      <span className="pdc-dark-star" style={{ color: cat.accent }}>✦</span>
      <p className="pdc-dark-text">{cat.tagline}</p>
    </motion.div>
  )
}

function DeliverablesCard({ cat }) {
  return (
    <motion.div className="pdc pdc-tags" custom={2} variants={CARD}>
      <span className="pdc-eyebrow">Deliverables</span>
      <div className="pdc-chips">
        {cat.slides.map((s) => (
          <span key={s.id} className="pdc-chip"
            style={{ color: cat.accentDark, background: `${cat.accent}28` }}>{s.label}</span>
        ))}
      </div>
    </motion.div>
  )
}

function AboutCard({ cat }) {
  return (
    <motion.div className="pdc pdc-about" custom={3} variants={CARD}>
      <span className="pdc-eyebrow">About</span>
      <p className="pdc-about-body">{cat.description}</p>
    </motion.div>
  )
}

function ScopeCard({ cat }) {
  return (
    <motion.div className="pdc pdc-scope" custom={4} variants={CARD}>
      <span className="pdc-eyebrow pdc-eyebrow--light">Our Scope</span>
      <ul className="pdc-scope-list">
        {cat.slides.map((s, i) => (
          <li key={s.id} className="pdc-scope-item">
            <span className="pdc-scope-num">0{i + 1}</span>{s.label}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

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

function CtaCard({ cat }) {
  const s = cat.stats[2]
  return (
    <motion.div className="pdc pdc-cta" custom={7} variants={CARD}>
      <span className="pdc-cta-stat-val">{s.value}</span>
      <span className="pdc-cta-stat-lbl">{s.label}</span>
      <div className="pdc-cta-divider" />
      <p className="pdc-cta-heading">Ready to build something exceptional?</p>
      <a href="mailto:hello@kail.studio" className="pdc-cta-arrow-btn" aria-label="Get in touch">↗</a>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  PREMIUM CASE STUDY SECTIONS
// ═══════════════════════════════════════════════════════════════════════

// ── 01 Hero ─────────────────────────────────────────────────────────
function CSHero({ cs, slide }) {
  return (
    <div className="cs-hero">
      <Reveal delay={0.04}>
        <div className="cs-hero-pills">
          {(slide.tags || []).map((t) => (
            <span key={t} className="cs-hero-pill">{t}</span>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <h1 className="cs-hero-title">{slide.label}</h1>
        <p className="cs-hero-subtitle">{cs.subtitle}</p>
      </Reveal>

      <Reveal delay={0.18}>
        <div className="cs-hero-visual">
          <div className="cs-hero-img">
            <div className="cs-hero-img-bg">
              <SunburstSVG size={220} color={CBS.cream} />
              <p className="cs-ph-label">Brand Identity System — Care-Based Safety</p>
            </div>
          </div>
          <div className="cs-float cs-float--tl">
            <span className="cs-float-l">Client</span>
            <span className="cs-float-v">Care-Based Safety</span>
          </div>
          <div className="cs-float cs-float--tr">
            <span className="cs-float-l">Year</span>
            <span className="cs-float-v">{cs.year}</span>
          </div>
          <div className="cs-float cs-float--bl">
            <span className="cs-float-l">Duration</span>
            <span className="cs-float-v">{cs.duration}</span>
          </div>
          <div className="cs-float cs-float--br">
            <span className="cs-float-l">Location</span>
            <span className="cs-float-v">Michigan, USA</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.28}>
        <div className="cs-hero-status">
          <span className="cs-status-dot" />
          <span className="cs-status-text">{cs.status}</span>
        </div>
      </Reveal>
    </div>
  )
}

// ── 02 Project Overview Bento ────────────────────────────────────────
function CSOverview({ cs }) {
  return (
    <CSSection label="01" title="Project Overview">
      <div className="cs-bento">
        <Reveal delay={0.08} className="cs-bc cs-bc--wide cs-bc--dark">
          <span className="cs-bc-eye">Overview</span>
          <p className="cs-bc-body cs-bc-body--light">
            A community-rooted organisation in Washtenaw County, Michigan — building and advocating for non-police crisis response, prevention-first systems, and community-led approaches to public safety grounded in abolitionist principles.
          </p>
          <div className="cs-bc-tag">Abolitionist · Community-led · Prevention-first</div>
        </Reveal>

        <Reveal delay={0.13} className="cs-bc cs-bc--peach">
          <span className="cs-bc-eye">The Problem</span>
          <h3 className="cs-bc-head">The brand hadn't caught up with the conviction.</h3>
        </Reveal>

        <Reveal delay={0.18} className="cs-bc cs-bc--mint">
          <span className="cs-bc-eye">The Solution</span>
          <h3 className="cs-bc-head">A complete identity system — built from first principles.</h3>
        </Reveal>

        <Reveal delay={0.23} className="cs-bc cs-bc--glass">
          <span className="cs-bc-eye">My Role</span>
          <h3 className="cs-bc-head">Brand Strategist + Creative Director</h3>
          <p className="cs-bc-sub">End-to-end across 6 phases</p>
        </Reveal>

        <Reveal delay={0.28} className="cs-bc cs-bc--wide cs-bc--cream">
          <span className="cs-bc-eye">Key Outcome</span>
          <h3 className="cs-bc-head cs-bc-head--lg">
            A brand system capable of carrying the same conviction — with the same warmth and clarity — across radically different rooms.
          </h3>
        </Reveal>
      </div>
    </CSSection>
  )
}

// ── 03 The Brief ─────────────────────────────────────────────────────
const BRIEF_CARDS = [
  { icon: '⌘', title: 'The Challenge', body: 'Build a brand for radically different rooms — from someone reaching out in crisis to a government funding partner.' },
  { icon: '◎', title: 'User Needs', body: 'Warmth and directness for community members. Rigour and credibility for funders. Results-led clarity for government.' },
  { icon: '✦', title: 'Business Goals', body: 'Six structured phases. A complete visual system. Deployable immediately across every touchpoint — social, print, digital, campaign.' },
  { icon: '◈', title: 'Success Metrics', body: 'Same conviction. Same warmth. Same clarity — whether the audience is a funder in a boardroom or a person reaching out for help.' },
]

function CSBrief({ cs }) {
  const brief = cs.sections.find((s) => s.id === 'brief')
  const lead  = brief?.body?.split('\n\n')[0] ?? ''
  return (
    <CSSection label="02" title="The Brief" variant="accent">
      <Reveal delay={0.08}>
        <p className="cs-lead">{lead}</p>
      </Reveal>
      <div className="cs-brief-grid">
        {BRIEF_CARDS.map(({ icon, title, body }, i) => (
          <Reveal key={title} delay={0.1 + i * 0.07} className="cs-brief-card">
            <span className="cs-brief-icon">{icon}</span>
            <h4 className="cs-brief-title">{title}</h4>
            <p className="cs-brief-body">{body}</p>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── 04 Research & Strategy ───────────────────────────────────────────
const TRAITS = ['Abolitionist', 'Compassionate', 'Imaginative', 'Co-created', 'Trustworthy', 'Calm but firm', 'Relational']

function CSStrategy({ cs }) {
  const strategy = cs.sections.find((s) => s.id === 'strategy')
  const lead = strategy?.body?.split('\n\n')[0] ?? ''
  return (
    <CSSection label="03" title="Research & Strategy">
      <Reveal delay={0.08}>
        <p className="cs-lead cs-lead--sm">{lead}</p>
      </Reveal>
      <div className="cs-strategy-grid">
        <Reveal delay={0.12} className="cs-strat-card cs-strat-card--dark">
          <span className="cs-strat-label">Discovery</span>
          <h4 className="cs-strat-head">Existing materials, communications + competitor landscape.</h4>
          <p className="cs-strat-body">Key insight: step entirely outside the iconographic vocabulary of conventional public safety.</p>
        </Reveal>
        <Reveal delay={0.18} className="cs-strat-card cs-strat-card--tiers">
          <span className="cs-strat-label">3 Audience Tiers</span>
          <div className="cs-tier-list">
            {[
              { n: '01', head: 'Community Members', body: 'Direct, plain, with care. Meeting people where they are.' },
              { n: '02', head: 'Funders & Activists', body: 'Values connected to measurable outcomes.' },
              { n: '03', head: 'Government & Public', body: 'Results-led. Care as common sense, not ideology.' },
            ].map(({ n, head, body }) => (
              <div key={n} className="cs-tier">
                <span className="cs-tier-n">{n}</span>
                <div><strong>{head}</strong><p>{body}</p></div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.24} className="cs-strat-card cs-strat-card--light">
          <span className="cs-strat-label">Brand Personality</span>
          <div className="cs-trait-cloud">
            {TRAITS.map((t) => <span key={t} className="cs-trait">{t}</span>)}
          </div>
          <p className="cs-strat-body" style={{ marginTop: 14 }}>Calm but firm. Relational, not institutional.</p>
        </Reveal>
      </div>
    </CSSection>
  )
}

// ── 05 Visual Identity ───────────────────────────────────────────────
function CSVisualIdentity({ cs }) {
  const visual = cs.sections.find((s) => s.id === 'visual')
  const logo   = visual?.subsections?.[0]
  const colour = visual?.subsections?.[1]
  const palette = [
    { hex: CBS.espresso, name: 'Espresso',   usage: 'Primary anchor — authority, depth' },
    { hex: CBS.cream,    name: 'Warm Cream', usage: 'Primary ground — warmth, openness' },
    { hex: CBS.blue,     name: 'Steel Blue', usage: 'Trust, calm, secondary voice' },
    { hex: CBS.mint,     name: 'Soft Mint',  usage: 'Growth, care, optimism' },
    { hex: CBS.peach,    name: 'Warm Peach', usage: 'Warmth, celebration, energy' },
  ]
  return (
    <CSSection label="04" title="Visual Identity" variant="dark">
      <Reveal delay={0.1} className="cs-logo-showcase">
        <div className="cs-logo-visual">
          <div className="cs-logo-ring"><SunburstSVG size={160} color={CBS.cream} /></div>
          <div className="cs-logo-wordmark">
            <span className="cs-logo-name" style={{ color: CBS.cream }}>Care-Based Safety</span>
            <span className="cs-logo-tag" style={{ color: CBS.mint }}>Safety is relational.</span>
          </div>
        </div>
        <div className="cs-logo-copy">
          <h4 className="cs-vi-sub" style={{ color: CBS.mint }}>The Mark</h4>
          <p className="cs-vi-body" style={{ color: CBS.cream + 'cc' }}>{logo?.body?.substring(0, 320)}...</p>
          <div className="cs-logo-specs">
            {['16 rays', 'Circular grid', 'Hand-drawn strokes', 'Community at centre'].map((s) => (
              <span key={s} className="cs-logo-spec">{s}</span>
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.14}>
        <div className="cs-vi-divider" />
        <h4 className="cs-vi-sub" style={{ color: CBS.mint, marginBottom: 8 }}>Colour Palette</h4>
        <p className="cs-vi-body" style={{ color: CBS.cream + 'cc', marginBottom: 28 }}>{colour?.body?.split('.')[0]}.</p>
        <div className="cs-palette">
          {palette.map(({ hex, name, usage }, i) => (
            <Reveal key={hex} delay={0.06 + i * 0.06} className="cs-swatch-card">
              <div className="cs-swatch-colour" style={{ background: hex, border: hex === '#F9F0E6' ? '1px solid rgba(255,255,255,0.15)' : 'none' }} />
              <div className="cs-swatch-info">
                <span className="cs-swatch-hex">{hex}</span>
                <span className="cs-swatch-name">{name}</span>
                <span className="cs-swatch-usage">{usage}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.2} className="cs-type-card">
        <h4 className="cs-vi-sub" style={{ color: CBS.mint }}>Typography</h4>
        <div className="cs-type-rows">
          <div className="cs-type-row">
            <span className="cs-type-demo cs-type-demo--bold" style={{ color: CBS.cream }}>Aa</span>
            <div>
              <strong style={{ color: CBS.cream }}>Montserrat SemiBold</strong>
              <p style={{ color: CBS.cream + '88', fontSize: 13 }}>Headers — confidence, structural clarity</p>
            </div>
          </div>
          <div className="cs-type-row">
            <span className="cs-type-demo cs-type-demo--light" style={{ color: CBS.cream }}>Aa</span>
            <div>
              <strong style={{ color: CBS.cream }}>Montserrat Light</strong>
              <p style={{ color: CBS.cream + '88', fontSize: 13 }}>Body — openness, 6th-grade accessibility</p>
            </div>
          </div>
        </div>
        <p className="cs-type-sample" style={{ color: CBS.cream + '66' }}>"Safety is relational. It grows through care, connection, and shared power."</p>
      </Reveal>
    </CSSection>
  )
}

// ── 06 Process Timeline ──────────────────────────────────────────────
const PHASES = [
  { n: '01', name: 'Discovery',         desc: 'Brand audit, audience mapping, competitive landscape' },
  { n: '02', name: 'Logo Development',  desc: 'Two creative directions — Beam selected and refined' },
  { n: '03', name: 'Colour & Type',     desc: 'Earthy palette finalised, Montserrat system set' },
  { n: '04', name: 'Imagery',           desc: 'Illustration style, photography direction, icon system' },
  { n: '05', name: 'Voice & Messaging', desc: 'Messaging architecture, tone of voice, campaign lines' },
  { n: '06', name: 'Handover',          desc: 'Brand guidelines, all assets, complete file delivery' },
]

function CSTimeline() {
  return (
    <CSSection title="Our Process" variant="light">
      <div className="cs-timeline">
        {PHASES.map(({ n, name, desc }, i) => (
          <Reveal key={n} delay={0.06 + i * 0.07} className="cs-tl-item">
            <div className="cs-tl-connector" aria-hidden="true" />
            <div className="cs-tl-dot"><span>{n}</span></div>
            <div className="cs-tl-body">
              <h4 className="cs-tl-name">{name}</h4>
              <p className="cs-tl-desc">{desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── 07 Gallery ───────────────────────────────────────────────────────
const GALLERY_ITEMS = [
  { label: 'Brand Identity Overview',           cls: 'wide', ph: 1 },
  { label: 'Logo Exploration — Beam Direction', cls: 'tall', ph: 2 },
  { label: 'Colour System Application',         cls: 'std',  ph: 3 },
  { label: 'Social Media Templates',            cls: 'std',  ph: 4 },
  { label: 'Community Resource Print',          cls: 'std',  ph: 5 },
  { label: 'Website Direction',                 cls: 'wide', ph: 6 },
  { label: 'Photography Direction',             cls: 'std',  ph: 2 },
  { label: 'Illustration System',               cls: 'std',  ph: 3 },
]

function CSGallery() {
  return (
    <CSSection label="05" title="Brand in Context">
      <div className="cs-gallery">
        {GALLERY_ITEMS.map(({ label, cls, ph }, i) => (
          <Reveal key={label} delay={0.04 + i * 0.04}
            className={`cs-gal-item cs-gal-item--${cls} cs-ph-${ph}`}>
            <span className="cs-gal-label">{label}</span>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── 08 Impact Stats ──────────────────────────────────────────────────
const IMPACT_STATS = [
  { to: '6',   suffix: '',     label: 'Phases completed',      desc: 'End-to-end delivery' },
  { to: '5',   suffix: '',     label: 'Brand colours',          desc: 'Earthy & natural palette' },
  { to: '16',  suffix: ' ray', label: 'Sunburst mark',          desc: 'Precision geometry' },
  { to: '3',   suffix: '',     label: 'Audience tiers',         desc: 'Community · Funders · Govt' },
  { to: '120', suffix: '+',    label: 'Brand assets delivered', desc: 'Ready for immediate use' },
  { to: '1',   suffix: ' mo',  label: 'Timeline',               desc: 'Concept to guidelines' },
]

function CSImpact() {
  return (
    <CSSection label="06" title="Outcomes" variant="dark">
      <div className="cs-impact-grid">
        {IMPACT_STATS.map(({ to, suffix, label, desc }, i) => (
          <Reveal key={label} delay={0.06 + i * 0.07} className="cs-impact-card">
            <div className="cs-impact-num" style={{ color: CBS.peach }}>
              <Counter to={to} suffix={suffix} />
            </div>
            <div className="cs-impact-label" style={{ color: CBS.cream }}>{label}</div>
            <div className="cs-impact-desc" style={{ color: CBS.cream + '55' }}>{desc}</div>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── 09 Brand Guidelines Flipbook ─────────────────────────────────────
const BOOK_PAGES = [
  {
    bg: CBS.espresso, color: CBS.cream,
    content: (
      <div className="cs-book-cover">
        <SunburstSVG size={72} color="#F9F0E6" />
        <h3>Care-Based Safety</h3>
        <p>Brand Guidelines</p>
        <span>2024 Edition</span>
      </div>
    ),
  },
  {
    bg: CBS.cream, color: CBS.espresso,
    content: (
      <div className="cs-book-inner">
        <span className="cs-book-pg">02</span>
        <h4>Our Mission</h4>
        <p>Building and advocating for non-police crisis response, prevention-first systems, and community-led approaches to public safety rooted in care.</p>
      </div>
    ),
  },
  {
    bg: '#ffffff', color: CBS.espresso,
    content: (
      <div className="cs-book-inner">
        <span className="cs-book-pg">03</span>
        <h4>The Logo</h4>
        <div style={{ margin: '12px 0' }}><SunburstSVG size={52} color={CBS.espresso} /></div>
        <p>16 rays. Precision geometry. Hand-drawn strokes. Community at the centre.</p>
      </div>
    ),
  },
  {
    bg: CBS.mint, color: CBS.espresso,
    content: (
      <div className="cs-book-inner">
        <span className="cs-book-pg">04</span>
        <h4>Colour Palette</h4>
        <div className="cs-book-swatches">
          {[CBS.espresso, CBS.cream, CBS.blue, CBS.mint, CBS.peach].map((hex) => (
            <div key={hex} style={{ background: hex, width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
          ))}
        </div>
        <p>Earthy and Natural — stability and warmth, never clinical.</p>
      </div>
    ),
  },
  {
    bg: CBS.cream, color: CBS.espresso,
    content: (
      <div className="cs-book-inner">
        <span className="cs-book-pg">05</span>
        <h4>Typography</h4>
        <div style={{ fontSize: 24, fontWeight: 600, margin: '10px 0 4px' }}>Montserrat SemiBold</div>
        <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>Montserrat Light — body text at 6th-grade reading level</div>
      </div>
    ),
  },
  {
    bg: CBS.espresso, color: CBS.cream,
    content: (
      <div className="cs-book-inner">
        <span className="cs-book-pg" style={{ color: CBS.cream + '55' }}>06</span>
        <h4>Brand Voice</h4>
        <div className="cs-book-lines">
          <p>"Care keeps communities safe."</p>
          <p>"Safety is relational."</p>
          <p>"You deserve care, not punishment."</p>
        </div>
      </div>
    ),
  },
]

function CSFlipbook() {
  const pdfUrl = `${import.meta.env.BASE_URL}guidelines/cbs-guidelines.pdf`
  return (
    <CSSection label="07" title="Brand Guidelines" variant="light">
      <Reveal delay={0.1}>
        <PDFFlipbook
          pdfUrl={pdfUrl}
          title="Care-Based Safety — Brand Guidelines"
          accentColor={CBS.espresso}
          totalHint={17}
        />
        <p className="cs-book-note" style={{ marginTop: 12 }}>
          Drop <code>cbs-guidelines.pdf</code> into <code>public/guidelines/</code> to activate · CBS brand system 2024
        </p>
      </Reveal>
    </CSSection>
  )
}

// ── CBS Flipbook (legacy inline pages, kept as fallback) ─────────────
function CSFlipbookLegacy() {
  const [page, setPage] = useState(0)
  const [dir,  setDir]  = useState(1)

  const go = (d) => {
    const next = page + d
    if (next < 0 || next >= BOOK_PAGES.length) return
    setDir(d)
    setPage(next)
  }

  const current = BOOK_PAGES[page]

  return (
    <CSSection label="07" title="Brand Guidelines" variant="light">
      <Reveal delay={0.1} className="cs-flipbook">
        <div className="cs-book-viewer">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={page}
              className="cs-book-page"
              style={{ background: current.bg, color: current.color }}
              initial={{ opacity: 0, x: dir * 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -36 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {current.content}
            </motion.div>
          </AnimatePresence>
          <button className="cs-book-btn cs-book-btn--prev" onClick={() => go(-1)} disabled={page === 0} aria-label="Previous">&#8249;</button>
          <button className="cs-book-btn cs-book-btn--next" onClick={() => go(1)} disabled={page === BOOK_PAGES.length - 1} aria-label="Next">&#8250;</button>
        </div>
        <div className="cs-book-thumbs">
          {BOOK_PAGES.map((p, i) => (
            <button key={i}
              className={`cs-book-thumb${i === page ? ' cs-book-thumb--active' : ''}`}
              style={{ background: p.bg }}
              onClick={() => { setDir(i > page ? 1 : -1); setPage(i) }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
        <p className="cs-book-note">Page {page + 1} of {BOOK_PAGES.length} — Replace with final PDF when ready</p>
      </Reveal>
    </CSSection>
  )
}

// ── 10 Applications ──────────────────────────────────────────────────
const APP_ITEMS = [
  { label: 'Social Media',       sub: 'Instagram & Facebook templates', ph: 3 },
  { label: 'Web Direction',      sub: 'Brand homepage concept',         ph: 6 },
  { label: 'Print Collateral',   sub: 'Community resource documents',   ph: 4 },
  { label: 'Campaign Materials', sub: '"Care keeps communities safe"',  ph: 5 },
]

function CSApplications({ cs }) {
  const apps = cs.sections.find((s) => s.id === 'applications')
  return (
    <CSSection label="08" title="Applications" variant="accent">
      <Reveal delay={0.06}>
        <p className="cs-lead cs-lead--sm">{apps?.body?.substring(0, 240)}...</p>
      </Reveal>
      <div className="cs-apps-grid">
        {APP_ITEMS.map(({ label, sub, ph }, i) => (
          <Reveal key={label} delay={0.1 + i * 0.07} className={`cs-app-card cs-ph-${ph}`}>
            <div className="cs-app-meta">
              <span className="cs-app-name">{label}</span>
              <span className="cs-app-sub">{sub}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── 11 Outcome ───────────────────────────────────────────────────────
function CSOutcome({ cs }) {
  const outcome = cs.sections.find((s) => s.id === 'outcome')
  const paras   = outcome?.body?.split('\n\n') ?? []
  return (
    <CSSection label="09" title="Outcome">
      <div className="cs-outcome-wrap">
        <Reveal delay={0.1} className="cs-outcome-body">
          {paras.map((p, i) => <p key={i}>{p}</p>)}
        </Reveal>
        <Reveal delay={0.2} className="cs-outcome-callout">
          <SunburstSVG size={44} color={CBS.espresso} />
          <p>"A complete strategic and creative work — built with intention, delivered without compromise."</p>
        </Reveal>
      </div>
    </CSSection>
  )
}

// ── 12 Reflection ────────────────────────────────────────────────────
function CSReflection({ cs }) {
  const sec = cs.sections.find((s) => s.id === 'reflection')
  return (
    <section className="cs-reflection">
      <div className="cs-reflection-inner">
        <Reveal delay={0.06}><span className="cs-reflection-label">07 / Reflection</span></Reveal>
        <Reveal delay={0.14}><p className="cs-reflection-body">{sec?.body}</p></Reveal>
        <Reveal delay={0.22}><div style={{ opacity: 0.25, marginTop: 32 }}><SunburstSVG size={48} color={CBS.cream} /></div></Reveal>
      </div>
    </section>
  )
}

// ── 13 Final CTA ─────────────────────────────────────────────────────
function CSCTA({ cat }) {
  return (
    <div className="cs-end-cta">
      <Reveal delay={0.06} className="cs-end-cta-inner">
        <SunburstSVG size={52} color={cat.accentDark} />
        <h3 className="cs-cta-heading">Working on something that matters? Let's talk.</h3>
        <a href="mailto:hello@kail.studio" className="cs-cta-btn" style={{ background: cat.accentDark }}>
          Get in touch ↗
        </a>
      </Reveal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  PGM BRAND PALETTE
// ═══════════════════════════════════════════════════════════════════════

const PGM = {
  slate:   '#2C365E',
  teal:    '#4F8C8C',
  orange:  '#E76235',
  ochre:   '#EBB363',
  linen:   '#F0EDE7',
}

// ── PGM Logo mark (4 figures in a circle) ───────────────────────────
function PGMLogoSVG({ size = 120, color = '#F0EDE7' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Four abstract figures forming a circle */}
      {[0,90,180,270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const cx  = 60 + 28 * Math.sin(rad)
        const cy  = 60 - 28 * Math.cos(rad)
        return (
          <g key={i} transform={`rotate(${deg}, 60, 60)`}>
            {/* Head */}
            <circle cx={60} cy={24} r={7} fill={color} opacity={0.9} />
            {/* Body arc reaching toward center */}
            <path
              d={`M ${60} ${31} Q ${60} ${50} ${60 - 10} ${54}`}
              stroke={color} strokeWidth={4} strokeLinecap="round" fill="none"
            />
            {/* Arm reaching to neighbour */}
            <path
              d={`M ${60 - 10} ${54} Q ${44} ${60} ${50} ${68}`}
              stroke={color} strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.7}
            />
          </g>
        )
      })}
      {/* Central connection ring */}
      <circle cx={60} cy={60} r={8} fill={color} opacity={0.3} />
      <circle cx={60} cy={60} r={4} fill={color} opacity={0.7} />
    </svg>
  )
}


// ── PGM 01 Hero ──────────────────────────────────────────────────────
function PGMHero({ cs, slide }) {
  return (
    <div className="cs-hero pgm-hero">
      <Reveal delay={0.04}>
        <div className="cs-hero-pills">
          {(slide.tags || []).map((t) => (
            <span key={t} className="cs-hero-pill pgm-pill">{t}</span>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="cs-hero-title pgm-hero-title">Participatory<br />Grantmaking<br />Community</h1>
        <p className="cs-hero-subtitle">{cs.subtitle}</p>
      </Reveal>
      <Reveal delay={0.18}>
        <div className="cs-hero-visual pgm-hero-visual">
          <div className="cs-hero-img pgm-hero-img">
            <div className="cs-hero-img-bg pgm-hero-img-bg">
              <PGMLogoSVG size={200} color={PGM.linen} />
              <p className="cs-ph-label" style={{ color: PGM.ochre }}>Brand Identity System — PGM Global</p>
            </div>
          </div>
          <div className="cs-float cs-float--tl pgm-float">
            <span className="cs-float-l">Client</span><span className="cs-float-v">PGM Global</span>
          </div>
          <div className="cs-float cs-float--tr pgm-float">
            <span className="cs-float-l">Year</span><span className="cs-float-v">{cs.year}</span>
          </div>
          <div className="cs-float cs-float--bl pgm-float">
            <span className="cs-float-l">Duration</span><span className="cs-float-v">{cs.duration}</span>
          </div>
          <div className="cs-float cs-float--br pgm-float">
            <span className="cs-float-l">Reach</span><span className="cs-float-v">Global</span>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.28}>
        <div className="cs-hero-status">
          <span className="cs-status-dot pgm-status-dot" />
          <span className="cs-status-text">{cs.status}</span>
        </div>
      </Reveal>
    </div>
  )
}

// ── PGM 02 Bento Overview ────────────────────────────────────────────
function PGMOverview({ cs }) {
  const overview = cs.sections.find((s) => s.id === 'overview')
  const body = overview?.body?.split('\n\n') ?? []
  return (
    <CSSection label="01" title="Project Overview">
      <div className="cs-bento pgm-bento">
        <Reveal delay={0.08} className="cs-bc cs-bc--wide pgm-bc--slate">
          <span className="cs-bc-eye" style={{ color: PGM.ochre }}>Overview</span>
          <p className="cs-bc-body cs-bc-body--light">{body[0]}</p>
          <div className="cs-bc-tag" style={{ background: PGM.teal + '33', color: PGM.teal }}>
            Community-centred · Power-shifting · Global
          </div>
        </Reveal>
        <Reveal delay={0.13} className="cs-bc pgm-bc--orange">
          <span className="cs-bc-eye">The Challenge</span>
          <h3 className="cs-bc-head">A global movement without a visual language to match its ambition.</h3>
        </Reveal>
        <Reveal delay={0.18} className="cs-bc pgm-bc--teal">
          <span className="cs-bc-eye" style={{ color: PGM.linen + 'bb' }}>Scope</span>
          <p className="cs-bc-body cs-bc-body--light" style={{ fontSize: 13, lineHeight: 1.6 }}>
            Brand guidelines from ground up — logo, colour, typography, illustration, voice, and full applications.
          </p>
        </Reveal>
        <Reveal delay={0.23} className="cs-bc pgm-bc--linen">
          <span className="cs-bc-eye" style={{ color: PGM.slate }}>4 Audiences</span>
          <ul className="pgm-audience-list">
            <li>Activists &amp; grassroots organisers</li>
            <li>Philanthropy professionals</li>
            <li>Industry newcomers</li>
            <li>Social media audiences</li>
          </ul>
        </Reveal>
        <Reveal delay={0.28} className="cs-bc cs-bc--wide pgm-bc--ochre-gradient">
          <span className="cs-bc-eye" style={{ color: PGM.slate }}>Key Outcome</span>
          <h3 className="cs-bc-head cs-bc-head--lg" style={{ color: PGM.slate }}>
            A brand that speaks with communities — not about them.
          </h3>
        </Reveal>
      </div>
    </CSSection>
  )
}

// ── PGM 03 The Brief ─────────────────────────────────────────────────
const PGM_BRIEF_CARDS = [
  { icon: '◎', title: 'The Challenge',  body: 'Build a brand that serves grassroots activists, experienced funders, and complete newcomers — simultaneously, credibly.' },
  { icon: '⌘', title: 'User Needs',     body: 'Warmth and solidarity for community leaders. Rigour and peer respect for philanthropy professionals. Clarity for newcomers.' },
  { icon: '✦', title: 'Business Goals', body: 'Six structured phases. A complete visual system. Deployable across every touchpoint — social, reports, presentations, events.' },
  { icon: '◈', title: 'Success',        body: 'A brand that practises what PGM preaches: participatory in spirit, clear without jargon, warm without sentimentality.' },
]

function PGMBrief({ cs }) {
  const brief = cs.sections.find((s) => s.id === 'brief')
  const lead  = brief?.body?.split('\n\n')[0] ?? ''
  return (
    <CSSection label="02" title="The Brief" variant="accent">
      <Reveal delay={0.06}><p className="cs-lead">{lead}</p></Reveal>
      <div className="cs-brief-grid">
        {PGM_BRIEF_CARDS.map(({ icon, title, body }, i) => (
          <Reveal key={title} delay={0.1 + i * 0.07} className="cs-brief-card pgm-brief-card">
            <span className="cs-brief-icon" style={{ color: PGM.orange }}>{icon}</span>
            <h4 className="cs-brief-title">{title}</h4>
            <p className="cs-brief-body">{body}</p>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── PGM 04 Research & Strategy ───────────────────────────────────────
const PGM_TRAITS = [
  { label: 'Conversational', sub: 'not corporate'       },
  { label: 'Warm',           sub: 'not institutional'   },
  { label: 'Clear',          sub: 'not academic'        },
  { label: 'Encouraging',    sub: 'not prescriptive'    },
  { label: 'Grounded',       sub: 'in joy & possibility'},
]

function PGMStrategy({ cs }) {
  const strategy = cs.sections.find((s) => s.id === 'strategy')
  const paras    = strategy?.body?.split('\n\n') ?? []
  return (
    <CSSection label="03" title="Research & Strategy" variant="dark">
      <div className="cs-strategy-grid">
        <div className="cs-strat-card-main">
          {paras.map((p, i) => (
            <Reveal key={i} delay={0.06 + i * 0.1}>
              <p className="cs-lead cs-lead--sm pgm-strat-para">{p}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="cs-strat-card-side pgm-strat-side">
          <span className="cs-strat-label" style={{ color: PGM.ochre }}>Brand Personality</span>
          <div className="pgm-traits">
            {PGM_TRAITS.map(({ label, sub }) => (
              <div key={label} className="pgm-trait">
                <span className="pgm-trait-main" style={{ color: PGM.linen }}>{label}</span>
                <span className="pgm-trait-sub">{sub}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.32}>
        <div className="pgm-audience-tiers">
          {[
            { audience: 'Community Leaders',         tone: 'Affirming · Solidarity-driven', color: PGM.orange },
            { audience: 'Philanthropy Professionals', tone: 'Practical · Peer-to-peer',      color: PGM.teal   },
            { audience: 'Industry Newcomers',         tone: 'Clear · Encouraging',           color: PGM.ochre  },
          ].map(({ audience, tone, color }) => (
            <div key={audience} className="pgm-tier" style={{ borderLeftColor: color }}>
              <span className="pgm-tier-label" style={{ color }}>{audience}</span>
              <span className="pgm-tier-tone">{tone}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </CSSection>
  )
}

// ── PGM 05 Visual Identity ───────────────────────────────────────────
function PGMVisualIdentity({ cs }) {
  const visual   = cs.sections.find((s) => s.id === 'visual')
  const subs     = visual?.subsections ?? []
  const swatches = [PGM.slate, PGM.teal, PGM.orange, PGM.ochre, PGM.linen]
  const swatchNames = ['Midnight Slate', 'Muted Teal', 'Burnt Orange', 'Golden Ochre', 'Linen White']

  return (
    <CSSection label="04" title="Visual Identity">
      <Reveal delay={0.06}>
        <div className="cs-logo-showcase pgm-logo-showcase">
          <div className="pgm-logo-ring">
            <PGMLogoSVG size={140} color={PGM.linen} />
          </div>
          <div className="cs-logo-desc">
            <h4>{subs[0]?.title}</h4>
            <p>{subs[0]?.body}</p>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.14}>
        <div className="cs-palette pgm-palette">
          {swatches.map((hex, i) => (
            <div key={hex} className="pgm-swatch-col">
              <div className="pgm-swatch" style={{ background: hex }} />
              <span className="pgm-swatch-name">{swatchNames[i]}</span>
              <span className="pgm-swatch-hex">{hex}</span>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.2} className="pgm-type-card">
        <div className="pgm-type-row">
          <span style={{ color: PGM.linen + '88', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cal Sans — Display</span>
          <span className="pgm-type-demo-display" style={{ color: PGM.ochre }}>Shifting Power</span>
        </div>
        <div className="pgm-type-row">
          <span style={{ color: PGM.linen + '88', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Darker Grotesque — Body</span>
          <span className="pgm-type-demo-body" style={{ color: PGM.linen + 'cc' }}>
            A global community advancing participatory approaches in philanthropy.
          </span>
        </div>
      </Reveal>
      <Reveal delay={0.28} className="pgm-illus-card">
        <span className="cs-bc-eye" style={{ color: PGM.teal }}>Illustration Style</span>
        <p style={{ color: PGM.slate }}>{subs[3]?.body}</p>
      </Reveal>
    </CSSection>
  )
}

// ── PGM 06 Process Timeline ──────────────────────────────────────────
const PGM_PHASES = [
  { num: '01', label: 'Brand Discovery & Direction',      deliverable: 'Visual direction moodboard · Project roadmap' },
  { num: '02', label: 'Logo Refinement & Type Systems',   deliverable: 'Primary logo · Colour palette · Typography system' },
  { num: '03', label: 'Colour & Typography Refinement',   deliverable: 'Final HEX/RGB specs · Typographic hierarchy' },
  { num: '04', label: 'Imagery, Graphics & Iconography',  deliverable: 'Photography style · Illustration direction · Icons' },
  { num: '05', label: 'Voice, Messaging & Applications',  deliverable: 'Tone of voice · Messaging pillars · Templates' },
  { num: '06', label: 'Final Guidelines & Handover',      deliverable: 'Brand guidelines PDF · Asset library · Notes' },
]

function PGMTimeline() {
  return (
    <CSSection label="05" title="Process Timeline" variant="dark">
      <div className="cs-timeline pgm-timeline">
        {PGM_PHASES.map(({ num, label, deliverable }, i) => (
          <Reveal key={num} delay={0.06 + i * 0.08} className="cs-tl-item pgm-tl-item">
            <div className="cs-tl-num" style={{ color: PGM.orange, borderColor: PGM.orange + '44' }}>{num}</div>
            <div className="cs-tl-body">
              <h4 className="cs-tl-label" style={{ color: PGM.linen }}>{label}</h4>
              <p className="cs-tl-detail" style={{ color: PGM.ochre + 'bb' }}>{deliverable}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── PGM 07 Gallery ───────────────────────────────────────────────────
const PGM_GALLERY = [
  { label: 'Logo System',        sub: 'Primary · Horizontal · Shorthand',   cls: 'pgm-ph-1' },
  { label: 'Colour Palette',     sub: 'Midnight Slate to Linen White',      cls: 'pgm-ph-2' },
  { label: 'Typography',         sub: 'Cal Sans + Darker Grotesque',        cls: 'pgm-ph-3' },
  { label: 'Illustration Style', sub: 'Flat vector · Inclusive characters', cls: 'pgm-ph-4' },
  { label: 'Social Templates',   sub: 'Instagram · LinkedIn · Reports',     cls: 'pgm-ph-5' },
  { label: 'Brand in Context',   sub: 'Real environments · Warm light',     cls: 'pgm-ph-6' },
]

function PGMGallery() {
  return (
    <CSSection label="06" title="Brand Gallery" variant="accent">
      <div className="cs-gallery pgm-gallery">
        {PGM_GALLERY.map(({ label, sub, cls }, i) => (
          <Reveal key={label} delay={0.06 + i * 0.07}
            className={`cs-gal-item ${i === 0 ? 'cs-gal-item--wide' : ''} ${cls}`}>
            <div className="cs-gal-meta">
              <span className="cs-gal-label">{label}</span>
              <span className="cs-gal-sub">{sub}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── PGM 08 Impact Stats ──────────────────────────────────────────────
const PGM_STATS = [
  { value: 6,   suffix: '',  label: 'Phases Delivered'      },
  { value: 17,  suffix: '',  label: 'Guideline Pages'       },
  { value: 4,   suffix: '',  label: 'Audience Tiers Mapped' },
  { value: 100, suffix: '%', label: 'Brief Coverage'        },
]

function PGMImpact() {
  return (
    <CSSection label="07" title="Project Scope">
      <div className="cs-impact-grid pgm-impact-grid">
        {PGM_STATS.map(({ value, suffix, label }, i) => (
          <Reveal key={label} delay={0.08 + i * 0.1} className="cs-impact-card pgm-impact-card">
            <span className="cs-impact-num">
              <Counter to={value} suffix={suffix} />
            </span>
            <span className="cs-impact-label" style={{ color: PGM.teal }}>{label}</span>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── PGM 09 Brand Guidelines — real PDF flipbook ──────────────────────
function PGMFlipbook() {
  const base   = import.meta.env.BASE_URL
  const pdfUrl = `${base}guidelines/pgm-guidelines.pdf`
  return (
    <CSSection label="08" title="Brand Guidelines" variant="light">
      <Reveal delay={0.08}>
        <PDFFlipbook
          pdfUrl={pdfUrl}
          title="PGM — Brand Guidelines 2024"
          accentColor={PGM.slate}
          totalHint={17}
        />
      </Reveal>
    </CSSection>
  )
}

// ── PGM 10 Applications ──────────────────────────────────────────────
const PGM_APP_ITEMS = [
  { label: 'Social Media',        sub: 'Instagram, LinkedIn & campaign templates', cls: 'pgm-app-1' },
  { label: 'Reports & Documents', sub: 'Publication layout & document templates',  cls: 'pgm-app-2' },
  { label: 'Presentations',       sub: 'Practitioner & knowledge-sharing decks',   cls: 'pgm-app-3' },
  { label: 'Brand Collateral',    sub: 'Business cards, letterheads & stationery', cls: 'pgm-app-4' },
]

function PGMApplications({ cs }) {
  const apps = cs.sections.find((s) => s.id === 'applications')
  return (
    <CSSection label="09" title="Applications" variant="accent">
      <Reveal delay={0.06}>
        <p className="cs-lead cs-lead--sm">{apps?.body?.substring(0, 260)}…</p>
      </Reveal>
      <div className="cs-apps-grid pgm-apps-grid">
        {PGM_APP_ITEMS.map(({ label, sub, cls }, i) => (
          <Reveal key={label} delay={0.1 + i * 0.07} className={`cs-app-card ${cls}`}>
            <div className="cs-app-meta">
              <span className="cs-app-name">{label}</span>
              <span className="cs-app-sub">{sub}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

// ── PGM 11 Outcome ───────────────────────────────────────────────────
function PGMOutcome({ cs }) {
  const outcome = cs.sections.find((s) => s.id === 'outcome')
  const paras   = outcome?.body?.split('\n\n') ?? []
  return (
    <CSSection label="10" title="Outcome">
      <div className="cs-outcome-wrap pgm-outcome-wrap">
        <Reveal delay={0.1} className="cs-outcome-body">
          {paras.map((p, i) => <p key={i}>{p}</p>)}
        </Reveal>
        <Reveal delay={0.2} className="cs-outcome-callout pgm-outcome-callout">
          <PGMLogoSVG size={44} color={PGM.slate} />
          <p style={{ color: PGM.slate }}>
            "A brand that practises what PGM preaches — speaking with communities, not about them."
          </p>
        </Reveal>
      </div>
    </CSSection>
  )
}

// ── PGM 12 Reflection ────────────────────────────────────────────────
function PGMReflection({ cs }) {
  const sec   = cs.sections.find((s) => s.id === 'reflection')
  const paras = sec?.body?.split('\n\n') ?? []
  return (
    <section className="cs-reflection pgm-reflection">
      <div className="cs-reflection-inner">
        <Reveal delay={0.06}>
          <span className="cs-reflection-label" style={{ color: PGM.ochre }}>07 / Reflection</span>
        </Reveal>
        {paras.map((p, i) => (
          <Reveal key={i} delay={0.14 + i * 0.1}>
            <p className="cs-reflection-body" style={{ color: PGM.linen }}>{p}</p>
          </Reveal>
        ))}
        <Reveal delay={0.36}>
          <div style={{ opacity: 0.25, marginTop: 32 }}>
            <PGMLogoSVG size={48} color={PGM.linen} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  CASE STUDY VIEWS — routes to CBS or PGM based on slide.id
// ═══════════════════════════════════════════════════════════════════════

function CBSCaseStudyView({ cat, cs, slide }) {
  return (
    <div className="cs-wrap">
      <CSHero           cs={cs} slide={slide} />
      <CSOverview       cs={cs} />
      <CSBrief          cs={cs} />
      <CSStrategy       cs={cs} />
      <CSVisualIdentity cs={cs} />
      <CSTimeline />
      <CSGallery />
      <CSImpact />
      <CSFlipbook />
      <CSApplications   cs={cs} />
      <CSOutcome        cs={cs} />
      <CSReflection     cs={cs} />
      <CSCTA            cat={cat} />
    </div>
  )
}

function PGMCaseStudyView({ cat, cs, slide }) {
  return (
    <div className="cs-wrap pgm-case-study">
      <PGMHero           cs={cs} slide={slide} />
      <PGMOverview       cs={cs} />
      <PGMBrief          cs={cs} />
      <PGMStrategy       cs={cs} />
      <PGMVisualIdentity cs={cs} />
      <PGMTimeline />
      <PGMGallery />
      <PGMImpact />
      <PGMFlipbook />
      <PGMApplications   cs={cs} />
      <PGMOutcome        cs={cs} />
      <PGMReflection     cs={cs} />
      <CSCTA             cat={cat} />
    </div>
  )
}

function CaseStudyView({ cat, slide }) {
  const cs = slide.caseStudy
  if (slide.id === 2) return <PGMCaseStudyView cat={cat} cs={cs} slide={slide} />
  return <CBSCaseStudyView cat={cat} cs={cs} slide={slide} />
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN OVERLAY EXPORT
// ═══════════════════════════════════════════════════════════════════════

export default function ProjectDetail({ cat, slide, onClose }) {
  const hasCaseStudy = Boolean(slide?.caseStudy)

  return (
    <motion.div
      className="pd-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={slide?.label ?? cat.name}
      {...OVERLAY}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div className="pd-sheet" {...CONTENT}>

        <header className="pd-header">
          <button className="pd-back" onClick={onClose} aria-label="Close">&#8592; Back</button>
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Studio KAIL" className="pd-header-logo" />
          <button className="pd-close" onClick={onClose} aria-label="Close">&#215;</button>
        </header>

        {!hasCaseStudy && (
          <div className="pd-hero">
            <h1 className="pd-title">{cat.name}</h1>
            <p className="pd-tagline">{cat.tagline}</p>
          </div>
        )}

        {hasCaseStudy ? (
          <CaseStudyView cat={cat} slide={slide} />
        ) : (
          <motion.div className="pd-grid-8" initial="initial" animate="animate" exit="exit">
            <VisualCard       cat={cat} />
            <DarkIntroCard    cat={cat} />
            <DeliverablesCard cat={cat} />
            <AboutCard        cat={cat} />
            <ScopeCard        cat={cat} />
            <StatLightCard    cat={cat} />
            <StatDarkCard     cat={cat} />
            <CtaCard          cat={cat} />
          </motion.div>
        )}

      </motion.div>
    </motion.div>
  )
}
