import React from 'react'
import { Icon } from '../Icons'
import { useEventStore } from '../../store/useEventStore'

const VIEWS = ['Day', 'Week', 'Month']

export default function TopBar({ activeView, setActiveView, onAddEvent }) {
  const { searchQuery, setSearchQuery } = useEventStore()

  return (
    <div className="bg-white border-b border-black/[0.08] px-7 h-14 flex items-center gap-4 flex-shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-main rounded-lg px-3 py-1.5 border border-black/[0.06] w-48">
        <Icon name="search" className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search events…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-[13px] text-gray-700 placeholder-gray-400 w-full font-sans"
        />
      </div>

      {/* View tabs — Day / Week / Month only */}
      <div className="flex gap-0.5 bg-[#f0eeed] rounded-lg p-0.5">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`
              px-3.5 py-1.5 rounded-md text-[12.5px] font-medium transition-all duration-150
              ${activeView === v
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}
            `}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex gap-1">
        <button
          onClick={onAddEvent}
          className="w-8 h-8 rounded-lg hover:bg-[#f0eeed] text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors"
          title="Add event"
        >
          <Icon name="plus" className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#f0eeed] text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors" title="Profile">
          <Icon name="user" className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#f0eeed] text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors" title="Notifications">
          <Icon name="bell" className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#f0eeed] text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors" title="Settings">
          <Icon name="cog" className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
