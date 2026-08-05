/**
 * SiteHeader.jsx — Fixed glassmorphism navigation header
 *
 * Logo left, category nav right. Hovering a category reveals a
 * glassmorphism dropdown panel with all projects in that category.
 * Clicking a project fires onProjectOpen(cat, slide) to open the
 * project detail overlay (same callback PortfolioSection uses).
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES } from './PortfolioSection.jsx'

const BASE = import.meta.env.BASE_URL

// Short nav labels derived from category id
const NAV_LABEL = { brand: 'Brand', motion: 'Motion', packaging: 'Packaging', web: 'Web' }

// Whimsical spring — grows out of the label with a noticeable overshoot and
// a slight tilt that corrects itself, so it feels alive rather than mechanical.
// scaleX starts narrow (pinched at the label) and pops outward faster than
// scaleY, exaggerating the "extruded" quality. rotate adds a playful lean
// that snaps back via its own spring. Exit stays fast & clean.
const DROPDOWN_VARIANTS = {
  hidden: {
    scaleY: 0,
    scaleX: 0.65,
    rotate: -2.5,
    opacity: 0,
    transition: { duration: 0.14, ease: [0.4, 0, 1, 1] },
  },
  visible: {
    scaleY: 1,
    scaleX: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      scaleY: { type: 'spring', stiffness: 260, damping: 17, mass: 0.7 },
      scaleX: { type: 'spring', stiffness: 380, damping: 20, mass: 0.55 },
      rotate: { type: 'spring', stiffness: 300, damping: 18, mass: 0.6 },
      opacity: { duration: 0.06 },
    },
  },
}

// Each project card pops in with a staggered spring — i is the card index
// passed via Framer Motion's `custom` prop.
const PROJECT_VARIANTS = {
  hidden: { opacity: 0, scale: 0.82, y: 6 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 22,
      mass: 0.6,
      delay: 0.06 + i * 0.045,
    },
  }),
}

export default function SiteHeader({ onProjectOpen }) {
  const [activeId, setActiveId] = useState(null)
  // Timeout ref lets us add a small close delay so moving from button → dropdown
  // doesn't close the panel mid-hover when the cursor briefly leaves the button.
  const closeTimer = useRef(null)

  const openMenu = useCallback((id) => {
    clearTimeout(closeTimer.current)
    setActiveId(id)
  }, [])

  const closeMenu = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveId(null), 120)
  }, [])

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimer.current)
  }, [])

  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.header
      className="site-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      aria-label="Studio KAIL site navigation"
    >
      <div className="site-header-inner">
        {/* Logo — scrolls to top */}
        <button
          className="site-header-logo-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <img
            src={`${BASE}logo.svg`}
            alt="Studio KAIL"
            className="site-header-logo"
            draggable={false}
          />
        </button>

        {/* Category nav */}
        <nav className="site-nav" aria-label="Portfolio categories">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="site-nav-item"
              onMouseEnter={() => openMenu(cat.id)}
              onMouseLeave={closeMenu}
            >
              <button
                className={`site-nav-btn${activeId === cat.id ? ' is-active' : ''}`}
                onClick={scrollToWork}
                aria-expanded={activeId === cat.id}
                aria-haspopup="true"
              >
                {NAV_LABEL[cat.id] ?? cat.id}
                <svg
                  className="site-nav-chevron"
                  viewBox="0 0 10 6"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <AnimatePresence>
                {activeId === cat.id && cat.slides?.length > 0 && (
                  <motion.div
                    className="site-nav-dropdown"
                    role="menu"
                    variants={DROPDOWN_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    style={{ transformOrigin: 'top center' }}
                    onMouseEnter={cancelClose}
                    onMouseLeave={closeMenu}
                  >
                    <div className="site-nav-dropdown-grid">
                      {cat.slides.map((slide, i) => (
                        <motion.button
                          key={slide.id}
                          className={`site-nav-project${slide.comingSoon ? ' site-nav-project--soon' : ''}`}
                          role="menuitem"
                          custom={i}
                          variants={PROJECT_VARIANTS}
                          disabled={slide.comingSoon}
                          onClick={() => {
                            if (slide.comingSoon) return
                            setActiveId(null)
                            clearTimeout(closeTimer.current)
                            onProjectOpen?.(cat, slide)
                          }}
                        >
                          {slide.comingSoon ? (
                            <div className="site-nav-project-soon-placeholder">
                              Coming Soon
                            </div>
                          ) : (
                            <div
                              className="site-nav-project-thumb"
                              style={{ background: slide.bg || '#e8e4f8' }}
                            >
                              {slide.img && (
                                <img
                                  src={`${BASE}${slide.img}`}
                                  alt=""
                                  className="site-nav-project-img"
                                />
                              )}
                              <span className="site-nav-project-label">{slide.label}</span>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>
    </motion.header>
  )
}
