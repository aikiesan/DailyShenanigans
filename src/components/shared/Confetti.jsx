import { useEffect } from 'react'

// Biome hex colors for particles
const COLORS = ['#f0b429', '#66bb6a', '#26a69a', '#d4a65c', '#42a5f5', '#9ccc65']

export default function Confetti({ onDone }) {
  useEffect(() => {
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;'

    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div')
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const left = Math.random() * 100
      const delay = Math.random() * 0.9
      const size = Math.random() * 9 + 6
      const duration = 1.2 + Math.random() * 0.9
      const isCircle = Math.random() > 0.5
      p.style.cssText = `
        position:absolute;
        left:${left}%;
        top:-20px;
        width:${size}px;
        height:${size}px;
        background:${color};
        border-radius:${isCircle ? '50%' : '2px'};
        animation:confetti-fall ${duration}s ${delay}s ease-in forwards;
      `
      container.appendChild(p)
    }

    document.body.appendChild(container)
    const timer = setTimeout(() => {
      if (document.body.contains(container)) document.body.removeChild(container)
      onDone?.()
    }, 2800)

    return () => {
      clearTimeout(timer)
      if (document.body.contains(container)) document.body.removeChild(container)
    }
  }, [])

  return null
}
