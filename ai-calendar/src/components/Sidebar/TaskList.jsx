import React, { useRef } from 'react'
import { useEventStore, getTaskStatus, STATUS_STYLES } from '../../store/useEventStore'
import { isSameMonth } from 'date-fns'
import { parseDate } from '../../lib/dateUtils'
import { Icon } from '../Icons'

export default function TaskList({ onAdd }) {
  const { events, markDone, cancelEvent } = useEventStore()
  const now = new Date()
  const doubleClickTimers = useRef({})

  const monthEvents = events
    .filter((e) => isSameMonth(parseDate(e.date), now) && !e.cancelled)
    .slice(0, 8)

  const handleClick = (id) => {
    // Double-click detection via timer
    if (doubleClickTimers.current[id]) {
      clearTimeout(doubleClickTimers.current[id])
      delete doubleClickTimers.current[id]
      markDone(id)
    } else {
      doubleClickTimers.current[id] = setTimeout(() => {
        delete doubleClickTimers.current[id]
        // single click — do nothing, require double click
      }, 300)
    }
  }

  return (
    <div className="px-3 pb-3">
      {monthEvents.map((ev) => {
        const status = getTaskStatus(ev)
        const style = STATUS_STYLES[status]
        return (
          <div
            key={ev.id}
            className="flex items-start gap-2 px-1 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group select-none"
            onClick={() => handleClick(ev.id)}
            title="Double-click to mark done"
          >
            {/* Checkbox */}
            <div className={`
              w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200
              ${ev.done
                ? 'bg-green-600 border-green-600'
                : 'border-white/20 bg-transparent group-hover:border-white/40'}
            `}>
              {ev.done && <Icon name="check" className="w-2.5 h-2.5 text-white" />}
            </div>

            {/* Title */}
            <span className={`text-[12px] leading-snug flex-1 transition-all duration-200 ${ev.done ? 'line-through text-gray-600' : 'text-gray-300'}`}>
              {ev.title}{ev.source === 'whatsapp' && <span className="ml-1 text-[9px] bg-green-900/40 text-green-400 border border-green-700/40 px-1 py-0.5 rounded-full uppercase tracking-wide font-semibold">WA</span>}
              {ev.sub && <span className="text-gray-600 text-[11px]"> ({ev.sub})</span>}
            </span>

            {/* Status pill */}
            <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full border leading-none flex-shrink-0 mt-0.5 uppercase tracking-wide ${style.pill}`}>
              {style.label}
            </span>
          </div>
        )
      })}

      <div className="h-px bg-white/[0.06] my-2" />

      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-1 py-1.5 text-[12px] text-gray-600 hover:text-accent transition-colors w-full rounded-lg hover:bg-white/5"
      >
        <Icon name="plus" className="w-3 h-3" />
        Add new
      </button>

      <p className="text-[10px] text-gray-700 text-center mt-1">Double-click to mark done</p>
    </div>
  )
}
