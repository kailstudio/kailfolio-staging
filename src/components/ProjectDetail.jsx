/**
 * ProjectDetail.jsx — Project detail overlay
 *
 * Two modes:
 *  1. 8-card bento grid  — default for category-level cards
 *  2. Premium case study — when slide.caseStudy is present
 */

import { useState, useEffect, useRef, useCallback } from 'react'
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

// CBS Logo — real image with SVG fallback
function CBSLogo({ size = 120 }) {
  const base = import.meta.env.BASE_URL
  return (
    <img
      src={`${base}cbs/cbs-logo.png`}
      alt="Care-Based Safety logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
  )
}

// 16-ray sunburst SVG (kept as fallback/accent element)
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

// Section wrapper — title only (numbering removed)
function CSSection({ label, title, children, variant = 'light', className }) {
  const cls = ['cs-section', `cs-section--${variant}`, className].filter(Boolean).join(' ')
  return (
    <section className={cls}>
      {title && (
        <Reveal>
          <div className="cs-section-header">
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
              <CBSLogo size={220} />
              <p className="cs-ph-label">Brand Identity System, Care-Based Safety</p>
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
            A community-rooted organisation in Washtenaw County, Michigan: building and advocating for non-police crisis response, prevention-first systems, and community-led approaches to public safety grounded in abolitionist principles.
          </p>
          <div className="cs-bc-tag">Abolitionist · Community-led · Prevention-first</div>
        </Reveal>

      </div>
    </CSSection>
  )
}

// ── 03 The Brief ─────────────────────────────────────────────────────
const BRIEF_CARDS = [
  { icon: '⌘', title: 'The Challenge', body: 'Build a brand for radically different rooms: from someone reaching out in crisis to a government funding partner.' },
  { icon: '◎', title: 'User Needs', body: 'Warmth and directness for community members. Rigour and credibility for funders. Results-led clarity for government.' },
  { icon: '✦', title: 'Business Goals', body: 'Six structured phases. A complete visual system. Deployable immediately across every touchpoint: social, print, digital, campaign.' },
  { icon: '◈', title: 'Success Metrics', body: 'Same conviction. Same warmth. Same clarity: whether the audience is a funder in a boardroom or a person reaching out for help.' },
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
    { hex: CBS.espresso, name: 'Espresso',   usage: 'Primary anchor: authority, depth' },
    { hex: CBS.cream,    name: 'Warm Cream', usage: 'Primary ground: warmth, openness' },
    { hex: CBS.blue,     name: 'Steel Blue', usage: 'Trust, calm, secondary voice' },
    { hex: CBS.mint,     name: 'Soft Mint',  usage: 'Growth, care, optimism' },
    { hex: CBS.peach,    name: 'Warm Peach', usage: 'Warmth, celebration, energy' },
  ]
  return (
    <CSSection label="04" title="Visual Identity" variant="dark">
      <Reveal delay={0.1} className="cs-logo-showcase">
        <div className="cs-logo-visual">
          <div className="cs-logo-ring"><CBSLogo size={160} /></div>
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
              <p style={{ color: CBS.cream + '88', fontSize: 13 }}>Headers: confidence, structural clarity</p>
            </div>
          </div>
          <div className="cs-type-row">
            <span className="cs-type-demo cs-type-demo--light" style={{ color: CBS.cream }}>Aa</span>
            <div>
              <strong style={{ color: CBS.cream }}>Montserrat Light</strong>
              <p style={{ color: CBS.cream + '88', fontSize: 13 }}>Body: openness, 6th-grade accessibility</p>
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
  { n: '02', name: 'Logo Development',  desc: 'Two creative directions: Beam selected and refined' },
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
const BASE = import.meta.env.BASE_URL

const GALLERY_ITEMS = [
  { label: 'Brand Photography',    cls: 'wide', src: `${BASE}cbs/imagery/CBS1.jpg` },
  { label: 'Community in Action',  cls: 'std',  src: `${BASE}cbs/imagery/CBS2.jpg` },
  { label: 'People & Place',       cls: 'std',  src: `${BASE}cbs/imagery/CBS3.jpg` },
  { label: 'Social Media Content', cls: 'std',  src: `${BASE}cbs/social/1.png` },
  { label: 'Social Media Content', cls: 'std',  src: `${BASE}cbs/social/2.png` },
  { label: 'Illustration System',  cls: 'wide', src: `${BASE}cbs/illustrations/Illustration1.webp` },
  { label: 'Illustration Detail',  cls: 'std',  src: `${BASE}cbs/illustrations/Illustration2.webp` },
  { label: 'Campaign Graphics',    cls: 'std',  src: `${BASE}cbs/illustrations/Illustration3.webp` },
]

function GalImg({ src, label }) {
  return (
    <img
      src={src}
      alt={label}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 'inherit' }}
      loading="lazy"
    />
  )
}

// ── Shared: Accordion image gallery ──────────────────────────────────
function ImageGallery({ images, colors = [] }) {
  if (!images || images.length === 0) return null
  return (
    <div className="img-gallery-row">
      {images.map((src, i) => (
        <div
          key={i}
          className="img-gallery-item"
          style={{ background: colors[i % colors.length] || 'transparent' }}
        >
          <img src={src} alt={`Illustration ${i + 1}`} loading="lazy" />
        </div>
      ))}
    </div>
  )
}

// Muted CBS palette — brand colours at reduced saturation/lightness
const CBS_GALLERY_COLORS = [
  '#F5E2CC', // peach tint
  '#D6E9E6', // mint tint
  '#C6D5E1', // blue tint
  '#F0E2D5', // cream/espresso tint
  '#E5D0C8', // warm espresso tint
  '#D8EAE8', // mint tint 2
]

// Muted PGM palette — brand colours at reduced saturation/lightness
const PGM_GALLERY_COLORS = [
  '#C6CEDF', // slate tint
  '#B6D5D5', // teal tint
  '#F7BFA6', // orange tint
  '#F3DCAB', // ochre tint
  '#F0EDE7', // linen (base)
  '#C0CCE0', // slate tint 2
]

// ── Shared: Custom Illustrations & Iconography section ────────────────
function IllustrationsSection({ label = '05', images = [], colors = [] }) {
  return (
    <CSSection label={label} title="Custom Illustrations & Iconography">
      <ImageGallery images={images} colors={colors} />
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
        <p>Earthy and Natural: stability and warmth, never clinical.</p>
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
        <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>Montserrat Light: body text at 6th-grade reading level</div>
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
    <div className="cs-flipbook-wrap">
      <PDFFlipbook
        pdfUrl={pdfUrl}
        accentColor={CBS.espresso}
        totalHint={17}
      />
    </div>
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
        <p className="cs-book-note">Page {page + 1} of {BOOK_PAGES.length}. Replace with final PDF when ready.</p>
      </Reveal>
    </CSSection>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  PHOTO STACK — adapted from InteractivePhotoStack (TypeScript/Tailwind → JSX/CSS)
// ═══════════════════════════════════════════════════════════════════════

function generateNonOverlappingTransforms(items) {
  const positions = []
  const displayed = items.slice(0, 5)
  const cardWidthVW  = 25
  const cardHeightVH = 45
  const maxRetries   = 100
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  displayed.forEach(() => {
    let pos, collision, retries = 0
    do {
      collision = false
      pos = { x: rng(-40, 40), y: rng(-22, 22), r: rng(-22, 22) }
      for (const p of positions) {
        if (Math.abs(pos.x - p.x) < cardWidthVW && Math.abs(pos.y - p.y) < cardHeightVH) {
          collision = true; break
        }
      }
      retries++
    } while (collision && retries < maxRetries)
    positions.push(pos)
  })
  return positions.map(p => `translate(${p.x}vw, ${p.y}vh) rotate(${p.r}deg)`)
}

const BASE_ROTATIONS = [0, -2, 4, -4, 6]

function PhotoStack({ items, title, accentColor }) {
  const [topIndex,       setTopIndex]       = useState(0)
  const [hovered,        setHovered]        = useState(false)
  const [clickedIndex,   setClickedIndex]   = useState(null)
  const [spreadXforms,   setSpreadXforms]   = useState([])

  const displayed = items.slice(0, 5)
  const numItems  = displayed.length

  const handleEnter = useCallback(() => {
    setSpreadXforms(generateNonOverlappingTransforms(items))
    setHovered(true)
  }, [items])

  const handleLeave = useCallback(() => {
    if (clickedIndex === null) setHovered(false)
  }, [clickedIndex])

  const handleClick = useCallback((index) => {
    if (hovered) {
      setClickedIndex(index)
      setTimeout(() => {
        setHovered(false)
        setTopIndex(index)
        setClickedIndex(null)
      }, 650)
    } else {
      setTopIndex(index)
    }
  }, [hovered])

  return (
    <div className="pstack">
      <div className="pstack-area" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        <div className="pstack-inner">
          {displayed.map((item, i) => {
            let stackPos = i - topIndex
            if (stackPos < 0) stackPos += numItems
            const isTop     = i === topIndex
            const isClicked = i === clickedIndex

            const transform = hovered
              ? (spreadXforms[i] || 'translate(0,0) rotate(0deg)')
              : `translateY(${stackPos * 8}px) scale(${1 - stackPos * 0.05}) rotate(${isTop ? 0 : BASE_ROTATIONS[stackPos]}deg)`

            const zIndex = isClicked ? 200 : hovered ? 100 : isTop ? numItems : numItems - stackPos

            return (
              <div
                key={item.name}
                className={`pstack-card${isClicked ? ' pstack-card--spin' : ''}${hovered ? ' pstack-card--spread' : ''}`}
                style={{ transform, zIndex }}
                onClick={() => handleClick(i)}
              >
                <div className="pstack-img">
                  <img src={item.src} alt={item.name} loading="lazy" />
                </div>
                <div className="pstack-label">
                  <span>{item.name}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {title && (
        <div className="pstack-footer">
          <h3 className="pstack-title" style={accentColor ? { color: accentColor } : {}}>{title}</h3>
          <p className="pstack-hint">Hover to explore · click to select</p>
        </div>
      )}
    </div>
  )
}

// ── 10 Applications ──────────────────────────────────────────────────
const CBS_STACK_ITEMS = [
  { src: `${BASE}cbs/social/1.png`,      name: 'Social Campaign'     },
  { src: `${BASE}cbs/imagery/CBS4.jpg`,  name: 'Brand Photography'   },
  { src: `${BASE}cbs/social/4.png`,      name: 'Digital Content'     },
  { src: `${BASE}cbs/imagery/CBS6.jpg`,  name: 'Community'           },
  { src: `${BASE}cbs/social/7.png`,      name: 'Campaign Materials'  },
]

function CSApplications() {
  return (
    <CSSection title="Applications" variant="accent">
      <PhotoStack
        items={CBS_STACK_ITEMS}
        title="Brand in the World"
        accentColor={CBS.espresso}
      />
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
          <CBSLogo size={44} />
          <p>"A complete strategic and creative work, built with intention, delivered without compromise."</p>
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


// PGM Logo — real image with SVG fallback
function PGMLogoImg({ size = 120 }) {
  const base = import.meta.env.BASE_URL
  return (
    <img
      src={`${base}pgm/pgm-logo.png`}
      alt="PGM logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
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
              <PGMLogoImg size={200} />
              <p className="cs-ph-label" style={{ color: PGM.ochre }}>Brand Identity System, PGM Global</p>
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
      </div>
    </CSSection>
  )
}

// ── PGM 03 The Brief ─────────────────────────────────────────────────
const PGM_BRIEF_CARDS = [
  { icon: '◎', title: 'The Challenge',  body: 'Build a brand that serves grassroots activists, experienced funders, and complete newcomers: simultaneously, credibly.' },
  { icon: '⌘', title: 'User Needs',     body: 'Warmth and solidarity for community leaders. Rigour and peer respect for philanthropy professionals. Clarity for newcomers.' },
  { icon: '✦', title: 'Business Goals', body: 'Six structured phases. A complete visual system. Deployable across every touchpoint: social, reports, presentations, events.' },
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

// ── PGM Our Process ──────────────────────────────────────────────────
const PGM_PHASES = [
  {
    n: '01', name: 'Brand Discovery & Direction',
    desc: 'Review of existing materials, competitor research, and moodboard directions.',
    deliverable: 'Brand overview draft · Visual direction moodboard · Project roadmap',
  },
  {
    n: '02', name: 'Logo Refinement, Colour & Type',
    desc: 'Logo concept exploration, colour and typography pairings, scalability testing.',
    deliverable: 'Refined primary logo · Logo guidelines · Colour & Typography system',
  },
  {
    n: '03', name: 'Colour & Typography Systems',
    desc: 'Full palette development across HEX, RGB, CMYK and Pantone. Typeface hierarchy finalised.',
    deliverable: 'Completed colour palette · Typography section · Updated sample layouts',
  },
  {
    n: '04', name: 'Imagery, Graphics & Iconography',
    desc: 'Photography style guidelines, graphic shapes, icon system and cohesion mockups.',
    deliverable: 'Imagery style guide · Iconography section · Sample applications',
  },
  {
    n: '05', name: 'Voice, Messaging & Applications',
    desc: 'Tone of voice, messaging pillars, sample copy, and brand application templates.',
    deliverable: 'Voice & Messaging section · Brand Applications section · Final templates',
  },
  {
    n: '06', name: 'Final Guidelines & Handover',
    desc: 'Full document assembly, proofing, consistency checks and asset export.',
    deliverable: 'Brand guidelines PDF · Editable source files · Asset library · Implementation notes',
  },
]

function PGMProcess() {
  return (
    <CSSection title="Our Process" variant="light">
      <div className="cs-timeline pgm-timeline">
        {PGM_PHASES.map(({ n, name, desc, deliverable }, i) => (
          <Reveal key={n} delay={0.06 + i * 0.08} className="cs-tl-item pgm-tl-item">
            <div className="cs-tl-dot pgm-tl-dot" style={{ borderColor: PGM.orange + '55' }}>
              <span style={{ color: PGM.orange }}>{n}</span>
            </div>
            <div className="cs-tl-body">
              <h4 className="cs-tl-name pgm-tl-name" style={{ color: PGM.slate }}>{name}</h4>
              <p className="cs-tl-desc" style={{ color: PGM.slate + 'aa' }}>{desc}</p>
            </div>
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
      <div className="pgm-strategy-grid">
        <div className="pgm-strat-main">
          {paras.map((p, i) => (
            <Reveal key={i} delay={0.06 + i * 0.1}>
              <p className="cs-lead cs-lead--sm pgm-strat-para">{p}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="pgm-strat-side">
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
  const visual = cs.sections.find((s) => s.id === 'visual')
  const subs   = visual?.subsections ?? []

  const palette = [
    { hex: PGM.slate,  name: 'Midnight Slate', usage: 'Primary anchor: depth, authority'    },
    { hex: PGM.teal,   name: 'Muted Teal',     usage: 'Calm, connection, secondary voice'   },
    { hex: PGM.orange, name: 'Burnt Orange',   usage: 'Energy, joy, urgency'                },
    { hex: PGM.ochre,  name: 'Golden Ochre',   usage: 'Warmth, optimism, celebration'       },
    { hex: PGM.linen,  name: 'Linen White',    usage: 'Open ground, breathing room'         },
  ]

  return (
    <CSSection title="Visual Identity" variant="dark">
      {/* Logo showcase */}
      <Reveal delay={0.06} className="cs-logo-showcase pgm-logo-showcase">
        <div className="pgm-logo-ring">
          <PGMLogoImg size={260} />
        </div>
        <div className="cs-logo-desc">
          <h4 className="cs-vi-sub" style={{ color: PGM.ochre }}>The Logo</h4>
          <p className="cs-vi-body" style={{ color: PGM.linen + 'cc' }}>{subs[0]?.body}</p>
          <div className="cs-logo-specs">
            {['4 abstract figures', 'Continuous circle', 'Equal balance', 'Community at centre'].map((s) => (
              <span key={s} className="cs-logo-spec" style={{ borderColor: PGM.teal + '44', color: PGM.linen + 'aa' }}>{s}</span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Colour palette */}
      <Reveal delay={0.14}>
        <div className="cs-vi-divider" style={{ borderColor: 'rgba(240,237,231,0.12)' }} />
        <h4 className="cs-vi-sub" style={{ color: PGM.ochre, marginBottom: 8 }}>Colour Palette</h4>
        <p className="cs-vi-body" style={{ color: PGM.linen + 'cc', marginBottom: 28 }}>
          A warm, grounded palette balancing depth with optimism across every touchpoint.
        </p>
        <div className="cs-palette">
          {palette.map(({ hex, name, usage }, i) => (
            <Reveal key={hex} delay={0.06 + i * 0.06} className="cs-swatch-card">
              <div className="cs-swatch-colour" style={{ background: hex, border: hex === PGM.linen ? '1px solid rgba(255,255,255,0.15)' : 'none' }} />
              <div className="cs-swatch-info">
                <span className="cs-swatch-hex">{hex}</span>
                <span className="cs-swatch-name">{name}</span>
                <span className="cs-swatch-usage">{usage}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Typography */}
      <Reveal delay={0.2} className="cs-type-card">
        <h4 className="cs-vi-sub" style={{ color: PGM.ochre }}>Typography</h4>
        <div className="cs-type-rows">
          <div className="cs-type-row">
            <span className="pgm-type-demo-display" style={{ color: PGM.linen, fontSize: '2.8rem', lineHeight: 1 }}>Aa</span>
            <div>
              <strong style={{ color: PGM.linen }}>Cal Sans Regular</strong>
              <p style={{ color: PGM.linen + '88', fontSize: 13 }}>Display: warmth, humanity, contemporary feel</p>
            </div>
          </div>
          <div className="cs-type-row">
            <span className="pgm-type-demo-body" style={{ color: PGM.linen, fontSize: '2.4rem', lineHeight: 1, fontWeight: 400 }}>Aa</span>
            <div>
              <strong style={{ color: PGM.linen }}>Darker Grotesque</strong>
              <p style={{ color: PGM.linen + '88', fontSize: 13 }}>Body: clarity, legibility across all reading levels</p>
            </div>
          </div>
        </div>
        <p className="cs-type-sample" style={{ color: PGM.linen + '55' }}>
          "Shifting power in philanthropy by centring community knowledge."
        </p>
      </Reveal>
    </CSSection>
  )
}

// PGMGallery replaced by shared IllustrationsSection (see below)

// ── PGM 08 Impact Stats ──────────────────────────────────────────────
const PGM_STATS = [
  { value: 6,  suffix: '',  label: 'Phases Delivered'      },
  { value: 17, suffix: '',  label: 'Guideline Pages'       },
  { value: 15, suffix: '',  label: 'Illustrations'         },
  { value: 4,  suffix: '',  label: 'Logo Variations'       },
  { value: 5,  suffix: '',  label: 'Brand Colours'         },
  { value: 4,  suffix: '',  label: 'Brand Values'          },
]

function PGMImpact() {
  return (
    <CSSection title="Outcome">
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
    <div className="cs-flipbook-wrap">
      <PDFFlipbook
        pdfUrl={pdfUrl}
        accentColor={PGM.slate}
        totalHint={17}
      />
    </div>
  )
}

// ── PGM 10 Applications ──────────────────────────────────────────────
const PGM_STACK_ITEMS = [
  { src: `${BASE}pgm/applications/mug.png`,              name: 'Brand Merchandise'   },
  { src: `${BASE}pgm/applications/tote.png`,             name: 'Brand Collateral'    },
  { src: `${BASE}pgm/illustrations/Illustration2.webp`,  name: 'Illustration System' },
  { src: `${BASE}pgm/illustrations/Illustration5.webp`,  name: 'Campaign Graphics'   },
  { src: `${BASE}pgm/illustrations/Illustration8.webp`,  name: 'Custom Icons'        },
]

function PGMApplications() {
  return (
    <CSSection title="Applications" variant="accent">
      <PhotoStack
        items={PGM_STACK_ITEMS}
        title="Brand in the World"
        accentColor={PGM.slate}
      />
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
          <PGMLogoImg size={44} />
          <p style={{ color: PGM.slate }}>
            "A brand that practises what PGM preaches: speaking with communities, not about them."
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
//  PACKAGING CASE STUDIES — generic component system
// ═══════════════════════════════════════════════════════════════════════

// ── Shared icon SVGs ──────────────────────────────────────────────────
const BehanceSVG = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
    <path d="M8.5 10.5C9.6 10.5 10.5 9.6 10.5 8.5S9.6 6.5 8.5 6.5H4v8h4.8c1.25 0 2.2-.95 2.2-2.2 0-1-.63-1.6-1.5-1.75-.31-.04-.65-.05-1-.05zM5.5 8H8c.83 0 1.5.67 1.5 1.5S8.83 11 8 11H5.5V8zm3 5H5.5v-1H8.5c.55 0 1 .45 1 1s-.45 1-1 1zM15.5 9.5c-1.5 0-3 1-3 2.5h6c0-1.5-1.5-2.5-3-2.5zm-2.5 4c.3.8 1.3 1 2 1s1.8-.3 2.1-1h1.5c-.5 1.5-1.6 2.5-3.3 2.5-1.9 0-3.5-1.5-3.5-3.5S13 9 15 9c2.2 0 3.5 1.5 3.5 3.5v1h-5.5zM13.5 6h4v1h-4V6z"/>
  </svg>
)
const DribbbleSVG = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M3.5 9c2.3 0 5-1 7-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M18.5 9c-2 .5-4.5 2.5-5.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M7 18c1.5-3 4-6 11-6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const GlobeSVG = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"/>
    <ellipse cx="11" cy="11" rx="3.5" ry="8" stroke="currentColor" strokeWidth="1.4"/>
    <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="4" y1="7.5" x2="18" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="4" y1="14.5" x2="18" y2="14.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)
const AmazonSVG = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
    <path d="M4.5 14.5C8 17 14 17 17.5 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <path d="M16 15.5l2-1-1 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <text x="4" y="12" fontSize="7" fontWeight="700" fontFamily="sans-serif" fill="currentColor">amazon</text>
  </svg>
)
const VimeoSVG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.48 4.807z"/>
  </svg>
)

// ── Generic Pkg components ────────────────────────────────────────────

function PkgHero({ cs, slide, cfg }) {
  const { accent, dark, heroSrc, heroLabel } = cfg
  return (
    <CSSection className="pkg-hero">
      <Reveal delay={0.04}>
        <div className="cs-hero-pills">
          {(slide.tags || []).map((t) => (
            <span key={t} className="cs-hero-pill" style={{ background: accent + '18', color: accent, borderColor: accent + '44' }}>{t}</span>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="cs-hero-title" style={{ color: dark }}>{slide.label}</h1>
        <p className="cs-hero-subtitle" style={{ color: dark + '88' }}>{cs.subtitle}</p>
      </Reveal>
      <Reveal delay={0.18}>
        <div className="pkg-hero-visual">
          {heroSrc && <img src={heroSrc} alt={heroLabel ?? slide.label} className="pkg-hero-img" />}
        </div>
      </Reveal>
      <Reveal delay={0.28}>
        <div className="cs-hero-status">
          <span className="cs-status-dot" style={{ background: accent }} />
          <span className="cs-status-text" style={{ color: dark + 'aa' }}>{cs.status}</span>
        </div>
      </Reveal>
    </CSSection>
  )
}

function PkgOverview({ cs, cfg }) {
  const { accent, dark, specs } = cfg
  const overview = cs.sections.find((s) => s.id === 'overview')
  const paras    = overview?.body?.split('\n\n') ?? []
  return (
    <CSSection title="Project Overview">
      <div className="pkg-overview-grid">
        <Reveal delay={0.08} className="pkg-overview-text">
          {paras.map((p, i) => <p key={i} style={{ color: dark + 'bb', lineHeight: 1.85, marginBottom: 14 }}>{p}</p>)}
        </Reveal>
        <Reveal delay={0.16} className="pkg-spec-stack" style={{ '--pkg-accent': accent }}>
          {specs.map(({ label, value }) => (
            <div key={label} className="pkg-spec-row">
              <span className="pkg-spec-label">{label}</span>
              <span className="pkg-spec-value" style={{ color: dark }}>{value}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </CSSection>
  )
}

function PkgGallery({ cfg }) {
  const { images, galleryLayout = 'two-then-one' } = cfg
  const [a, b, c] = images
  return (
    <CSSection title="The Work">
      <Reveal delay={0.06} className="pkg-gallery">
        {galleryLayout === 'two-then-one' ? (
          <>
            <div className="pkg-gallery-row">
              <div className="pkg-gallery-item pkg-gallery-item--half"><img src={a.src} alt={a.alt} /></div>
              <div className="pkg-gallery-item pkg-gallery-item--half"><img src={b.src} alt={b.alt} /></div>
            </div>
            {c && <div className="pkg-gallery-item pkg-gallery-item--full"><img src={c.src} alt={c.alt} /></div>}
          </>
        ) : galleryLayout === 'one-then-two' ? (
          <>
            <div className="pkg-gallery-item pkg-gallery-item--full"><img src={a.src} alt={a.alt} /></div>
            <div className="pkg-gallery-row">
              {b && <div className="pkg-gallery-item pkg-gallery-item--half"><img src={b.src} alt={b.alt} /></div>}
              {c && <div className="pkg-gallery-item pkg-gallery-item--half"><img src={c.src} alt={c.alt} /></div>}
            </div>
          </>
        ) : (
          // three equal
          <div className="pkg-gallery-row pkg-gallery-row--three">
            {images.map((img) => <div key={img.src} className="pkg-gallery-item pkg-gallery-item--third"><img src={img.src} alt={img.alt} /></div>)}
          </div>
        )}
      </Reveal>
    </CSSection>
  )
}

function PkgHighlights({ cfg }) {
  const { highlights, highlightsTitle, highlightsBody } = cfg
  if (!highlights?.length) return null
  return (
    <CSSection title={highlightsTitle ?? 'Details'} variant="dark">
      {highlightsBody && (
        <Reveal delay={0.06}>
          <p className="cs-vi-body" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 24 }}>{highlightsBody}</p>
        </Reveal>
      )}
      <div className="pkg-highlights">
        {highlights.map(({ name, sub, color }, i) => (
          <Reveal key={name} delay={0.06 + i * 0.05} className="pkg-hl-card">
            {color && <div className="pkg-hl-swatch" style={{ background: color }} />}
            <div className="pkg-hl-info">
              <span className="pkg-hl-name">{name}</span>
              {sub && <span className="pkg-hl-sub">{sub}</span>}
            </div>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

function PkgImpact({ cfg }) {
  const { stats, accent, dark } = cfg
  return (
    <CSSection title="Outcome">
      <div className="pkg-stats">
        {stats.map(({ value, label }, i) => (
          <Reveal key={label} delay={0.06 + i * 0.08} className="pkg-stat">
            <span className="pkg-stat-value" style={{ color: accent }}>{value}</span>
            <span className="pkg-stat-label" style={{ color: dark + '88' }}>{label}</span>
          </Reveal>
        ))}
      </div>
    </CSSection>
  )
}

function PkgLinks({ cs, cfg }) {
  const { linksBody } = cfg
  const links = [
    cs.behance  && { href: cs.behance,  Icon: BehanceSVG,  label: 'Behance'  },
    cs.dribbble && { href: cs.dribbble, Icon: DribbbleSVG, label: 'Dribbble' },
    cs.website  && { href: cs.website,  Icon: GlobeSVG,    label: cs.client ? `${cs.client} Website` : 'Website' },
    cs.amazon   && { href: cs.amazon,   Icon: AmazonSVG,   label: 'View on Amazon' },
    cs.article  && { href: cs.article,  Icon: GlobeSVG,    label: 'Read Article' },
    cs.vimeo    && { href: cs.vimeo,    Icon: VimeoSVG,    label: 'Watch on Vimeo' },
  ].filter(Boolean)
  if (!links.length) return null
  return (
    <CSSection title="View the Project" variant="dark">
      {linksBody && (
        <Reveal delay={0.06}>
          <p className="cs-vi-body" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 28 }}>{linksBody}</p>
        </Reveal>
      )}
      <Reveal delay={0.12} className="pkg-links">
        {links.map(({ href, Icon, label }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="pkg-link-btn">
            <span className="pkg-link-icon"><Icon /></span>
            <span className="pkg-link-label">{label}</span>
            <span className="pkg-link-arrow">↗</span>
          </a>
        ))}
      </Reveal>
    </CSSection>
  )
}

// ── Per-project configs ───────────────────────────────────────────────

const WOODCO_CFG = {
  accent: '#C8785A', dark: '#2E2218', light: '#FAF5EE',
  heroSrc: `${BASE}woodco/woodco3.png`,
  heroLabel: 'WOODCO candle packaging — all 6 labels',
  images: [
    { src: `${BASE}woodco/woodco1.png`, alt: 'Spiced Citrus, Spring Rain and Wild Garden lifestyle shot' },
    { src: `${BASE}woodco/woodco2.png`, alt: 'Nightlight, Negroni and Waves lifestyle shot' },
    { src: `${BASE}woodco/woodco3.png`, alt: 'All 6 WOODCO candle labels flat lay' },
  ],
  galleryLayout: 'two-then-one',
  specs: [
    { label: 'Client',    value: 'WOODCO' },
    { label: 'Sector',    value: 'Lifestyle / Home' },
    { label: 'Location',  value: 'Hong Kong' },
    { label: 'Timeline',  value: 'May 2021' },
    { label: 'Duration',  value: '2 Weeks' },
    { label: 'Revisions', value: '4 Rounds' },
  ],
  highlights: [
    { name: 'Spiced Citrus', sub: 'Sandalwood · Ginger Flower · Grapefruit', color: '#C8785A' },
    { name: 'Spring Rain',   sub: 'Matcha · Guava · Rain',                   color: '#D4948A' },
    { name: 'Wild Garden',   sub: 'Patchouli · Cypress · Yellow Rose',       color: '#6B8C72' },
    { name: 'Nightlight',    sub: 'Cedar · Fig · Ylang Ylang',               color: '#2E3D4F' },
    { name: 'Negroni',       sub: 'Ispahan Wood · Cinnamon · Orange',        color: '#8B2B4A' },
    { name: 'Waves',         sub: 'Sea Salt · Ocean · Coconut',              color: '#5C7FA8' },
  ],
  highlightsTitle: 'The Collection',
  highlightsBody: 'Six fragrance blends — each with its own visual identity built from the same abstract shape language and contrasting colour palette.',
  stats: [
    { value: 6,  label: 'Scent Labels'    },
    { value: 2,  label: 'Weeks Timeline'  },
    { value: 4,  label: 'Revision Rounds' },
    { value: 1,  label: 'Happy Client'    },
  ],
  linksBody: 'See the full project on Behance and Dribbble, or visit WOODCO\'s website.',
}

const LTR_CFG = {
  accent: '#B86048', dark: '#2E1810', light: '#F5EDE0',
  heroSrc: `${BASE}la-terra-rossa/laterrarossa3.png`,
  heroLabel: 'La Terra Rossa coffee packaging spread',
  images: [
    { src: `${BASE}la-terra-rossa/laterrarossa1.png`, alt: 'La Terra Rossa Farewell Blend bags — mountain illustration' },
    { src: `${BASE}la-terra-rossa/laterrarossa2.png`, alt: 'La Terra Rossa Farewell Blend bags — abstract illustration' },
    { src: `${BASE}la-terra-rossa/laterrarossa3.png`, alt: 'La Terra Rossa full packaging spread' },
  ],
  galleryLayout: 'two-then-one',
  specs: [
    { label: 'Client',    value: 'La Terra Rossa' },
    { label: 'Sector',    value: 'Food & Beverage' },
    { label: 'Location',  value: 'Portland, Oregon' },
    { label: 'Includes',  value: 'Logo Redesign + Packaging' },
    { label: 'Duration',  value: '1 Week' },
    { label: 'Product',   value: 'Coffee Bags' },
  ],
  stats: [
    { value: 2,  label: 'Packaging Designs'  },
    { value: 1,  label: 'Logo Illustration'  },
    { value: 1,  label: 'Week Delivered'     },
    { value: 1,  label: 'Happy Client'       },
  ],
  linksBody: 'Visit the La Terra Rossa website.',
}

const OC_CFG = {
  accent: '#B89060', dark: '#3C3028', light: '#F8F0E8',
  heroSrc: `${BASE}oracle-cards/oracle1.png`,
  heroLabel: 'Self Awakening Oracle Cards — card samples',
  images: [
    { src: `${BASE}oracle-cards/oracle1.png`, alt: 'Oracle cards — Protection, Truthfulness, Acceptance, Healing' },
    { src: `${BASE}oracle-cards/oracle2.png`, alt: 'Oracle cards — Perseverance, Balance, Resilience, Sorrow' },
    { src: `${BASE}oracle-cards/oracle3.png`, alt: 'Oracle cards — Self-Awakening, Judgement, Frustration, Rituals' },
  ],
  galleryLayout: 'one-then-two',
  specs: [
    { label: 'Client',    value: 'Annalisa Brizzante' },
    { label: 'Sector',    value: 'Publishing / Wellness' },
    { label: 'Format',    value: 'Book Illustrations' },
    { label: 'Cards',     value: '41 Unique Illustrations' },
    { label: 'Duration',  value: '2 Months' },
    { label: 'Style',     value: 'Mixed Media' },
  ],
  stats: [
    { value: 41, label: 'Unique Illustrations' },
    { value: 2,  label: 'Months of Work'       },
    { value: 1,  label: 'Published Book'       },
    { value: '∞', label: 'Revisions Given'     },
  ],
  linksBody: 'Find the book on Amazon.',
}

const SB_CFG = {
  accent: '#2A7070', dark: '#1A3838', light: '#EEF5F5',
  heroSrc: `${BASE}signature-balm/southshorn1.png`,
  heroLabel: 'Signature Balm piercing care tin packaging',
  images: [
    { src: `${BASE}signature-balm/southshorn1.png`, alt: 'Signature Balm single tin — angled view' },
    { src: `${BASE}signature-balm/southshorn2.png`, alt: 'Signature Balm — multiple tins' },
    { src: `${BASE}signature-balm/southshorn3.png`, alt: 'Signature Balm tin — top view' },
  ],
  galleryLayout: 'one-then-two',
  specs: [
    { label: 'Client',    value: 'SouthShore Adornments' },
    { label: 'Sector',    value: 'Wellness / Body Jewellery' },
    { label: 'Location',  value: 'United Kingdom' },
    { label: 'Product',   value: 'Signature Balm 20ml' },
    { label: 'Duration',  value: '2 Weeks' },
    { label: 'Format',    value: 'Tin Packaging' },
  ],
  stats: [
    { value: 1,  label: 'Tin Packaging Design' },
    { value: 2,  label: 'Weeks Delivered'      },
    { value: 1,  label: 'Pattern System'       },
    { value: 1,  label: 'Happy Client'         },
  ],
  linksBody: 'Visit SouthShore Adornments to see the product.',
}

const SPURGEONS_CFG = {
  accent: '#E07848', dark: '#2C1A10', light: '#FDF5EE',
  heroSrc: null,
  specs: [
    { label: 'Client',    value: 'Spurgeons' },
    { label: 'Sector',    value: 'Charity / Children' },
    { label: 'Location',  value: 'United Kingdom' },
    { label: 'Videos',    value: '5 Explainer Videos' },
    { label: 'Duration',  value: '4 Months' },
    { label: 'Campaign',  value: 'ED Awareness Week' },
  ],
  stats: [
    { value: 5,    label: 'Explainer Videos'  },
    { value: 60,   label: 'Illustrations Made' },
    { value: 4,    label: 'Month Timeline'     },
    { value: '2-3', label: 'Min per Video'     },
  ],
  linksBody: 'Read the full article on the Spurgeons website or watch the videos on their Vimeo channel.',
}

// ── Per-project case study views ──────────────────────────────────────

function SpurgeonsEDCaseStudyView({ cat, cs, slide }) {
  return (
    <div className="cs-wrap pkg-case-study">
      <PkgHero cs={cs} slide={slide} cfg={SPURGEONS_CFG} />
      <PkgOverview cs={cs} cfg={SPURGEONS_CFG} />
      <PkgImpact cfg={SPURGEONS_CFG} />
      <PkgLinks cs={cs} cfg={SPURGEONS_CFG} />
      <CSCTA cat={cat} />
    </div>
  )
}

function WoodcoCaseStudyView({ cat, cs, slide }) {
  return (
    <div className="cs-wrap pkg-case-study">
      <PkgHero cs={cs} slide={slide} cfg={WOODCO_CFG} />
      <PkgOverview cs={cs} cfg={WOODCO_CFG} />
      <PkgGallery cfg={WOODCO_CFG} />
      <PkgHighlights cfg={WOODCO_CFG} />
      <PkgImpact cfg={WOODCO_CFG} />
      <PkgLinks cs={cs} cfg={WOODCO_CFG} />
      <CSCTA cat={cat} />
    </div>
  )
}

function LTRCaseStudyView({ cat, cs, slide }) {
  return (
    <div className="cs-wrap pkg-case-study">
      <PkgHero cs={cs} slide={slide} cfg={LTR_CFG} />
      <PkgOverview cs={cs} cfg={LTR_CFG} />
      <PkgGallery cfg={LTR_CFG} />
      <PkgImpact cfg={LTR_CFG} />
      <PkgLinks cs={cs} cfg={LTR_CFG} />
      <CSCTA cat={cat} />
    </div>
  )
}

function OCCaseStudyView({ cat, cs, slide }) {
  return (
    <div className="cs-wrap pkg-case-study">
      <PkgHero cs={cs} slide={slide} cfg={OC_CFG} />
      <PkgOverview cs={cs} cfg={OC_CFG} />
      <PkgGallery cfg={OC_CFG} />
      <PkgImpact cfg={OC_CFG} />
      <PkgLinks cs={cs} cfg={OC_CFG} />
      <CSCTA cat={cat} />
    </div>
  )
}

function SBCaseStudyView({ cat, cs, slide }) {
  return (
    <div className="cs-wrap pkg-case-study">
      <PkgHero cs={cs} slide={slide} cfg={SB_CFG} />
      <PkgOverview cs={cs} cfg={SB_CFG} />
      <PkgGallery cfg={SB_CFG} />
      <PkgImpact cfg={SB_CFG} />
      <PkgLinks cs={cs} cfg={SB_CFG} />
      <CSCTA cat={cat} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  CASE STUDY VIEWS — routes to CBS or PGM based on slide.id
// ═══════════════════════════════════════════════════════════════════════

const CBS_ILLUS_IMAGES = [1, 2, 3, 4, 5, 6].map(
  (n) => `${BASE}cbs/illustrations/Illustration${n}.webp`
)

function CBSCaseStudyView({ cat, cs, slide }) {
  return (
    <div className="cs-wrap">
      <CSHero           cs={cs} slide={slide} />
      <CSFlipbook />
      <CSOverview       cs={cs} />
      <CSBrief          cs={cs} />
      <CSTimeline />
      <CSStrategy       cs={cs} />
      <CSVisualIdentity cs={cs} />
      <IllustrationsSection images={CBS_ILLUS_IMAGES} colors={CBS_GALLERY_COLORS} />
      <CSImpact />
      <CSCTA            cat={cat} />
    </div>
  )
}

const PGM_ILLUS_IMAGES = [1, 2, 3, 4, 5, 6].map(
  (n) => `${BASE}pgm/illustrations/Illustration${n}.webp`
)

function PGMCaseStudyView({ cat, cs, slide }) {
  return (
    <div className="cs-wrap pgm-case-study">
      <PGMHero           cs={cs} slide={slide} />
      <PGMFlipbook />
      <PGMOverview       cs={cs} />
      <PGMBrief          cs={cs} />
      <PGMProcess />
      <PGMStrategy       cs={cs} />
      <PGMVisualIdentity cs={cs} />
      <IllustrationsSection images={PGM_ILLUS_IMAGES} colors={PGM_GALLERY_COLORS} />
      <PGMImpact />
      <CSCTA             cat={cat} />
    </div>
  )
}

function CaseStudyView({ cat, slide }) {
  const cs = slide.caseStudy
  if (cat.id === 'packaging') {
    if (slide.id === 1) return <WoodcoCaseStudyView    cat={cat} cs={cs} slide={slide} />
    if (slide.id === 2) return <LTRCaseStudyView       cat={cat} cs={cs} slide={slide} />
    if (slide.id === 3) return <OCCaseStudyView        cat={cat} cs={cs} slide={slide} />
    if (slide.id === 4) return <SBCaseStudyView        cat={cat} cs={cs} slide={slide} />
  }
  if (cat.id === 'motion') {
    if (slide.id === 2) return <SpurgeonsEDCaseStudyView cat={cat} cs={cs} slide={slide} />
  }
  if (cat.id === 'branding' && slide.id === 2) return <PGMCaseStudyView cat={cat} cs={cs} slide={slide} />
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
