"use client"

import { useRef, useEffect } from "react"

interface AudioVisualizerProps {
  isPaused?: boolean
}

export default function AudioVisualizer({ isPaused = false }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  // Simple wave animation
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    // Function to render a simple wave animation
    const renderWave = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Set up wave parameters
      const centerY = canvas.offsetHeight / 2
      const amplitude = isPaused ? 5 : 15
      const frequency = 0.02
      const speed = Date.now() / 2000

      // Draw the wave
      ctx.beginPath()
      ctx.moveTo(0, centerY)

      for (let x = 0; x < canvas.offsetWidth; x++) {
        // Create a smooth sine wave
        const y = centerY + Math.sin(x * frequency + speed) * amplitude
        ctx.lineTo(x, y)
      }

      // Style and stroke the path
      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.stroke()

      // Continue animation
      if (!isPaused) {
        animationRef.current = requestAnimationFrame(renderWave)
      } else {
        // Draw one static frame when paused
        animationRef.current = requestAnimationFrame(renderWave)
      }
    }

    // Start the animation
    renderWave()

    // Clean up on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
