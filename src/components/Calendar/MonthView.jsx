import React, { useState } from 'react'
import { format, addMonths, subMonths, isSameMonth, isToday as fnsIsToday } from 'date-fns'
import { useEventStore } from '../../store/useEventStore'
import { useDarkStore } from '../../store/useDarkStore'
import { getMonthDays, fmtDate } from '../../lib/dateUtils'
import { Icon } from '../Icons'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthView({ onEventClick, onSlotClick }) {
  const { events, searchQuery } = useEventStore()
  const { isDark } = useDarkStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [slideDir, setSlideDir] = useState(null)
  const [animKey, setAnimKey] = useState(0)

  const days = getMonthDays(currentMonth)

  const navigate = (dir) => {
    setSlideDir(dir)
    setAnimKey((k) => k + 1)
    if (dir === 'left') setCurrentMonth(d => subMonths(d, 1))
    else setCurrentMonth(d => addMonths(d, 1))
    setTimeout(() => setSlideDir(null), 350)
  }

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = fmtDate(date)
    return events.filter(ev => {
      // Filter by search query if present
      if (searchQuery && !ev.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Check direct date match
      if (ev.date === dateStr) return true
      
      // Check recurring events
      if (ev.recurrence !== 'none' && ev.date <= dateStr) {
        if (ev.recurrenceEnd && ev.recurrenceEnd < dateStr) return false
        
        // Simple recurrence check (this could be more sophisticated)
        const startDate = new Date(ev.date)
        const checkDate = new Date(dateStr)
        const diffDays = Math.floor((checkDate - startDate) / (1000 * 60 * 60 * 24))
        
        if (ev.recurrence === 'daily') return true
        if (ev.recurrence === 'weekly') return diffDays % 7 === 0
        if (ev.recurrence === 'monthly') {
          return startDate.getDate() === checkDate.getDate()
        }
      }
      
      return false
    })
  }

  const handleDayClick = (date) => {
    const dateEvents = getEventsForDate(date)
    if (dateEvents.length > 0) {
      // If there are events, open the first one for editing
      onEventClick(dateEvents[0])
    } else {
      // If no events, create new event
      onSlotClick(fmtDate(date), '09:00')
    }
  }

  const monthLabel = format(currentMonth, 'MMMM yyyy')

  const slideClass = slideDir === 'left'
    ? 'animate-slideFromLeft'
    : slideDir === 'right'
    ? 'animate-slideFromRight'
    : ''

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Month navigation */}
      <div className="px-7 py-3 flex items-center gap-3 border-b dark:border-white/10 flex-shrink-0" style={{ backgroundColor: isDark ? '#1f1d30' : '#faf9f7', borderBottomColor: isDark ? undefined : '#e5e2dc' }}>
        <button
          onClick={() => navigate('left')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-light-text-secondary hover:bg-light-card dark:hover:bg-white/10 dark:text-gray-400 hover:text-light-text transition-colors"
        >
          <Icon name="chevronLeft" className="w-4 h-4" />
        </button>
        <h2 className="font-display text-[22px] text-light-text dark:text-gray-100 tracking-tight min-w-[200px]">
          {monthLabel}
        </h2>
        <button
          onClick={() => navigate('right')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-light-text-secondary hover:bg-light-card dark:hover:bg-white/10 dark:text-gray-400 hover:text-light-text transition-colors"
        >
          <Icon name="chevronRight" className="w-4 h-4" />
        </button>

        <button
          onClick={() => setCurrentMonth(new Date())}
          className="ml-2 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-light-text-secondary dark:text-gray-300 hover:bg-light-card dark:hover:bg-white/10 transition-colors"
        >
          Today
        </button>

        <div className="flex-1" />
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex flex-col" key={animKey}>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {WEEKDAYS.map(day => (
              <div
                key={day}
                className="text-center text-[11px] font-semibold text-light-text-secondary dark:text-gray-400 uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className={`flex-1 grid grid-cols-7 gap-px rounded-lg overflow-hidden ${slideClass}`} style={{ backgroundColor: isDark ? undefined : '#e5e2dc' }}>
            {days.map((date, idx) => {
              const dateStr = fmtDate(date)
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isToday = fnsIsToday(date)
              const dayEvents = getEventsForDate(date)
              const hasEvents = dayEvents.length > 0

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(date)}
                  className={`
                    p-2 flex flex-col items-center justify-start
                    hover:bg-light-card dark:hover:bg-[#252340] transition-colors
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                    ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
                  `}
                >
                  {/* Day number */}
                  <div className={`
                    text-[13px] font-medium mb-1
                    ${isToday
                      ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center'
                      : isCurrentMonth
                        ? 'text-gray-800 dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-600'
                    }
                  `}>
                    {format(date, 'd')}
                  </div>

                  {/* Event dots */}
                  {hasEvents && (
                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                      {dayEvents.slice(0, 3).map((ev, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: ev.color === 'pink' ? '#ec4899'
                              : ev.color === 'green' ? '#10b981'
                              : ev.color === 'amber' ? '#f59e0b'
                              : ev.color === 'gray' ? '#6b7280'
                              : '#3b82f6',
                          }}
                          title={ev.title}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                          +{dayEvents.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Event count on hover */}
                  {hasEvents && (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Event list for selected month (optional) */}
      <div className="bg-white dark:bg-[#1f1d30] border-t border-black/[0.06] dark:border-white/10 px-6 py-4 max-h-48 overflow-y-auto">
        <h3 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Events this month ({events.filter(ev => {
            const evDate = new Date(ev.date)
            return isSameMonth(evDate, currentMonth)
          }).length})
        </h3>
        <div className="space-y-1">
          {events
            .filter(ev => {
              const evDate = new Date(ev.date)
              return isSameMonth(evDate, currentMonth)
            })
            .slice(0, 5)
            .map(ev => (
              <button
                key={ev.id}
                onClick={() => onEventClick(ev)}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: ev.color === 'pink' ? '#ec4899'
                      : ev.color === 'green' ? '#10b981'
                      : ev.color === 'amber' ? '#f59e0b'
                      : ev.color === 'gray' ? '#6b7280'
                      : '#3b82f6',
                  }}
                />
                <span className="text-[12px] text-gray-700 dark:text-gray-300 truncate">
                  {ev.title}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-auto">
                  {format(new Date(ev.date), 'MMM d')}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
