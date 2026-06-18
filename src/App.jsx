import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSequence from './components/HeroSequence.jsx'
import PortfolioSection from './components/PortfolioSection.jsx'
import ProjectDetail from './components/ProjectDetail.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import './styles.css'

export default function App() {
  const [siteReady, setSiteReady]   = useState(false)
  const [detailCat, setDetailCat]   = useState(null)

  // Stable reference so LoadingScreen's useEffect doesn't re-fire
  const handleReady = useCallback(() => setSiteReady(true), [])

  return (
    <main className="app">
      {/* Aurora gradient — fixed, behind everything */}
      <div className="app-bg" aria-hidden="true" />

      {/* Fixed glass header */}
      <SiteHeader />

      {/*
       * HeroSequence is only mounted once the hero frame has loaded.
       * This prevents a blank right-panel flash before the character appears.
       */}
      {siteReady && <HeroSequence />}

      <div className="site-split">
        <motion.div
          className="split-left"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <PortfolioSection onProjectOpen={setDetailCat} />
        </motion.div>

        <div className="split-right" aria-hidden="true" />
      </div>

      {/* Project detail panel */}
      <AnimatePresence>
        {detailCat && (
          <ProjectDetail
            key={detailCat.id}
            cat={detailCat}
            onClose={() => setDetailCat(null)}
          />
        )}
      </AnimatePresence>

      {/* Loading screen — sits above everything, fades out once hero frame is ready */}
      <AnimatePresence>
        {!siteReady && (
          <LoadingScreen key="loader" onDone={handleReady} />
        )}
      </AnimatePresence>
    </main>
  )
}
