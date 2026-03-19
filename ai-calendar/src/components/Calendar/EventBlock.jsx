import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// Richer bg + darker text + left border accent per color
const COLOR_MAP = {
  pink:  { cls: 'bg-event-pink',  border: '#c060d0', text: '#6b1a7a', sub: '#9040a0' },
  green: { cls: 'bg-event-green', border: '#2a9e5a', text: '#145c30', sub: '#1e7a44' },
  blue:  { cls: 'bg-event-blue',  border: '#3070c8', text: '#0f3d80', sub: '#1a54a8' },
  amber: { cls: 'bg-event-amber', border: '#c87820', text: '#6b3a08', sub: '#9a5810' },
  gray:  { cls: 'bg-event-gray',  border: '#888888', text: '#333333', sub: '#555555' },
}

export default function EventBlock({ event, topPx, heightPx, dimmed, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  })

  const colors = COLOR_MAP[event.color] || COLOR_MAP.gray

  const style = {
    position: 'absolute',
    top: topPx,
    height: Math.max(heightPx, 24),
    left: 4,
    right: 4,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : dimmed ? 0.15 : 1,
    zIndex: isDragging ? 50 : 4,
    transition: isDragging ? 'none' : 'opacity 0.15s, box-shadow 0.15s, transform 0.1s',
    cursor: isDragging ? 'grabbing' : 'grab',
    borderLeft: `3px solid ${colors.border}`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg px-2 py-1.5 overflow-hidden select-none hover:shadow-md hover:-translate-y-px ${colors.cls}`}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onClick(event) }}
    >
      <p
        className={`text-[12.5px] font-semibold leading-tight ${event.done ? 'line-through opacity-40' : ''}`}
        style={{ color: colors.text }}
      >
        {event.title}
      </p>
      {event.sub && heightPx > 36 && (
        <p className="text-[11px] mt-0.5 truncate font-medium" style={{ color: colors.sub }}>
          {event.sub}
        </p>
      )}
    </div>
  )
}
