import React from 'react'
import { format } from 'date-fns'
import { useDarkStore } from '../../store/useDarkStore'

export default function DayPreviewPopup({ 
  date,           
  events,         
  position,       
  onClose,        
  onEventClick,   
  onViewDay       
}) {
  const { isDark } = useDarkStore()
  const dateLabel = format(date, 'EEEE, MMMM d')
  const hasEvents = events.length > 0

  return (
    <>
      {/* Backdrop to catch clicks outside */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose() }}
      />
      
      {/* Popup */}
      <div
        className={`fixed z-50 w-[300px] max-h-[400px] rounded-xl shadow-2xl overflow-hidden animate-slide-down ${
          isDark 
            ? 'bg-[#1f1d30] border border-white/10' 
            : 'bg-white border border-[#e5e2dc]'
        }`}
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 420),
        }}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-[#e5e2dc]'
        }`}>
          <div>
            <h3 className={`text-[14px] font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              {dateLabel}
            </h3>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
              isDark 
                ? 'hover:bg-white/10 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Event List */}
        <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
          {!hasEvents ? (
            <div className="px-4 py-8 text-center">
              <p className={`text-[13px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                No events
              </p>
              <button
                onClick={onViewDay}
                className={`mt-3 px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Add Event
              </button>
            </div>
          ) : (
            <div className="py-2">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    onEventClick(ev)
                    onClose()
                  }}
                  className={`w-full px-4 py-2.5 flex items-start gap-3 hover:bg-light-card dark:hover:bg-white/5 transition-colors text-left ${
                    ev.done ? 'opacity-60' : ''
                  }`}
                >
                  {/* Color indicator */}
                  <div 
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{
                      backgroundColor: 
                        ev.color === 'pink' ? '#ec4899' :
                        ev.color === 'green' ? '#10b981' :
                        ev.color === 'amber' ? '#f59e0b' :
                        ev.color === 'gray' ? '#6b7280' :
                        '#3b82f6'
                    }}
                  />
                  
                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-medium leading-tight ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    } ${ev.done ? 'line-through' : ''}`}>
                      {ev.title}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {ev.time}
                      {ev.sub && ` • ${ev.sub}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t ${
          isDark ? 'border-white/10' : 'border-[#e5e2dc]'
        }`}>
          <button
            onClick={onViewDay}
            className={`w-full px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-accent hover:opacity-90 text-white'
                : 'bg-[#9880cc] hover:opacity-90 text-white'
            }`}
          >
            View Day
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
