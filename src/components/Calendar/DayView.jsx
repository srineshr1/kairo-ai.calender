import React, { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import { format, addDays, subDays } from 'date-fns'
import { useEventStore } from '../../store/useEventStore'
import { useDarkStore } from '../../store/useDarkStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import {
  fmtDate, isToday, expandRecurring,
  timeToMinutes, minutesToTime, snapTo15,
} from '../../lib/dateUtils'
import { PX_PER_HOUR, TOTAL_HOURS, SNAP_INTERVAL_MINUTES } from '../../lib/constants'
import DayColumn from './DayColumn'
import { Icon } from '../Icons'

const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => i)

export default function DayView({ onEventClick, onSlotClick, initialDate }) {
  const {
    events, searchQuery, reschedule,
    awakeStart, awakeEnd, setAwakeStart, setAwakeEnd,
  } = useEventStore()
  const { isDark } = useDarkStore()
  const { showPastEvents } = useSettingsStore()

  const [currentDay, setCurrentDay] = useState(initialDate || new Date())
  const [draggingEv, setDraggingEv] = useState(null)
  const [slideDir, setSlideDir] = useState(null)
  const [animKey, setAnimKey] = useState(0)
  const [showSleepSettings, setShowSleepSettings] = useState(false)

  const expandedEvents = expandRecurring(events, [currentDay])
  
  // Check if event is in the past and should be dimmed
  const isEventPast = (ev) => {
    const now = new Date()
    const eventDateTime = new Date(`${ev.date}T${ev.time}`)
    return eventDateTime < now
  }

  // Apply dimming to past events based on showPastEvents setting
  const getEventOpacity = (ev) => {
    if (ev.done) return 0.5  // Completed events are always dimmed
    if (!showPastEvents && isEventPast(ev)) return 0.4  // Past events dimmed if setting is off
    return 1
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const navigate = (dir) => {
    setSlideDir(dir)
    setAnimKey((k) => k + 1)
    if (dir === 'left') setCurrentDay(d => subDays(d, 1))
    else setCurrentDay(d => addDays(d, 1))
    setTimeout(() => setSlideDir(null), 350)
  }

  const handleDragStart = ({ active }) => {
    setDraggingEv(active.data.current?.event || null)
  }

  const handleDragEnd = ({ active, delta }) => {
    setDraggingEv(null)
    const ev = events.find((e) => e.id === active.id) ||
      events.find((e) => active.id.startsWith(e.id))
    if (!ev) return
    const deltaMins = snapTo15(Math.round((delta.y / PX_PER_HOUR) * 60))
    const currentMins = timeToMinutes(ev.time)
    const newMins = Math.max(0, Math.min(23 * 60, currentMins + deltaMins))
    const newTime = minutesToTime(newMins)
    reschedule(ev._sourceId || ev.id, fmtDate(currentDay), newTime)
  }

  const dayLabel = isToday(currentDay) 
    ? `Today, ${format(currentDay, 'MMMM d, yyyy')}`
    : format(currentDay, 'EEEE, MMMM d, yyyy')

  const slideClass = slideDir === 'left'
    ? 'animate-slideFromLeft'
    : slideDir === 'right'
    ? 'animate-slideFromRight'
    : ''

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Date navigation */}
      <div className="px-7 py-3 flex items-center gap-3 border-b dark:border-white/10 flex-shrink-0" style={{ backgroundColor: isDark ? '#1f1d30' : '#faf9f7', borderBottomColor: isDark ? undefined : '#e5e2dc' }}>
        <button
          onClick={() => navigate('left')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-light-text-secondary hover:bg-light-card dark:hover:bg-white/10 dark:text-gray-400 hover:text-light-text transition-colors"
        >
          <Icon name="chevronLeft" className="w-4 h-4" />
        </button>
        <h2 className="font-display text-[22px] text-light-text dark:text-gray-100 tracking-tight min-w-[300px]">
          {dayLabel}
        </h2>
        <button
          onClick={() => navigate('right')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-light-text-secondary hover:bg-light-card dark:hover:bg-white/10 dark:text-gray-400 hover:text-light-text transition-colors"
        >
          <Icon name="chevronRight" className="w-4 h-4" />
        </button>

        <button
          onClick={() => setCurrentDay(new Date())}
          className="ml-2 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-light-text-secondary dark:text-gray-300 hover:bg-light-card dark:hover:bg-white/10 transition-colors"
        >
          Today
        </button>

        <div className="flex-1" />

        {/* Sleep zone settings toggle */}
        <button
          onClick={() => setShowSleepSettings(!showSleepSettings)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-light-text-secondary hover:bg-light-card dark:hover:bg-white/10 dark:text-gray-400 hover:text-light-text transition-colors"
          title="Sleep hours"
        >
          <Icon name="clock" className="w-4 h-4" />
        </button>
      </div>

      {/* Sleep settings panel */}
      {showSleepSettings && (
        <div className="border-b dark:border-white/10 px-7 py-3 flex items-center gap-4" style={{ backgroundColor: '#faf9f7', borderBottomColor: isDark ? undefined : '#e5e2dc' }}>
          <span className="text-[13px] text-light-text dark:text-gray-300 font-medium">Awake hours:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="23"
              value={awakeStart}
              onChange={(e) => setAwakeStart(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded border dark:border-white/20 text-[13px] text-light-text dark:text-gray-200"
              style={{ borderColor: '#e5e2dc', backgroundColor: '#faf9f7' }}
            />
            <span className="text-light-text-secondary dark:text-gray-400 text-[13px]">to</span>
            <input
              type="number"
              min="0"
              max="23"
              value={awakeEnd}
              onChange={(e) => setAwakeEnd(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded border dark:border-white/20 text-[13px] text-light-text dark:text-gray-200"
              style={{ borderColor: '#e5e2dc', backgroundColor: '#faf9f7' }}
            />
          </div>
          <button
            onClick={() => setShowSleepSettings(false)}
            className="ml-4 text-[12px] text-light-text-secondary dark:text-gray-400 hover:text-light-text dark:hover:text-gray-200"
          >
            Done
          </button>
        </div>
      )}

      {/* Day timeline */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="relative flex h-full">
            {/* Hour labels */}
            <div className="sticky left-0 z-20 w-16 flex-shrink-0 border-r dark:border-white/10" style={{ backgroundColor: isDark ? '#1a1a2e' : '#f0ede8', borderRightColor: isDark ? undefined : '#e5e2dc' }}>
              {HOURS.map((h) => {
                const isSleep = h < awakeStart || h >= awakeEnd
                return (
                  <div
                    key={h}
                    className={`text-[11px] text-right pr-2 font-medium transition-colors ${
                      isSleep
                        ? 'text-light-text-secondary/40 dark:text-gray-700'
                        : 'text-light-text-secondary/70 dark:text-gray-500'
                    }`}
                    style={{ height: `${PX_PER_HOUR}px` }}
                  >
                    {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
                  </div>
                )
              })}
            </div>

            {/* Single day column - centered and wider */}
            <div className="flex-1 flex justify-center" key={animKey}>
              <div className={`w-full max-w-4xl ${slideClass}`}>
                <DayColumn
                  date={currentDay}
                  events={expandedEvents}
                  awakeStart={awakeStart}
                  awakeEnd={awakeEnd}
                  onEventClick={onEventClick}
                  onSlotClick={onSlotClick}
                  getEventOpacity={getEventOpacity}
                />
              </div>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {draggingEv && (
            <div
              className="px-2.5 py-1.5 rounded-md shadow-xl opacity-90 cursor-grabbing text-white text-[12.5px] font-medium"
              style={{
                backgroundColor: draggingEv.color === 'pink' ? '#ec4899'
                  : draggingEv.color === 'green' ? '#10b981'
                  : draggingEv.color === 'amber' ? '#f59e0b'
                  : draggingEv.color === 'gray' ? '#6b7280'
                  : '#3b82f6',
                width: '200px',
              }}
            >
              {draggingEv.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
