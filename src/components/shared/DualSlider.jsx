import React, { useState, useRef, useEffect } from 'react'
import { useDarkStore } from '../../store/useDarkStore'

/**
 * Dual slider component for range selection with two handles
 */
export default function DualSlider({
  label,
  description,
  valueStart,
  valueEnd,
  onChange,
  min = 0,
  max = 24,
  step = 1,
  formatValue,
}) {
  const { isDark } = useDarkStore()
  const [dragging, setDragging] = useState(null)
  const sliderRef = useRef(null)

  const percentageStart = ((valueStart - min) / (max - min)) * 100
  const percentageEnd = ((valueEnd - min) / (max - min)) * 100

  const handleMouseDown = (handle) => (e) => {
    e.preventDefault()
    setDragging(handle)
  }

  const handleMouseMove = (e) => {
    if (!dragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const newValue = Math.round((percentage / 100) * (max - min) + min)

    if (dragging === 'start') {
      if (newValue < valueEnd - step) {
        onChange(newValue, valueEnd)
      }
    } else if (dragging === 'end') {
      if (newValue > valueStart + step) {
        onChange(valueStart, newValue)
      }
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, valueStart, valueEnd])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        {label && (
          <label className={`text-[13px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {label}
          </label>
        )}
        <span className={`text-[12px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {formatValue ? `${formatValue(valueStart)} - ${formatValue(valueEnd)}` : `${valueStart} - ${valueEnd}`}
        </span>
      </div>
      {description && (
        <p className={`text-[12px] mb-3 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
          {description}
        </p>
      )}

      {/* Slider track */}
      <div ref={sliderRef} className="relative h-2 mt-6 mb-4">
        {/* Background track */}
        <div
          className={`absolute h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
          style={{ left: 0, right: 0 }}
        />
        
        {/* Active range */}
        <div
          className="absolute h-2 rounded-full bg-accent"
          style={{
            left: `${percentageStart}%`,
            right: `${100 - percentageEnd}%`,
          }}
        />

        {/* Start handle */}
        <button
          type="button"
          onMouseDown={handleMouseDown('start')}
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-accent shadow-lg cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          style={{ left: `${percentageStart}%`, transform: 'translate(-50%, -50%)' }}
        />

        {/* End handle */}
        <button
          type="button"
          onMouseDown={handleMouseDown('end')}
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-accent shadow-lg cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          style={{ left: `${percentageEnd}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  )
}
