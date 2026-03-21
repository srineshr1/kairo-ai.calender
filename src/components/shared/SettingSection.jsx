import React from 'react'
import { useDarkStore } from '../../store/useDarkStore'

/**
 * Section container for grouping related settings
 */
export default function SettingSection({ title, description, children }) {
  const { isDark } = useDarkStore()

  return (
    <div className="mb-6">
      {title && (
        <div className="mb-4">
          <h3 className={`text-[14px] font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            {title}
          </h3>
          {description && (
            <p className={`text-[12px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}
