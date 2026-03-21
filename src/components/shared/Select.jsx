import React from 'react'
import { useDarkStore } from '../../store/useDarkStore'
import { Icon } from '../Icons'

/**
 * Select dropdown component
 */
export default function Select({ label, description, options, value, onChange, disabled = false }) {
  const { isDark } = useDarkStore()

  return (
    <div>
      {label && (
        <label className={`text-[13px] font-medium block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      {description && (
        <p className={`text-[12px] mb-2 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 text-[13px] rounded-lg border appearance-none cursor-pointer transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            isDark
              ? 'bg-[#252340] border-white/10 text-gray-300 hover:border-accent/50'
              : 'bg-white border-gray-300 text-gray-700 hover:border-accent/50'
          } focus:outline-none focus:ring-2 focus:ring-accent/50`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <Icon name="chevronDown" className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
      </div>
    </div>
  )
}
