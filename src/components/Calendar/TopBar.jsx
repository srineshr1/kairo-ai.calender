import React from 'react'
import { Icon } from '../Icons'
import { useEventStore } from '../../store/useEventStore'
import { useDarkStore } from '../../store/useDarkStore'
import { useWhatsAppSettings } from '../../store/useWhatsAppSettings'
import { useWhatsAppBridgeStatus } from '../../hooks/useWhatsAppBridgeStatus'

const VIEWS = ['Day', 'Week', 'Month']

export default function TopBar({ activeView, setActiveView, onAddEvent, onWhatsAppSettings }) {
  const { searchQuery, setSearchQuery } = useEventStore()
  const { isDark, toggle } = useDarkStore()
  const { enabled } = useWhatsAppSettings()
  const { connected } = useWhatsAppBridgeStatus()

  return (
    <div className="bg-white dark:bg-[#1f1d30] border-b dark:border-white/10 px-6 h-14 flex items-center gap-4 flex-shrink-0" style={{ backgroundColor: isDark ? undefined : '#faf9f7', borderBottomColor: isDark ? undefined : '#e8e4de' }}>
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 border w-56" style={{ 
        backgroundColor: isDark ? '#252340' : '#eee9e2',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#ddd8d0'
      }}>
        <Icon name="search" className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search events…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-[13px] text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full font-sans"
        />
      </div>

      <div className="flex-1" />

      {/* View tabs — Day / Week / Month only */}
      <div className="flex gap-0.5 bg-[#f0eeed] dark:bg-[#252340] rounded-lg p-0.5">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`
              px-3.5 py-1.5 rounded-md text-[12.5px] font-medium transition-all duration-150
              ${activeView === v
                ? 'bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10'}
            `}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex gap-1">
        <button
          onClick={onWhatsAppSettings}
          className="relative w-8 h-8 rounded-lg hover:bg-[#f0eeed] dark:hover:bg-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center transition-colors"
          title={connected ? 'WhatsApp Connected' : enabled ? 'WhatsApp Disconnected' : 'WhatsApp Disabled'}
        >
          <svg className={`w-4 h-4 ${connected ? 'text-[#25D366]' : ''}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {enabled && (
            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${connected ? 'bg-[#25D366]' : 'bg-red-500'}`} />
          )}
        </button>
        <button
          onClick={() => toggle()}
          className="w-8 h-8 rounded-lg hover:bg-[#f0eeed] dark:hover:bg-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center transition-colors"
          title="Toggle dark mode"
        >
          <Icon name={isDark ? 'sun' : 'moon'} className="w-4 h-4" />
        </button>
        <button
          onClick={onAddEvent}
          className="w-8 h-8 rounded-lg hover:bg-[#f0eeed] dark:hover:bg-white/10 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center transition-colors"
          title="Add event"
        >
          <Icon name="plus" className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#f0eeed] dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center transition-colors" title="Profile">
          <Icon name="user" className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#f0eeed] dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center transition-colors" title="Notifications">
          <Icon name="bell" className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#f0eeed] dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center transition-colors" title="Settings">
          <Icon name="cog" className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
