import React, { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import { format, addDays, subDays } from 'date-fns'
import { useEventStore } from '../../store/useEventStore'
import { useDarkStore } from '../../store/useDarkStore'
import {
  fmtDate, isToday, expandRecurring,
  timeToMinutes, minutesToTime, snapTo15,
} from '../../lib/dateUtils'
import { PX_PER_HOUR, TOTAL_HOURS, SNAP_INTERVAL_MINUTES } from '../../lib/constants'
import DayColumn from './DayColumn'
import { Icon } from '../Icons'

const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => i)

export default function DayView({ onEventClick, onSlotClick }) {
  const {
    events, searchQuery, reschedule,
    awakeStart, awakeEnd, setAwakeStart, setAwakeEnd,
  } = useEventStore()
  const { isDark } = useDarkStore()

  const [currentDay, setCurrentDay] = useState(new Date())
  const [draggingEv, setDraggingEv] = useState(null)
  const [slideDir, setSlideDir] = useState(null)
  const [animKey, setAnimKey] = useState(0)
  const [showSleepSettings, setShowSleepSettings] = useState(false)

  const expandedEvents = expandRecurring(events, [currentDay])

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
      <div className="bg-white dark:bg-[#1f1d30] px-7 py-3 flex items-center gap-3 border-b border-black/[0.06] dark:border-white/10 flex-shrink-0">
        <button
          onClick={() => navigate('left')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 hover:text-gray-700 transition-colors"
        >
          <Icon name="chevronLeft" className="w-4 h-4" />
        </button>
        <h2 className="font-display text-[22px] text-gray-800 dark:text-gray-100 tracking-tight min-w-[300px]">
          {dayLabel}
        </h2>
        <button
          onClick={() => navigate('right')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 hover:text-gray-700 transition-colors"
        >
          <Icon name="chevronRight" className="w-4 h-4" />
        </button>

        <button
          onClick={() => setCurrentDay(new Date())}
          className="ml-2 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          Today
        </button>

        <div className="flex-1" />

        {/* Sleep zone settings toggle */}
        <button
          onClick={() => setShowSleepSettings(!showSleepSettings)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 hover:text-gray-700 transition-colors"
          title="Sleep hours"
        >
          <Icon name="clock" className="w-4 h-4" />
        </button>
      </div>

      {/* Sleep settings panel */}
      {showSleepSettings && (
        <div className="bg-[#faf9f7] dark:bg-[#252340] border-b border-black/[0.06] dark:border-white/10 px-7 py-3 flex items-center gap-4">
          <span className="text-[13px] text-gray-600 dark:text-gray-300 font-medium">Awake hours:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="23"
              value={awakeStart}
              onChange={(e) => setAwakeStart(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a2e] text-[13px] text-gray-700 dark:text-gray-200"
            />
            <span className="text-gray-500 dark:text-gray-400 text-[13px]">to</span>
            <input
              type="number"
              min="0"
              max="23"
              value={awakeEnd}
              onChange={(e) => setAwakeEnd(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#1a1a2e] text-[13px] text-gray-700 dark:text-gray-200"
            />
          </div>
          <button
            onClick={() => setShowSleepSettings(false)}
            className="ml-4 text-[12px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
            <div className="sticky left-0 z-20 bg-main dark:bg-[#1a1a2e] w-16 flex-shrink-0 border-r border-black/[0.06] dark:border-white/10">
              {HOURS.map((h) => {
                const isSleep = h < awakeStart || h >= awakeEnd
                return (
                  <div
                    key={h}
                    className={`text-[11px] text-right pr-2 font-medium transition-colors ${
                      isSleep
                        ? 'text-gray-300 dark:text-gray-700'
                        : 'text-gray-400 dark:text-gray-500'
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
