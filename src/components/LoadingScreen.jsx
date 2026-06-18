/**
 * LoadingScreen.jsx
 *
 * Light-coloured glassmorphism splash. Stays visible until every one of the
 * 121 character-animation frames has loaded (Promise.all), with a 1.5 s
 * minimum display time so it never just flashes.
 *
 * Visuals
 *   • Light gradient background (white → pale blue/lilac)
 *   • Large ambient colour blobs (blue / lilac / lime) matching homepage palette
 *   • Glass-sphere bubbles identical in style to the homepage floating orbs
 *   • Frosted-glass centre card — white glass, dark logo, pulsing dots
 *
 * Dismissal
 *   • Promise.all(all 121 frames) + 1.5 s min → calls onDone()
 *   • 8 s hard cap so a broken asset never hangs forever
 *   • Parent's <AnimatePresence> handles the 0.6 s exit fade
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'

const FRAME_COUNT  = 121
const FRAME_PREFIX = `${import.meta.env.BASE_URL}frames/frame_`
const FRAME_PAD    = 5

function framePath(i) {
  return `${FRAME_PREFIX}${String(i).padStart(FRAME_PAD, '0')}.png`
}

export default function LoadingScreen({ onDone }) {
  useEffect(() => {
    let done = false

    // Preload every animation frame
    const framePromises = Array.from({ length: FRAME_COUNT }, (_, i) =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload  = resolve
        img.onerror = resolve   // never block on a missing file
        img.src = framePath(i)
      })
    )

    // 1.5 s minimum so the screen feels intentional
    const minTime = new Promise((r) => setTimeout(r, 1500))

    // Hard cap — never hang longer than 8 s
    const hardCap = setTimeout(() => { if (!done) { done = true; onDone() } }, 8000)

    Promise.all([...framePromises, minTime]).then(() => {
      if (!done) { done = true; onDone() }
    })

    return () => { done = true; clearTimeout(hardCap) }
  }, [onDone])

  return (
    <motion.div
      className="ls-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
    >
      {/* ── Ambient colour blobs ─────────────────────────────────── */}
      <div className="ls-blob ls-blob--blue"   aria-hidden="true" />
      <div className="ls-blob ls-blob--lilac"  aria-hidden="true" />
      <div className="ls-blob ls-blob--lime"   aria-hidden="true" />

      {/* ── Floating glass-sphere bubbles (mirrors homepage style) ── */}
      <div className="ls-orb ls-orb--a" aria-hidden="true" />
      <div className="ls-orb ls-orb--b" aria-hidden="true" />
      <div className="ls-orb ls-orb--c" aria-hidden="true" />
      <div className="ls-orb ls-orb--d" aria-hidden="true" />
      <div className="ls-orb ls-orb--e" aria-hidden="true" />
      <div className="ls-orb ls-orb--f" aria-hidden="true" />

      {/* ── Frosted-glass centre card ─────────────────────────────── */}
      <div className="ls-card">
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="Studio KAIL"
          className="ls-logo"
          draggable="false"
        />

        <div className="ls-divider" aria-hidden="true" />

        <p className="ls-tagline">Creative Studio</p>

        {/* Pulsing dot trio — loading indicator */}
        <div className="ls-dots" aria-hidden="true">
          <span className="ls-dot ls-dot--1" />
          <span className="ls-dot ls-dot--2" />
          <span className="ls-dot ls-dot--3" />
        </div>
      </div>
    </motion.div>
  )
}
