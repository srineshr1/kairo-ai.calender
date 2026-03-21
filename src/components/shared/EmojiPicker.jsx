import React from 'react'
import { useDarkStore } from '../../store/useDarkStore'

/**
 * Emoji picker component with preset grid
 */
export default function EmojiPicker({ label, description, value, onChange, presets = [] }) {
  const { isDark } = useDarkStore()

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

      {/* Current selection preview */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl ${
            isDark ? 'bg-white/5' : 'bg-gray-100'
          }`}
        >
          {value}
        </div>
        <div>
          <p className={`text-[13px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Current Avatar
          </p>
          <p className={`text-[11px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            Click an emoji to change
          </p>
        </div>
      </div>

      {/* Emoji grid */}
      {presets.length > 0 && (
        <div className="grid grid-cols-8 gap-2">
          {presets.map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange(emoji)}
              className={`w-10 h-10 rounded-lg text-2xl flex items-center justify-center transition-all ${
                value === emoji
                  ? 'bg-accent/20 ring-2 ring-accent'
                  : isDark
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-100'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
