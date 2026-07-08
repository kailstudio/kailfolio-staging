/**
 * PTypesBanner.jsx — decorative animated ribbon behind the PortfolioTypes
 * card deck, filling in what was previously just plain background there.
 * A single, subtle, near-straight lime ribbon (KAIL lime, #e0f87d — see
 * styles.css) with "FROM SPARK TO SCREEN TO SHELF" running along its
 * centreline in off-black (#333333), continuously scrolling. Moving the
 * cursor across it gives it a faint, eased nudge away from the pointer,
 * springing back once it settles.
 *
 * PTypesRibbon (below) is written to support a second, independently
 * tilted/reversed instance — this component briefly rendered two at once,
 * one above the other, before that was dropped back down to just this
 * one. `reverse`/`slotClassName`/`pathId` are still there so a second
 * ribbon is a one-line addition again if it's ever wanted back, rather
 * than re-deriving all of this.
 *
 * Geometry: a single SVG <path> sampled from a sine wave — a plain array
 * of {x, baseY} points spaced closely enough (POINT_SPACING) to read as a
 * smooth curve from straight line segments — stroked thick to form the
 * ribbon shape, with a <textPath> tracing the exact same path on top for
 * the lettering. Amplitude is deliberately tiny relative to PERIOD now
 * (barely more than a straight line with a gentle drift) — a much more
 * pronounced "coiled ribbon" curve was tried first and dialed back.
 * Width is measured off the real rendered track (ResizeObserver, same
 * "measure the actual space, don't guess a fixed px constant" pattern
 * Hero.jsx uses for its chip sizing) so the pattern always comfortably
 * spans whatever viewport it's in.
 *
 * Continuous scroll is a pure CSS transform loop (translateX by exactly
 * one wave PERIOD, linear, infinite) — cheap and compositor-only. Because
 * the underlying sine pattern repeats every PERIOD px, shifting by exactly
 * that distance wraps seamlessly with only ONE copy of the geometry
 * rendered, no duplicated content needed.
 *
 * The cursor "push": deliberately NOT recomputed every animation frame at
 * rest — re-laying out <textPath> text along a changed path is expensive,
 * and doing that unconditionally at 60fps for a background decoration
 * would be wasteful. Instead a requestAnimationFrame loop only runs while
 * there's an active push target and/or the ribbon hasn't yet eased back to
 * its resting shape (SETTLE_EPSILON), and stops itself once it has. Each
 * point eases toward a target displacement — stronger the closer a point
 * is to the cursor's x position (quadratic falloff within PUSH_RADIUS),
 * signed by whether the cursor is above or below the ribbon's own resting
 * centreline — so the whole ribbon reads as being nudged aside by the
 * pointer as it crosses, rather than distorting arbitrarily. The
 * displacement amount itself has been dialed back twice now to stay a
 * faint give rather than a visible bulge.
 *
 * One more hover touch, plain CSS (no extra JS cost): the ribbon scales
 * up slightly while the pointer is anywhere over the band
 * (.ptypes-banner-track:hover).
 */

import { useRef, useEffect, useCallback } from 'react'

const LABEL     = 'From spark to screen to shelf'
// 10 repeats comfortably covers even a very wide ultra-wide-monitor path
// (~390 chars at ~20px/char average ≳ a ~7800px path — well past any
// realistic totalWidth) without being excessive. Long <textPath> strings
// aren't free to re-lay-out — see the perf note above about why the push
// interaction is rAF-gated rather than continuous — so this stays no
// longer than it actually needs to be.
const REPEATED  = `${LABEL}   •   `.repeat(10)

const PERIOD         = 820  // px — one full wave cycle; also the exact marquee shift distance, so the loop wraps seamlessly. Wide relative to the now-tiny amplitude, so it reads as one long, graceful, almost-straight drift rather than a rippled texture.
const POINT_SPACING  = 16   // px between sampled points
const PUSH_RADIUS    = 280  // px either side of the cursor that feels the push
const SETTLE_RATE    = 0.09 // per-frame easing toward the current target displacement — lower = slower/smoother
const SETTLE_EPSILON = 0.05 // once every point's displacement is under this AND there's no active cursor target, the rAF loop stops itself

function buildPoints(totalWidth, centerY, amplitude) {
  // Range runs from -PERIOD to (totalWidth - PERIOD) so the pattern always
  // extends a full period past both edges of the visible track — comfortable
  // margin for the marquee's own -PERIOD shift plus any push displacement,
  // with nothing ever visibly running out mid-scroll.
  const points = []
  for (let x = -PERIOD; x <= totalWidth - PERIOD; x += POINT_SPACING) {
    points.push({ x, baseY: centerY + Math.sin((x / PERIOD) * Math.PI * 2) * amplitude, push: 0 })
  }
  return points
}

