/**
 * PDFFlipbook.jsx — Real PDF viewer with page-flip UI
 *
 * Uses PDF.js loaded from CDN (no npm install required).
 * Props:
 *   pdfUrl       — path to PDF, e.g. `${import.meta.env.BASE_URL}guidelines/pgm-guidelines.pdf`
 *   title        — label shown in the header
 *   accentColor  — hex used for active dots / buttons
 *   totalHint    — optional expected page count (shows while loading)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174'

// Load PDF.js once and cache the promise
let pdfJsPromise = null
function getPdfJs() {
  if (pdfJsPromise) return pdfJsPromise
  pdfJsPromise = new Promise((resolve, reject) => {
    if (window['pdfjs-dist/build/pdf']) {
      const lib = window['pdfjs-dist/build/pdf']
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`
      return resolve(lib)
    }
    const script = document.createElement('script')
    script.src = `${PDFJS_CDN}/pdf.min.js`
    script.onload = () => {
      const lib = window['pdfjs-dist/build/pdf']
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`
      resolve(lib)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
  return pdfJsPromise
}

export function PDFFlipbook({ pdfUrl, title = 'Brand Guidelines', accentColor = '#2C365E', totalHint }) {
  const [pdf,         setPdf]         = useState(null)
  const [pageNum,     setPageNum]     = useState(1)
  const [totalPages,  setTotalPages]  = useState(totalHint ?? 0)
  const [status,      setStatus]      = useState('loading') // loading | ready | error | rendering
  const [dir,         setDir]         = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const canvasRef    = useRef(null)
  const renderTask   = useRef(null)
  const containerRef = useRef(null)

  // Load PDF.js + open document
  useEffect(() => {
    setStatus('loading')
    getPdfJs()
      .then((lib) => lib.getDocument(pdfUrl).promise)
      .then((doc) => {
        setPdf(doc)
        setTotalPages(doc.numPages)
        setPageNum(1)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [pdfUrl])

  // Render a page onto the canvas
  const renderPage = useCallback(async (num, pdfDoc) => {
    if (!pdfDoc || !canvasRef.current) return
    setStatus('rendering')
    if (renderTask.current) {
      try { renderTask.current.cancel() } catch (_) {}
    }
    try {
      const page    = await pdfDoc.getPage(num)
      const canvas  = canvasRef.current
      const ctx     = canvas.getContext('2d')

      // Scale to fill the viewer width (600px max), capped at 2×
      const container = containerRef.current
      const maxW      = container ? container.clientWidth - 2 : 600
      const baseVP    = page.getViewport({ scale: 1 })
      const scale     = Math.min(2, maxW / baseVP.width)
      const vp        = page.getViewport({ scale })

      canvas.width  = vp.width
      canvas.height = vp.height
      renderTask.current = page.render({ canvasContext: ctx, viewport: vp })
      await renderTask.current.promise
      setStatus('ready')
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (pdf) renderPage(pageNum, pdf)
  }, [pageNum, pdf, renderPage])

  const go = useCallback((d) => {
    setPageNum((p) => {
      const next = p + d
      if (next < 1 || next > totalPages) return p
      setDir(d)
      return next
    })
  }, [totalPages])

  // Keyboard navigation (only when viewer is in view)
  useEffect(() => {
    const onKey = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const inView = rect.top < window.innerHeight && rect.bottom > 0
      if (!inView) return
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'Escape' && isFullscreen) exitFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, isFullscreen])

  // Fullscreen API
  const enterFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen
    if (req) req.call(el).catch(() => {})
  }, [])

  const exitFullscreen = useCallback(() => {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen
    if (exit) exit.call(document).catch(() => {})
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) exitFullscreen()
    else enterFullscreen()
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  useEffect(() => {
    const onChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement
      setIsFullscreen(!!fsEl && fsEl === containerRef.current)
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  // Thumbnail dots — clamped to max 17 dots
  const DOT_MAX   = 17
  const dotCount  = Math.min(totalPages, DOT_MAX)
  const dotPages  = Array.from({ length: dotCount }, (_, i) =>
    totalPages <= DOT_MAX ? i + 1 : Math.round(1 + (i / (DOT_MAX - 1)) * (totalPages - 1))
  )

  const isLoading  = status === 'loading'
  const isError    = status === 'error'
  const isRendering = status === 'rendering'

  return (
    <div className={`pdff${isFullscreen ? ' pdff--fullscreen' : ''}`} ref={containerRef}>
      {/* Header */}
      <div className="pdff-header">
        {title && <span className="pdff-title">{title}</span>}
        <div className="pdff-header-right">
          <span className="pdff-count" style={{ color: accentColor }}>
            {isLoading ? '…' : `${pageNum} / ${totalPages}`}
          </span>
          <button
            className="pdff-fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
          >
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 0v1.5H2.56L6 4.94 4.94 6 1.5 2.56V5.5H0V0h5.5zM10.5 0H16v5.5h-1.5V2.56L11.06 6 10 4.94l3.44-3.44H10.5V0zM6 11.06l-3.44 3.44H5.5V16H0v-5.5h1.5v2.94L4.94 10 6 11.06zM10 11.06l1.06-1.06 3.44 3.44V10.5H16V16h-5.5v-1.5h2.94L10 11.06z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1h4V0H0v5.5h1.5V1zM14.5 1v4.5H16V0h-5.5v1.5h4zM14.5 15h-4v1.5H16V11h-1.5v4zM1.5 11H0v5h5.5v-1.5h-4V11z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="pdff-viewer">
        {isLoading && (
          <div className="pdff-state">
            <div className="pdff-spinner" style={{ borderTopColor: accentColor }} />
            <p>Loading guidelines…</p>
          </div>
        )}

        {isError && (
          <div className="pdff-state pdff-state--error">
            <span>⚠</span>
            <p>Couldn't load the PDF.<br />Check the file is in <code>public/guidelines/</code></p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="pdff-canvas-wrap">
            {isRendering && <div className="pdff-rendering" style={{ borderTopColor: accentColor }} />}
            <canvas ref={canvasRef} className="pdff-canvas" />
          </div>
        )}

        {/* Nav arrows */}
        <button
          className="pdff-arrow pdff-arrow--prev"
          onClick={() => go(-1)}
          disabled={pageNum <= 1}
          aria-label="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10 12 6 8 10 4" />
          </svg>
        </button>
        <button
          className="pdff-arrow pdff-arrow--next"
          onClick={() => go(1)}
          disabled={pageNum >= totalPages}
          aria-label="Next page"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 4 10 8 6 12" />
          </svg>
        </button>
      </div>

      {/* Footer — dot strip */}
      <div className="pdff-footer">
        <button className="pdff-nav-btn" onClick={() => go(-1)} disabled={pageNum <= 1}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="10 12 6 8 10 4" /></svg>
          Prev
        </button>
        <div className="pdff-dots" role="tablist">
          {dotPages.map((p, i) => {
            const active = Math.abs(p - pageNum) <= (totalPages <= DOT_MAX ? 0 : Math.floor(totalPages / DOT_MAX / 2))
            return (
              <button
                key={i}
                role="tab"
                aria-selected={active}
                aria-label={`Page ${p}`}
                className={`pdff-dot${p === pageNum ? ' pdff-dot--active' : ''}`}
                style={p === pageNum ? { background: accentColor } : {}}
                onClick={() => { setDir(p > pageNum ? 1 : -1); setPageNum(p) }}
              />
            )
          })}
        </div>
        <button className="pdff-nav-btn" onClick={() => go(1)} disabled={pageNum >= totalPages}>
          Next
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 4 10 8 6 12" /></svg>
        </button>
      </div>
    </div>
  )
}
