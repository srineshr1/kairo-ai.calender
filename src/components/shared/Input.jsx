import React from 'react'
import { useDarkStore } from '../../store/useDarkStore'

/**
 * Text input component with validation
 */
export default function Input({
  label,
  description,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  maxLength,
}) {
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full px-3 py-2 text-[13px] rounded-lg border transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          error
            ? 'border-red-500 focus:ring-red-500/50'
            : isDark
            ? 'bg-[#252340] border-white/10 text-gray-300 placeholder-gray-600 hover:border-accent/50'
            : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 hover:border-accent/50'
        } focus:outline-none focus:ring-2 focus:ring-accent/50`}
      />
      {error && (
        <p className="text-[11px] text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
