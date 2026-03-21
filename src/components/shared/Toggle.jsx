import React from 'react'
import { useDarkStore } from '../../store/useDarkStore'

/**
 * Toggle switch component (iOS-style)
 */
export default function Toggle({ label, description, checked, onChange, disabled = false }) {
  const { isDark } = useDarkStore()

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <label className={`text-[13px] font-medium block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
        {description && (
          <p className={`text-[12px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          checked
            ? 'bg-accent'
            : isDark
            ? 'bg-gray-700'
            : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
