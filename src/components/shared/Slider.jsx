import React from 'react'
import { useDarkStore } from '../../store/useDarkStore'

/**
 * Slider component for range selection
 */
export default function Slider({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  formatValue,
  disabled = false,
}) {
  const { isDark } = useDarkStore()

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        {label && (
          <label className={`text-[13px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {label}
          </label>
        )}
        {showValue && (
          <span className={`text-[12px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatValue ? formatValue(value) : value}
          </span>
        )}
      </div>
      {description && (
        <p className={`text-[12px] mb-3 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="slider-input w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percentage}%, ${
              isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            } ${percentage}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`,
          }}
        />
      </div>
      <style jsx>{`
        .slider-input::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2px solid var(--color-accent);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .slider-input::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2px solid var(--color-accent);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
