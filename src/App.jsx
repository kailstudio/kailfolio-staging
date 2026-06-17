import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSequence from './components/HeroSequence.jsx'
import PortfolioSection from './components/PortfolioSection.jsx'
import ProjectDetail from './components/ProjectDetail.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import './styles.css'

export default function App() {
  const [detailCat, setDetailCat] = useState(null)

  return (
    <main className="app">
      {/* Aurora gradient — fixed, behind everything */}
      <div className="app-bg" aria-hidden="true" />

      {/* Fixed glass header — always visible above all content */}
      <SiteHeader />

      {/*
       * Split-screen layout
       *   Left  (45 %)  — scrollable portfolio column, solid background
       *   Right (55 %)  — sticky animation panel, transparent (shows aurora)
       *
       * All animation elements (char, logo, bubbles) are position:fixed with
       * left:45% so they live exclusively in the right viewport column.
       */}
      {/*
       * HeroSequence is rendered at the App root — NOT inside the split-left
       * motion.div. Framer Motion applies a CSS transform to run the fade-in
       * animation; any position:fixed descendant of a transformed element is
       * contained by that element rather than the viewport. Moving HeroSequence
       * here ensures its position:fixed bubble panel and character track are
       * truly full-viewport.
       */}
      <HeroSequence />

      <div className="site-split">

        {/* LEFT: portfolio content — fades in on load */}
        <motion.div
          className="split-left"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <PortfolioSection onProjectOpen={setDetailCat} />
        </motion.div>

        {/* RIGHT: transparent — aurora shows through; animation is position:fixed */}
        <div className="split-right" aria-hidden="true" />

      </div>

      {/*
       * Project detail — rendered at App root so position:fixed covers the
       * full viewport regardless of split layout or backdrop-filter contexts.
       */}
      <AnimatePresence>
        {detailCat && (
          <ProjectDetail
            key={detailCat.id}
            cat={detailCat}
            onClose={() => setDetailCat(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
