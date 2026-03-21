import React, { useState } from 'react'
import { Icon } from '../Icons'
import { useDarkStore } from '../../store/useDarkStore'
import { useSettingsStore } from '../../store/useSettingsStore'

// Import form components
import SettingSection from '../shared/SettingSection'
import Toggle from '../shared/Toggle'
import RadioGroup from '../shared/RadioGroup'
import Select from '../shared/Select'
import Input from '../shared/Input'
import NumberInput from '../shared/NumberInput'
import Slider from '../shared/Slider'
import DualSlider from '../shared/DualSlider'
import ColorPicker from '../shared/ColorPicker'
import EmojiPicker from '../shared/EmojiPicker'

// Import tab components
import GeneralTab from './tabs/GeneralTab'
import AppearanceTab from './tabs/AppearanceTab'
import CalendarTab from './tabs/CalendarTab'
import NotificationsTab from './tabs/NotificationsTab'
import AITab from './tabs/AITab'
import WhatsAppTab from './tabs/WhatsAppTab'
import ProfileTab from './tabs/ProfileTab'
import AboutTab from './tabs/AboutTab'

const TABS = [
  { id: 'general', label: 'General', icon: '📋' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
]

/**
 * Settings modal with tabbed interface
 */
export default function SettingsModal({ isOpen, onClose }) {
  const { isDark } = useDarkStore()
  const { hasUnsavedChanges, saveChanges, discardChanges } = useSettingsStore()
  const [activeTab, setActiveTab] = useState('general')

  if (!isOpen) return null

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to save before closing?')) {
        handleSave()
      } else {
        discardChanges()
      }
    }
    onClose()
  }

  const handleSave = () => {
    const { valid, errors } = useSettingsStore.getState().validate()
    if (!valid) {
      alert('Please fix validation errors before saving:\n' + Object.values(errors).join('\n'))
      return
    }
    saveChanges()
    onClose()
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Discard unsaved changes?')) {
        discardChanges()
        onClose()
      }
    } else {
      onClose()
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />
      case 'appearance':
        return <AppearanceTab />
      case 'calendar':
        return <CalendarTab />
      case 'notifications':
        return <NotificationsTab />
      case 'ai':
        return <AITab />
      case 'whatsapp':
        return <WhatsAppTab />
      case 'profile':
        return <ProfileTab />
      case 'about':
        return <AboutTab />
      default:
        return null
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div
          className={`w-full max-w-[800px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col pointer-events-auto animate-modalIn ${
            isDark ? 'bg-[#1f1d30] border border-white/10' : 'bg-white border border-black/10'
          }`}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b flex items-center justify-between flex-shrink-0 ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            <h2 className={`text-[18px] font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Settings
            </h2>
            <button
              onClick={handleClose}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div
              className={`w-[180px] flex-shrink-0 border-r overflow-y-auto ${
                isDark ? 'bg-[#16141f] border-white/10' : 'bg-[#f9f9f9] border-gray-200'
              }`}
            >
              <nav className="p-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors mb-1 ${
                      activeTab === tab.id
                        ? isDark
                          ? 'bg-white/10 text-gray-100'
                          : 'bg-white text-gray-900 shadow-sm'
                        : isDark
                        ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderTabContent()}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`px-6 py-4 border-t flex items-center justify-between flex-shrink-0 ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            <div>
              {hasUnsavedChanges && (
                <p className={`text-[12px] ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  You have unsaved changes
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-accent text-white hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
