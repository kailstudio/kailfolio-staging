import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSequence from './components/HeroSequence.jsx'
import PortfolioSection from './components/PortfolioSection.jsx'
import ProjectDetail from './components/ProjectDetail.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import Footer from './components/Footer.jsx'
import VideoSection from './components/VideoSection.jsx'
import ScrollExpandMedia from './components/ScrollExpandMedia.jsx'
import './styles.css'

// ── ScrollExpandMedia asset paths ─────────────────────────────────────
// Drop your files into /public/ and update these paths.
// bgImageSrc:  background image visible before scrolling
// mediaSrc:    the expanding video (or image if mediaType="image")
// posterSrc:   video poster frame (optional)
const BASE = import.meta.env.BASE_URL
const SEM_MEDIA = `${BASE}scroll-hero-video.mp4`
const SEM_POSTER= `${BASE}scroll-hero-poster.png`

export default function App() {
  const [siteReady,    setSiteReady]    = useState(false)
  const [loaderExited, setLoaderExited] = useState(false)
  const [detailCat,    setDetailCat]    = useState(null)

  const handleReady      = useCallback(() => setSiteReady(true),    [])
  const handleLoaderDone = useCallback(() => setLoaderExited(true), [])

  const ease = [0.16, 1, 0.3, 1]

  // ── Custom cursor ──────────────────────────────────────────────────
  const cursorRef = useRef(null)
  useEffect(() => {
    const el = cursorRef.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let cx = -60, cy = -60
    let rafId

    // Position via CSS `translate` (no transition — stays locked to cursor).
    // Scale via CSS `scale` property + class toggle — CSS handles the easing.
    const onMove = (e) => { cx = e.clientX; cy = e.clientY }

    const tick = () => {
      el.style.translate = `${cx - 15}px ${cy - 15}px`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const onOver = (e) => {
      if (e.target.closest('a, button, [role="button"], .pj-card, .pf-pill, .footer-social-btn'))
        el.classList.add('is-hover')
    }
    const onOut = (e) => {
      if (e.target.closest('a, button, [role="button"], .pj-card, .pf-pill, .footer-social-btn'))
        el.classList.remove('is-hover')
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout',  onOut)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout',  onOut)
    }
  }, [])

  return (
    <main className="app">
      {/* Custom cursor */}
      <div className="custom-cursor" ref={cursorRef} aria-hidden="true" />

      {/* Aurora gradient */}
      <div className="app-bg" aria-hidden="true" />

      {/* Fixed glass header */}
      <SiteHeader />

      {/* HeroSequence mounts only after loader fully exits */}
      {loaderExited && <HeroSequence />}

      {/* Scroll-expand intro section — add assets to /public/ before enabling */}
      {loaderExited && (
        <ScrollExpandMedia
          mediaType="video"
          mediaSrc={SEM_MEDIA}
          posterSrc={SEM_POSTER}
          date="2024"
          scrollToExpand="Scroll to expand"
          textBlend={false}
        />
      )}

      {/* Page content fades in once loader has exited */}
      <motion.div
        className="site-split"
        initial={{ opacity: 0, y: 14 }}
        animate={loaderExited ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.72, ease }}
      >
        <div className="split-left">
          <PortfolioSection onProjectOpen={setDetailCat} />
        </div>
        <div className="split-right" aria-hidden="true" />
      </motion.div>

      {/* Video showreel */}
      <VideoSection />

      {/* Footer */}
      <Footer />

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

      {/* Loading screen — onExitComplete triggers HeroSequence mount */}
      <AnimatePresence onExitComplete={handleLoaderDone}>
        {!siteReady && (
          <LoadingScreen key="loader" onDone={handleReady} />
        )}
      </AnimatePresence>
    </main>
  )
}