function pathFromPoints(points) {
  let d = ''
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    d += `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${(p.baseY + p.push).toFixed(1)} `
  }
  return d
}

// One ribbon — the original single-band component, now parameterised so
// two independent instances (see the default export below) can each own
// their own geometry/hover state while sharing all the same math.
function PTypesRibbon({ reverse, slotClassName, pathId }) {
  const trackRef  = useRef(null)
  const svgRef    = useRef(null)
  const pathRef   = useRef(null)
  const pointsRef = useRef([])
  const targetXRef = useRef(null) // cursor x in track-local px, or null when not hovering
  const dirRef     = useRef(1)    // +1/-1 — which way the ribbon is pushed, set from cursor y vs the ribbon's own centreline
  const rafRef     = useRef(null)
  // How far a push travels at the cursor's own x — proportional to the
  // measured band height (set in rebuild below) rather than a fixed px
  // constant.
  const pushAmountRef = useRef(80)

  // Re-measure and rebuild the point grid whenever the track's own
  // rendered box changes size — real measured space, not a guessed fixed
  // width/height, so this always comfortably fills whatever it's given.
  useEffect(() => {
    const track = trackRef.current
    const svg   = svgRef.current
    const path  = pathRef.current
    if (!track || !svg || !path) return

    const rebuild = () => {
      const rect   = track.getBoundingClientRect()
      const width  = rect.width || window.innerWidth
      const height = rect.height || 160
      const totalWidth = width + PERIOD * 2
      const centerY   = height / 2
      // Very subtle now — barely more than a straight line with a gentle
      // drift, not the pronounced "coiled ribbon" curve this used to be.
      const amplitude = height * 0.05

      svg.setAttribute('viewBox', `${-PERIOD} 0 ${totalWidth} ${height}`)
      svg.setAttribute('width', totalWidth)
      svg.setAttribute('height', height)
      path.setAttribute('stroke-width', height * 0.4)
      track.style.setProperty('--ptypes-banner-font', `${height * 0.16}px`)
      // Dialed back again — the cursor nudge should read as a faint,
      // eased give rather than a visible bulge in the line.
      pushAmountRef.current = height * 0.08

      let points = buildPoints(totalWidth, centerY, amplitude)
      // Same geometry, walked in the opposite order — see the doc comment
      // above for why that's enough to flip the reading direction without
      // mirroring any glyphs.
      if (reverse) points = points.slice().reverse()

      pointsRef.current = points
      path.setAttribute('d', pathFromPoints(points))
    }
    rebuild()

    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(rebuild)
    ro.observe(track)
    return () => ro.disconnect()
  }, [reverse])

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
  }, [])

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return
    const tick = () => {
      const points = pointsRef.current
      const targetX = targetXRef.current
      const dir = dirRef.current
      const pushAmount = pushAmountRef.current
      let maxAbsPush = 0

      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        let target = 0
        if (targetX != null) {
          const dist = Math.abs(p.x - targetX)
          if (dist < PUSH_RADIUS) {
            const falloff = 1 - dist / PUSH_RADIUS
            target = falloff * falloff * pushAmount * dir
          }
        }
        p.push += (target - p.push) * SETTLE_RATE
        const abs = Math.abs(p.push)
        if (abs > maxAbsPush) maxAbsPush = abs
      }

      if (pathRef.current) pathRef.current.setAttribute('d', pathFromPoints(points))

      if (targetX != null || maxAbsPush > SETTLE_EPSILON) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null // fully settled — stop until the next interaction
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const handleMouseMove = useCallback((e) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    targetXRef.current = e.clientX - rect.left
    dirRef.current = (e.clientY - rect.top) < rect.height / 2 ? 1 : -1
    startLoop()
  }, [startLoop])

  const handleMouseLeave = useCallback(() => {
    targetXRef.current = null
    startLoop()
  }, [startLoop])

  return (
    <div className={`ptypes-banner-ribbon-slot ${slotClassName}`}>
      <div
        className={`ptypes-banner-track${reverse ? ' ptypes-banner-track--reverse' : ''}`}
        ref={trackRef}
        style={{ '--ptypes-period': `${PERIOD}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg ref={svgRef} className="ptypes-banner-svg" preserveAspectRatio="none">
          <path ref={pathRef} id={pathId} className="ptypes-banner-ribbon" fill="none" strokeLinecap="round" />
          <text className="ptypes-banner-text" dominantBaseline="central">
            <textPath href={`#${pathId}`} startOffset="0">{REPEATED}</textPath>
          </text>
        </svg>
      </div>
    </div>
  )
}

export default function PTypesBanner() {
  return (
    <div className="ptypes-banner" aria-hidden="true">
      <PTypesRibbon reverse={false} slotClassName="ptypes-banner-ribbon-slot--one" pathId="ptypesWavePathA" />
    </div>
  )
}
