import React, { useState } from 'react'
import { useDarkStore } from '../../store/useDarkStore'

/**
 * Color picker component with presets and custom input
 */
export default function ColorPicker({ label, description, value, onChange, presets = [] }) {
  const { isDark } = useDarkStore()
  const [customColor, setCustomColor] = useState(value)

  const handlePresetClick = (color) => {
    setCustomColor(color)
    onChange(color)
  }

  const handleCustomChange = (color) => {
    setCustomColor(color)
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(color)
    }
  }

  return (
    <div>
      {label && (
        <label className={`text-[13px] font-medium block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      {description && (
        <p className={`text-[12px] mb-3 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
      
      {/* Preset colors */}
      {presets.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetClick(color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                value === color ? 'ring-2 ring-offset-2 ring-accent' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      )}

      {/* Custom color input */}
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={customColor}
          onChange={(e) => handleCustomChange(e.target.value)}
          className="w-12 h-10 rounded-lg cursor-pointer border-0"
        />
        <input
          type="text"
          value={customColor}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="#000000"
          maxLength={7}
          className={`flex-1 px-3 py-2 text-[13px] rounded-lg border font-mono uppercase transition-colors ${
            isDark
              ? 'bg-[#252340] border-white/10 text-gray-300 placeholder-gray-600'
              : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
          } focus:outline-none focus:ring-2 focus:ring-accent/50`}
        />
      </div>
    </div>
  )
}
