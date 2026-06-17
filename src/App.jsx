import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSequence from './components/HeroSequence.jsx'
import PortfolioSection from './components/PortfolioSection.jsx'
import ProjectDetail from './components/ProjectDetail.jsx'
import './styles.css'

export default function App() {
  const [detailCat, setDetailCat] = useState(null)

  return (
    <main className="app">
      {/* Aurora gradient — fixed, behind everything */}
      <div className="app-bg" aria-hidden="true" />

      {/*
       * Split-screen layout
       *   Left  (45 %)  — scrollable portfolio column, solid background
       *   Right (55 %)  — sticky animation panel, transparent (shows aurora)
       *
       * All animation elements (char, logo, bubbles) are position:fixed with
       * left:45% so they live exclusively in the right viewport column.
       */}
      <div className="site-split">

        {/*
         * LEFT: portfolio content — fades in on load, simultaneously with right.
         * HeroSequence renders only position:fixed elements (no left-column content),
         * so the portfolio section is visible from the first frame.
         */}
        <motion.div
          className="split-left"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroSequence />
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
