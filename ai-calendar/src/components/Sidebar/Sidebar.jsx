import React, { useState } from 'react'
import TaskList from './TaskList'
import MiniCalendar from './MiniCalendar'
import { Icon } from '../Icons'

export default function Sidebar({ onAddEvent }) {
  const [thisMonthOpen, setThisMonthOpen] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)

  return (
    <aside className="w-[260px] min-w-[260px] bg-sidebar flex flex-col border-r border-white/[0.07] overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-7 pb-5 flex items-center justify-between flex-shrink-0">
        <span className="font-display text-[22px] text-gray-100 tracking-tight">my.calendar</span>
        <div className="flex gap-1.5">
          <button
            onClick={onAddEvent}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-colors"
            title="Add event"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-colors">
            <Icon name="minus" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* This month section */}
      <div className="mx-3 mb-2 rounded-xl bg-white/[0.04] overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3.5 py-3 text-[13px] font-medium text-gray-200 hover:bg-white/[0.04] transition-colors"
          onClick={() => setThisMonthOpen((v) => !v)}
        >
          <span>This month</span>
          <Icon
            name={thisMonthOpen ? 'minus' : 'plus'}
            className="w-3.5 h-3.5 text-gray-500"
          />
        </button>
        {thisMonthOpen && <TaskList onAdd={onAddEvent} />}
      </div>

      {/* Quick notes */}
      <div className="mx-3 mb-2 rounded-xl bg-white/[0.04] overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3.5 py-3 text-[13px] font-medium text-gray-200 hover:bg-white/[0.04] transition-colors"
          onClick={() => setNotesOpen((v) => !v)}
        >
          <span>Quick notes</span>
          <Icon
            name={notesOpen ? 'minus' : 'plus'}
            className="w-3.5 h-3.5 text-gray-500"
          />
        </button>
        {notesOpen && (
          <div className="px-3 pb-3">
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 p-2 resize-none outline-none focus:border-accent/50 transition-colors"
              rows={4}
              placeholder="Jot something down…"
            />
          </div>
        )}
      </div>

      {/* Add section */}
      <button className="mx-3 mb-4 px-3.5 py-2.5 rounded-xl border border-dashed border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-accent/50 text-[12.5px] text-gray-600 hover:text-accent transition-all text-center flex items-center justify-center gap-1.5">
        <Icon name="plus" className="w-3 h-3" />
        Add section
      </button>

      <div className="h-px bg-white/[0.07] mx-3" />

      <MiniCalendar />
    </aside>
  )
}
