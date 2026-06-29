/**
 * PortfolioSection.jsx
 *
 * Left column: headline → subtitle → body → accordion category pills.
 * Each pill expands a RAF-driven infinite auto-scroll carousel.
 * Cards: lime / lilac alternating, oval image, tag chips, bordered title pill.
 * Mobile: native horizontal swipe, no auto-scroll.
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, useMotionValue, LayoutGroup } from 'framer-motion'
import { TextRotate } from './TextRotate'

// ── Carousel constants ───────────────────────────────────────────────
const CARD_W    = 210   // px — card width inside the track
const CARD_GAP  = 12    // px — gap between cards
const SPEED_PPS = 24    // px/s ≈ one card every 8–9 s

// ── Brand colour classes (tints applied via CSS on glass cards) ──────
// Even → lilac tint  |  Odd → blue tint

// Converts hex → rgba for tinted oval placeholders
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Category + project data ──────────────────────────────────────────
export const CATEGORIES = [
  {
    id: 'brand',
    name: 'Brand Strategy, Voice & Identity',
    tagline: 'Purposeful identity for organisations that mean what they say.',
    description:
      'We craft brand foundations for mission-driven organisations — building positioning, visual identity, messaging architecture, and tone of voice into cohesive systems that scale across every touchpoint and stand the test of time.',
    accent: '#C4B8F0',
    accentDark: '#7050d8',
    stats: [
      { label: 'Brands Developed', value: '2+' },
      { label: 'Mission Alignment', value: '100%' },
      { label: 'Repeat Clients',   value: '✦' },
    ],
    slides: [
      {
        id: 1, bg: '#C4B8F0', label: 'Care-Based Safety',
        tags: ['Brand Strategy', 'Visual Identity', 'Tone of Voice'],
        caseStudy: {
          subtitle: 'Brand Strategy · Visual Identity · Tone of Voice',
          year: '2024',
          duration: '1 month',
          location: 'Washtenaw County, Michigan',
          status: 'Completed — organisation closed before launch',
          sections: [
            {
              id: 'overview',
              label: '01',
              title: 'Project Overview',
              body: `Care-Based Safety was a community-rooted organisation operating in Washtenaw County, Michigan — building and advocating for non-police crisis response, prevention-first systems, and community-led approaches to public safety. Grounded in abolitionist principles, CBS held a conviction that safety is fundamentally relational: something that grows through care, connection, and shared power rather than surveillance or enforcement.\n\nTheir work was urgent and necessary. But their brand hadn't yet caught up with the depth of that conviction. As CBS's advocacy grew more sophisticated and their audience more varied — from people reaching out in crisis to institutional funders to government partners — they needed an identity that could carry all of it: warmth and rigour, accessibility and credibility, community-rootedness and strategic ambition.`,
            },
            {
              id: 'brief',
              label: '02',
              title: 'The Brief',
              body: `Studio KAIL was engaged to develop a complete brand identity and visual system from the ground up, working across six structured phases: Discovery, Logo Development, Colour & Typography, Imagery & Iconography, Voice & Messaging, and Final Handover.\n\nThe brief was clear: build a brand with enough humanity to feel trustworthy to someone reaching out in a moment of crisis, enough credibility to earn the attention of funders and policy partners, and enough visual coherence to deploy consistently across every touchpoint — social, digital, print, campaign, and community resources. Success meant a brand that could communicate the same conviction, with the same integrity, across radically different rooms.`,
            },
            {
              id: 'strategy',
              label: '03',
              title: 'Research & Strategy',
              body: `The discovery phase began with a thorough review of CBS's existing materials, communications, and public presence, combined with audience and competitor research to map the landscape of peer organisations. The key insight: CBS's visual language needed to step entirely outside the iconographic vocabulary of conventional public safety — no shields, no badges, no enforcement symbols — and find a register grounded in care, growth, and collective energy instead.\n\nThree audience tiers shaped the messaging architecture. For community members and service users, the brand speaks directly, plainly, and with care — meeting people where they are. For funders, partners, and activists, it connects abolitionist values to measurable outcomes. For government agencies and more sceptical public audiences, it leads with results, framing care as common sense rather than ideology. The brand personality across all three: abolitionist, compassionate, imaginative, co-created, and trustworthy. Calm but firm. Relational, not institutional.`,
            },
            {
              id: 'visual',
              label: '04',
              title: 'Visual Identity',
              subsections: [
                {
                  title: 'The Logo',
                  body: `The creative exploration opened with two directions. Beam proposed a radiating circular form with hand-drawn expressive strokes — evoking warmth, collective energy, and care radiating outward from community. Root proposed a tree with visible roots, referencing ancestral knowledge and long-term investment in community flourishing.\n\nThe Beam direction was selected and refined into the final mark: a 16-ray sunburst built on a precise circular grid, with organic hand-drawn strokes softening the geometry. The radiating forms read simultaneously as sunbeams, flower petals, and ribbons — warmth, growth, and celebration layered into a single symbol. At the centre sits a single point: community as the source from which safety radiates outward. Beneath the expressiveness lies rigorous geometry — all proportions scaling from a single base measurement, 16 segments distributed evenly across 360°. This combination of organic mark-making and architectural precision mirrors CBS's own approach: compassion working within thoughtful frameworks to create collective safety.`,
                },
                {
                  title: 'Colour Palette',
                  body: `Four palette directions were explored, from Modern & Confident (electric blues and purples) to Ancestral & Calm (sage and warm yellows). The final selection was the Earthy & Natural palette: deep espresso (#332824) as anchor, warm cream (#F9F0E6) as the primary ground, with muted steel blue, soft mint, and warm peach completing the system. The palette communicates stability and warmth without institutional coldness — grounded and approachable, never clinical.`,
                  swatches: ['#332824', '#F9F0E6', '#86A3B3', '#B1D1CE', '#F9C595'],
                },
                {
                  title: 'Typography',
                  body: `Montserrat SemiBold carries headers with clarity and confidence. Montserrat Light handles subheadings and body text with the openness required for a 6th-grade reading level — ensuring the brand communicates equally well in a funding application and a community resource leaflet.`,
                },
                {
                  title: 'Illustration & Iconography',
                  body: `Soft, rounded character illustrations drawn in the brand palette keep visuals human and accessible. Flat forms and minimal linework avoid visual noise. Scenes centre human connection and mutual support over authority — figures portrayed with dignity, strength, and autonomy. Never as passive recipients of care. The icon system reinforces the same vocabulary: communication, partnership, health, home, growth, and advocacy, rendered with consistent warmth and purpose.`,
                },
                {
                  title: 'Photography Direction',
                  body: `Candid, community-rooted, and dignity-centred. Soft natural light, minimal staging, genuine moments of connection and ease. People are portrayed with strength and agency — never as subjects of care, always as participants within it. Place-based imagery from Washtenaw County reinforces local trust and community ownership.`,
                },
              ],
            },
            {
              id: 'applications',
              label: '05',
              title: 'Applications',
              body: `The identity was designed to scale across every surface CBS needed. Social media content (illustrated tiles, photography-led posts, campaign messaging: "Care keeps communities safe", "Safety is relational", "You deserve care, not punishment"). A responsive website built around the brand headline. Print collateral, merchandise, and community resource documents. Presentations for funders and policy partners. Each application holds the same conviction — the same warmth, the same clarity, the same belief that safety begins with care.`,
            },
            {
              id: 'outcome',
              label: '06',
              title: 'Outcome',
              body: `The project was completed in full across all six phases — brand guidelines delivered, logo system finalised, visual language codified, messaging architecture established. Care-Based Safety closed before the new identity could be launched, due to funding constraints outside the organisation's control.\n\nThe rebrand remains a complete strategic and creative work — a full brand system, built with intention, that demonstrates what it looks like when an organisation's values are translated into visual language without compromise.`,
            },
            {
              id: 'reflection',
              label: '07',
              title: 'Reflection',
              body: `This project is a reminder of what design is actually for. CBS's work asked for a visual language capable of holding real contradiction — warm enough for crisis, rigorous enough for policy, radical enough for its mission, legible enough for everyone. Meeting that brief demanded genuine stake, not just craft.\n\nIt demonstrates what becomes possible when strategy, empathy, and visual systems are built together without compromise — and continues to shape how I approach work with organisations creating real change, regardless of whether that work ever sees the light of day.`,
            },
          ],
        },
      },
      {
        id: 2, bg: '#2C365E', label: 'PGM',
        tags: ['Brand Strategy', 'Community Design', 'Visual Identity'],
        caseStudy: {
          subtitle: 'Brand Strategy · Visual Identity · Community Voice',
          year: '2024',
          duration: '6 Phases',
          location: 'Global',
          status: 'Delivered',
          sections: [
            {
              id: 'overview',
              label: '01',
              title: 'Project Overview',
              body: `The Participatory Grantmaking Community (PGM) is a global movement working to shift power in philanthropy by centring the knowledge and decision-making of communities. It represents a more equitable and transparent approach to funding — through peer learning, resource sharing, and advocacy, grounded in values of self-determination, accountability, care, and collective learning.\n\nPGM challenges traditional top-down systems by amplifying lived experience and supporting communities to shape the decisions that affect them, while fostering trust, openness, and continuous reflection across the sector. Its visual identity needed to be warm, human, and grounded in real environments — and its tone conversational, clear, and inclusive, speaking with communities rather than about them.`,
            },
            {
              id: 'brief',
              label: '02',
              title: 'The Brief',
              body: `Studio KAIL was engaged to develop a complete set of brand guidelines for PGM across six structured phases: Brand Discovery & Direction, Logo Refinement & Colour & Typography Systems, Imagery & Photography Style, Graphics & Iconography, Voice Messaging & Brand Applications, and Final Guidelines & Handover.\n\nThe brief demanded a visual identity that could serve an extraordinarily broad coalition — from grassroots activists and community leaders to experienced funders exploring power-sharing, to newcomers to participatory practice. The brand needed to feel simultaneously global and intimate, rigorous and warm, principled and accessible. A document that practitioners worldwide could reach for — and find themselves represented within it.`,
            },
            {
              id: 'strategy',
              label: '03',
              title: 'Research & Strategy',
              body: `The discovery phase began with an audit of PGM's existing materials, communications, and public presence, combined with research into peer organisations working across participatory philanthropy and community grantmaking. The key strategic challenge: building a brand that could speak credibly and warmly to four distinct audience segments simultaneously — activists, philanthropy professionals, industry newcomers, and social media audiences.\n\nThree audience tiers shaped the messaging architecture. For community leaders: affirming, respectful, solidarity-driven — acknowledging their leadership as powerful. For philanthropy professionals: practical, encouraging, peer-to-peer. For newcomers: it normalises experimentation and frames complexity accessibly. Across all: conversational, not corporate. Warm, not institutional. Clear, not academic. Grounded in joy and possibility.`,
            },
            {
              id: 'visual',
              label: '04',
              title: 'Visual Identity',
              subsections: [
                {
                  title: 'The Logo',
                  body: `The PGM logo symbol is built on the principles of connection, equality, and movement. It is formed by four abstract figures interlinked in a continuous circle — representing people coming together to share power and shape decisions collectively. Built on a circular structure to represent inclusivity, equality, and wholeness, with symmetrical balance creating a sense of trust, stability, and collective strength. The arms connect in a seamless rhythm to show collaboration and continuous relationship.`,
                },
                {
                  title: 'Colour Palette',
                  body: `The PGM palette is warm and grounded. Midnight Slate (#2C365E) anchors the identity with depth and authority — the gravity of principled work. Muted Teal (#4F8C8C) brings calm and connection. Burnt Orange (#E76235) introduces energy, joy, and urgency without alarm. Golden Ochre (#EBB363) adds warmth and optimism. Linen White (#F0EDE7) provides breathing room — the open, airy ground on which the community gathers.`,
                  swatches: ['#2C365E', '#4F8C8C', '#E76235', '#EBB363', '#F0EDE7'],
                },
                {
                  title: 'Typography',
                  body: `Cal Sans Regular carries headlines with warmth and a hint of informality that resists institutional coldness — a humanist display face that feels contemporary without feeling corporate. Darker Grotesque handles body text and subheadings with clarity and legibility across all reading levels. The pairing balances ambition with accessibility, reflecting PGM's commitment to speaking clearly with communities rather than at them.`,
                },
                {
                  title: 'Illustration & Graphics',
                  body: `Flat vector illustration style with minimal shading and clean, solid colour fills. Simplified geometric character forms with minimal facial detail allow for inclusive representation across age, ability, and identity. Warm, muted palette with soft contrast. Editorial, storytelling compositions focused on collaboration and community. Light, airy layouts with generous white space and soft organic accents.`,
                },
              ],
            },
            {
              id: 'applications',
              label: '05',
              title: 'Applications',
              body: `The PGM identity was designed to scale across the full range of surfaces a global community network requires. Social media content — posts, templates, and campaign graphics for community-building and sector influence. Report and document templates maintaining consistent voice and visual quality across all publications. Presentation decks for practitioners sharing knowledge. Business card and letterhead systems creating professional cohesion across a distributed team. The illustrations and graphic language extend into iconography, infographics, and editorial layouts — ensuring every touchpoint carries the same warmth and clarity as the core brand.`,
            },
            {
              id: 'outcome',
              label: '06',
              title: 'Outcome',
              body: `The project was delivered in full across all six phases — comprehensive brand guidelines completed, logo system finalised with clear variations and usage rules, colour and typography systems codified, imagery and illustration direction established, voice and messaging framework built, and brand application templates produced.\n\nPGM now has a visual identity that reflects the depth and ambition of its work: warm enough to welcome newcomers, rigorous enough for sector credibility, flexible enough to work across a genuinely global community operating across many contexts and languages. A brand that speaks with communities — not about them.`,
            },
            {
              id: 'reflection',
              label: '07',
              title: 'Reflection',
              body: `PGM asked something unusual of visual design: not simply to represent an organisation, but to embody a methodology. A brand for participatory grantmaking must itself be participatory in spirit — open, clear, accessible, and centred on the people it serves rather than the institution behind it.\n\nThe result is a visual system that practises what PGM preaches: clear language without jargon, warmth without sentimentality, ambition without hierarchy. It continues to remind me that the most powerful brand work is invisible — not because it disappears, but because it makes what matters most feel inevitable.`,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'motion',
    name: 'Motion Design & Animation',
    tagline: 'Animation that moves minds, not just pixels.',
    description:
      'From charity sector explainers to brand reels and mindfulness toolkits, we create motion work that communicates complex ideas with warmth, clarity, and lasting impact — across digital platforms, presentations, and broadcast.',
    accent: '#A8C4EC',
    accentDark: '#2a60c8',
    stats: [
      { label: 'Projects Delivered', value: '7+' },
      { label: 'Sectors',            value: '3+' },
      { label: 'Client Repeat Rate', value: '80%' },
    ],
    slides: [
      {
        id: 1, bg: '#B8D4EC', label: 'Well_Lab',
        tags: ['Motion Design', 'Brand Animation', 'Social Content'],
      },
      {
        id: 2, bg: '#F0C8B0', label: 'Spurgeons ED',
        tags: ['Motion Design', 'Explainer Video', 'Charity'],
      },
      {
        id: 3, bg: '#C0D4B8', label: 'AMZsite',
        tags: ['Motion Design', 'Health & Wellbeing', 'Educational'],
      },
      {
        id: 4, bg: '#A8C0E4', label: 'Youtube Promo',
        tags: ['Motion Design', 'Mindfulness', 'Wellness'],
      },
      {
        id: 5, bg: '#B4D0A8', label: 'TapIn App',
        tags: ['Motion Design', 'Mindfulness', 'Animation'],
      },
      {
        id: 6, bg: '#C4B4F0', label: 'W&G Wedding Invite',
        tags: ['Motion Design', 'Brand Animation', 'Self-Promotion'],
      },
      {
        id: 7, bg: '#D4CCE8', label: 'Tennis Promo',
        tags: ['Motion Design', 'Illustration', 'Freelance'],
      },
    ],
  },
  {
    id: 'packaging',
    name: 'Packaging, Print & Physical Design',
    tagline: 'Tactile design with shelf presence and soul.',
    description:
      'From artisan food brands to wellness products and spiritual tools, we craft packaging and print that earns attention on shelf, communicates quality at a glance, and tells a story worth holding.',
    accent: '#A8D4BC',
    accentDark: '#3a9068',
    stats: [
      { label: 'Products Designed', value: '5+' },
      { label: 'Countries',         value: '3+' },
      { label: 'Sectors',           value: '3' },
    ],
    slides: [
      {
        id: 1, bg: '#C8B898', img: 'projects/woodco.jpg', label: 'Woodco',
        tags: ['Packaging', 'Label Design', 'Visual Identity'],
      },
      {
        id: 2, bg: '#E8B098', img: 'projects/la-terra-rossa.jpg', label: 'La Terra Rossa',
        tags: ['Packaging', 'Label Design', 'Brand Identity'],
      },
      {
        id: 3, bg: '#C8A8D8', img: 'projects/oracle-cards.jpg', label: 'Oracle Cards',
        tags: ['Print', 'Book Design', 'Visual Identity'],
      },
      {
        id: 4, bg: '#F0C8C0', img: 'projects/signature-balm.jpg', label: 'Signature Balm',
        tags: ['Packaging', 'Label Design', 'Wellness'],
      },
      {
        id: 5, bg: '#F0D898', img: 'projects/lucciola.jpg', label: 'Lucciola',
        tags: ['Packaging', 'Label Design', 'Food & Beverage'],
      },
    ],
  },
  {
    id: 'web',
    name: 'Web, Digital & UX Design',
    tagline: 'Digital experiences are coming.',
    description:
      'Portfolio sites, campaign pages, app UIs, and full design systems — digital presence built with the same craft and intention as every Studio KAIL discipline. Coming soon.',
    accent: '#F0CABB',
    accentDark: '#c06038',
    comingSoon: true,
    stats: [
      { label: 'In Development', value: '✦' },
      { label: 'Launching',      value: '2025' },
      { label: 'Stay tuned',     value: '→' },
    ],
    slides: [],
  },
]

// ── Single project card ──────────────────────────────────────────────
function ProjectCard({ slide, index, onCardClick }) {
  const tint = index % 2 === 0 ? 'pj-card--lilac' : 'pj-card--blue'

  return (
    <div
      className={`pj-card ${tint}`}
      onClick={() => onCardClick?.(slide)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onCardClick?.(slide)}
    >
      {/* Stacked photo cards */}
      <div className="pj-photo-area">
        <div className="pj-photo-stack">
          <div className="pj-photo-back pj-photo-back--2" />
          <div className="pj-photo-back pj-photo-back--1" />
          <div className="pj-photo-front">
            {slide.img ? (
              <div
                className="pj-photo-img"
                style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${slide.img})` }}
              />
            ) : (
              <div
                className="pj-photo-placeholder"
                style={{ background: hexToRgba(slide.bg, 0.35) }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tag chips */}
      {slide.tags && slide.tags.length > 0 && (
        <div className="pj-tags">
          {slide.tags.map((tag, i) => (
            <span key={i} className="pj-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Bordered title pill */}
      <div className="pj-footer">
        <div className="pj-title-pill">
          <span className="pj-title">{slide.label}</span>
          <span className="pj-arrow">↗</span>
        </div>
      </div>
    </div>
  )
}

// ── RAF-driven infinite auto-scroll carousel ─────────────────────────
function InlineCarousel({ slides, visible, onCardClick }) {
  const x            = useMotionValue(0)
  const pausedRef    = useRef(false)   // true while hovering (desktop)
  const rafRef       = useRef(null)
  const prevTimeRef  = useRef(null)

  // Drag state (refs avoid stale closures in RAF)
  const isDragging    = useRef(false)
  const hasDragged    = useRef(false)
  const dragStartX    = useRef(0)
  const dragStartXVal = useRef(0)
  const [grabbing, setGrabbing] = useState(false)

  const tripled     = useMemo(() => [...slides, ...slides, ...slides], [slides])
  const singleWidth = slides.length * (CARD_W + CARD_GAP)

  // RAF auto-scroll — runs on both mobile and desktop
  useEffect(() => {
    if (!visible) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      prevTimeRef.current = null
      return
    }
    const tick = (timestamp) => {
      if (prevTimeRef.current !== null && !pausedRef.current && !isDragging.current) {
        const delta = timestamp - prevTimeRef.current
        let next = x.get() - (SPEED_PPS * delta) / 1000
        if (Math.abs(next) >= singleWidth) next += singleWidth
        x.set(next)
      }
      prevTimeRef.current = timestamp
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [visible, singleWidth])

  // Suppress card click if the pointer moved (drag, not tap); pass slide up
  const handleCardClick = useCallback((slide) => {
    if (hasDragged.current) return
    onCardClick?.(slide)
  }, [onCardClick])

  // ── Pointer drag via window listeners ────────────────────────────
  // Using window listeners (not setPointerCapture) so click events
  // still reach the ProjectCard's onClick handler.
  const onPointerDown = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return
    isDragging.current    = true
    hasDragged.current    = false
    dragStartX.current    = e.clientX
    dragStartXVal.current = x.get()
    setGrabbing(true)

    const onMove = (ev) => {
      if (!isDragging.current) return
      const delta = ev.clientX - dragStartX.current
      if (Math.abs(delta) > 4) hasDragged.current = true
      let next = dragStartXVal.current + delta
      if (next > 0)            next -= singleWidth
      if (next < -singleWidth) next += singleWidth
      x.set(next)
    }

    const onUp = () => {
      isDragging.current = false
      setGrabbing(false)
      window.removeEventListener('pointermove',   onMove)
      window.removeEventListener('pointerup',     onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    window.addEventListener('pointermove',   onMove)
    window.addEventListener('pointerup',     onUp)
    window.addEventListener('pointercancel', onUp)
  }, [x, singleWidth])

  return (
    <div
      className="ic-wrap"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      {/* Mobile: native scroll */}
      <div className="ic-viewport--mobile">
        <div className="ic-track--mobile">
          {slides.map((slide, i) => (
            <ProjectCard
              key={`${slide.id}-m`}
              slide={slide}
              index={i}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>

      {/* Desktop: RAF-driven infinite scroll + pointer drag */}
      <div
        className="ic-viewport"
        onPointerDown={onPointerDown}
        style={{ cursor: grabbing ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
      >
        <motion.div className="ic-track" style={{ x }}>
          {tripled.map((slide, i) => (
            <ProjectCard
              key={`${slide.id}-${i}`}
              slide={slide}
              index={i % slides.length}
              onCardClick={handleCardClick}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ── Coming soon placeholder ──────────────────────────────────────────
function ComingSoonCard() {
  return (
    <div className="pf-coming-soon">
      <div className="pf-coming-soon-pill">
        <span className="pf-coming-soon-dots">
          <span className="pf-coming-soon-dot" />
          <span className="pf-coming-soon-dot" />
          <span className="pf-coming-soon-dot" />
        </span>
        <span className="pf-coming-soon-label">Coming soon</span>
      </div>
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────
export default function PortfolioSection({ onProjectOpen }) {
  const [openId, setOpenId] = useState(null)
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <section className="pf-section" id="work">

      <div className="pf-glass-lip" aria-hidden="true" />

      <div className="pf-inner">
        <div className="pf-left">

          {/* ── Hero headline glass panel ── */}
          <motion.div
            className="hero-text-glass"
            initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            <div className="pf-rotate-wrap">
              <LayoutGroup>
                <h2 className="pf-rotate-line" aria-label="From spark to screen, shelf, sales, and more">

                  <span className="pf-rotate-row">
                    <motion.span
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.20 }}
                    >
                      From
                    </motion.span>

                    <motion.span
                      style={{ display: 'inline-block', position: 'relative' }}
                      initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.33 }}
                    >
                      spark
                      <motion.span
                        className="pf-spark-underline"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94], delay: 1.15 }}
                      />
                    </motion.span>

                    <motion.span
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.41 }}
                    >
                      to
                    </motion.span>
                  </span>

                  <motion.span
                    className="pf-rotate-row"
                    layout
                    initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.46 }}
                  >
                    <TextRotate
                      texts={['screen', 'shelf', 'sales', 'substance', 'sustainability', 'solutions']}
                      mainClassName="pf-rotate-chip"
                      staggerFrom="last"
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '-120%' }}
                      staggerDuration={0.03}
                      splitLevelClassName="pf-rotate-char-slot"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                      rotationInterval={2200}
                    />
                  </motion.span>

                </h2>
              </LayoutGroup>
            </div>

            <motion.p
              className="pf-subtitle"
              initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.58 }}
            >
              and <mark className="hl-between">everything in between.</mark>
            </motion.p>
          </motion.div>

          {/* ── Body copy glass panel ── */}
          <motion.div
            className="pf-body-glass"
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            <p className="pf-body">
              We design strategic brand foundations across identity, websites,
              animation, print, and packaging — building cohesive systems that
              work seamlessly across digital and physical spaces.
            </p>
          </motion.div>

          <div className="pf-cats">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                className={`pf-cat-block${openId === cat.id ? ' open' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 + 0.1, duration: 0.5 }}
              >
                <button
                  className={`pf-pill${openId === cat.id ? ' pf-pill--open' : ''}`}
                  onClick={() => toggle(cat.id)}
                >
                  <span className="pf-pill-name">{cat.name}</span>
                  <span className={`pf-pill-icon${openId === cat.id ? ' rotated' : ''}`}>↙</span>
                </button>

                <div className="pf-carousel-inner">
                  {cat.comingSoon ? (
                    <ComingSoonCard />
                  ) : (
                    <InlineCarousel
                      slides={cat.slides}
                      visible={openId === cat.id}
                      onCardClick={(slide) => onProjectOpen?.(cat, slide)}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
