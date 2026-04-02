import React from 'react'

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner with configurable size and styling.
 * Supports dark mode and accessible loading states.
 * 
 * @param {Object} props
 * @param {string} props.size - Size of spinner: 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Accessible label for screen readers (default: 'Loading...')
 */
export default function LoadingSpinner({ size = 'md', className = '', label = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-label={label}>
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-300 dark:border-gray-600
          border-t-accent
          rounded-full
          animate-spin
        `}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

/**
 * LoadingOverlay Component
 * 
 * A full-screen loading overlay with spinner.
 * Useful for blocking interactions during async operations.
 * 
 * @param {Object} props
 * @param {string} props.message - Optional message to display below spinner
 */
export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 glass-backdrop z-50 flex items-center justify-center">
      <div className="glass-panel glass-modal rounded-2xl p-8 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm theme-text-secondary font-medium">{message}</p>
      </div>
    </div>
  )
}

/**
 * LoadingSkeleton Component
 * 
 * A skeleton loader for content that's being loaded.
 * Displays placeholder rectangles with shimmer animation.
 * 
 * @param {Object} props
 * @param {number} props.rows - Number of skeleton rows to display (default: 3)
 * @param {string} props.className - Additional CSS classes
 */
export function LoadingSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  )
}
