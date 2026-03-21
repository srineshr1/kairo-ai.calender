import React from 'react'
import SettingSection from '../../shared/SettingSection'
import { useSettingsStore } from '../../../store/useSettingsStore'
import { useDarkStore } from '../../../store/useDarkStore'

export default function AboutTab() {
  const { isDark } = useDarkStore()
  const { resetToDefaults } = useSettingsStore()

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetToDefaults()
      alert('Settings have been reset to defaults')
    }
  }

  const handleResetData = () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL your events, notifications, and chat history. This cannot be undone!\n\nType "DELETE" in the next prompt to confirm.')) {
      const confirmation = prompt('Type DELETE to confirm data reset:')
      if (confirmation === 'DELETE') {
        // Clear all localStorage data except settings
        const settingsBackup = localStorage.getItem('user-settings')
        localStorage.clear()
        if (settingsBackup) {
          localStorage.setItem('user-settings', settingsBackup)
        }
        alert('All data has been deleted. The page will now reload.')
        window.location.reload()
      } else {
        alert('Data reset cancelled.')
      }
    }
  }

  return (
    <div>
      <SettingSection title="Application Info">
        <div className="space-y-3">
          <div>
            <p className={`text-[13px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Version
            </p>
            <p className={`text-[12px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
              1.0.0
            </p>
          </div>

          <div>
            <p className={`text-[13px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Built with
            </p>
            <p className={`text-[12px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
              React, Zustand, Tailwind CSS, Vite
            </p>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Resources">
        <div className="space-y-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-[13px] transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-accent'
                : 'text-gray-600 hover:text-accent'
            }`}
          >
            📖 View Documentation →
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-[13px] transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-accent'
                : 'text-gray-600 hover:text-accent'
            }`}
          >
            🐛 Report a Bug →
          </a>
        </div>
      </SettingSection>

      <SettingSection title="Danger Zone">
        <div className="space-y-3">
          <div>
            <button
              onClick={handleResetSettings}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Reset Settings to Defaults
            </button>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
              Restore all settings to their default values (keeps data)
            </p>
          </div>

          <div>
            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Reset All Data
            </button>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
              ⚠️ Delete all events, notifications, and chat history (cannot be undone)
            </p>
          </div>
        </div>
      </SettingSection>
    </div>
  )
}
