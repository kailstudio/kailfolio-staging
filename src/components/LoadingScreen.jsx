/**
 * LoadingScreen.jsx
 *
 * Stays visible until all 121 optimised character-animation frames have
 * loaded, with a 1.5 s minimum display time so it never just flashes.
 *
 * Dismissal
 *   Promise.all(121 frames) + 1.5 s min → calls onDone()
 *   30 s hard cap so a slow connection eventually proceeds
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
    const finish = () => { if (!done) { done = true; onDone() } }

    const framePromises = Array.from({ length: FRAME_COUNT }, (_, i) =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload  = resolve
        img.onerror = resolve
        img.src = framePath(i)
      })
    )

    const minTime = new Promise((r) => setTimeout(r, 1500))
    const hardCap = setTimeout(finish, 30000)

    Promise.all([...framePromises, minTime]).then(finish)

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

      {/* ── Floating glass-sphere bubbles ────────────────────────── */}
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
        <div className="ls-dots" aria-hidden="true">
          <span className="ls-dot ls-dot--1" />
          <span className="ls-dot ls-dot--2" />
          <span className="ls-dot ls-dot--3" />
        </div>
      </div>
    </motion.div>
  )
}
