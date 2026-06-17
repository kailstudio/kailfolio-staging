/**
 * SiteHeader.jsx — Fixed glassmorphism navigation header
 *
 * Always visible at z:100 above all page content.
 * High transparency so the animated aurora + bubbles remain visible beneath.
 * Logo sits left with clean spacing, matching the project-detail header aesthetic.
 */

import { motion } from 'framer-motion'

export default function SiteHeader() {
  return (
    <motion.header
      className="site-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      aria-label="Studio KAIL site navigation"
    >
      <div className="site-header-inner">
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="Studio KAIL"
          className="site-header-logo"
          draggable={false}
        />
      </div>
    </motion.header>
  )
}
