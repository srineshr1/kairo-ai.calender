import React from 'react'
import { useDarkStore } from '../../store/useDarkStore'
import { Icon } from '../Icons'

/**
 * Number input component with increment/decrement buttons
 */
export default function NumberInput({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  disabled = false,
}) {
  const { isDark } = useDarkStore()

  const increment = () => {
    if (max !== undefined && value >= max) return
    onChange(value + step)
  }

  const decrement = () => {
    if (min !== undefined && value <= min) return
    onChange(value - step)
  }

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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || (min !== undefined && value <= min)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            disabled || (min !== undefined && value <= min)
              ? 'opacity-30 cursor-not-allowed'
              : isDark
              ? 'bg-white/10 hover:bg-white/20 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <Icon name="minus" className="w-3.5 h-3.5" />
        </button>
        <div
          className={`flex-1 px-3 py-2 text-[13px] text-center rounded-lg border ${
            isDark
              ? 'bg-[#252340] border-white/10 text-gray-300'
              : 'bg-white border-gray-300 text-gray-700'
          }`}
        >
          {value}
          {suffix && <span className={isDark ? 'text-gray-600' : 'text-gray-500'}> {suffix}</span>}
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={disabled || (max !== undefined && value >= max)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            disabled || (max !== undefined && value >= max)
              ? 'opacity-30 cursor-not-allowed'
              : isDark
              ? 'bg-white/10 hover:bg-white/20 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <Icon name="plus" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
