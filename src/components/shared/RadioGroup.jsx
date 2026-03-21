import React from 'react'
import { useDarkStore } from '../../store/useDarkStore'

/**
 * Radio group component for single selection
 */
export default function RadioGroup({ label, description, options, value, onChange, layout = 'vertical' }) {
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
      <div className={`flex gap-3 ${layout === 'vertical' ? 'flex-col' : 'flex-wrap'}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-2 text-[13px] transition-colors ${
              value === option.value
                ? isDark
                  ? 'text-gray-200'
                  : 'text-gray-800'
                : isDark
                ? 'text-gray-500 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                value === option.value
                  ? 'border-accent bg-accent'
                  : isDark
                  ? 'border-gray-600'
                  : 'border-gray-300'
              }`}
            >
              {value === option.value && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
