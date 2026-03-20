import React, { useEffect, useState } from 'react'
import { useEventStore } from '../../store/useEventStore'
import { validateEvent } from '../../lib/validation'
import LoadingSpinner from '../LoadingSpinner'

const COLORS = [
  { key: 'pink',  bg: '#f0e8f5', label: '🌸' },
  { key: 'green', bg: '#e8f5ee', label: '🌿' },
  { key: 'blue',  bg: '#e8eef5', label: '💧' },
  { key: 'amber', bg: '#f5f0e8', label: '☀️' },
  { key: 'gray',  bg: '#f2f2f2', label: '◻' },
]

const RECURRENCE = ['none', 'daily', 'weekly', 'monthly']

const empty = {
  title: '', date: '', time: '09:00', duration: 60,
  sub: '', color: 'pink', recurrence: 'none', recurrenceEnd: '',
}

export default function EventModal({ isOpen, onClose, editEvent: editTarget, defaultDate, defaultTime }) {
  const { addEvent, editEvent, deleteEvent, isLoading } = useEventStore()
  const [form, setForm] = useState(empty)
  const [showRecurringPrompt, setShowRecurringPrompt] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = !!editTarget

  useEffect(() => {
    if (!isOpen) return
    // Clear validation errors when modal opens
    setValidationErrors({})
    if (editTarget) {
      setForm({ ...empty, ...editTarget })
    } else {
      setForm({
        ...empty,
        date: defaultDate || new Date().toISOString().split('T')[0],
        time: defaultTime || '09:00',
      })
    }
  }, [isOpen, editTarget, defaultDate, defaultTime])

  if (!isOpen) return null

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }))
    // Clear validation error for this field when user starts typing
    if (validationErrors[key]) {
      setValidationErrors((errors) => {
        const newErrors = { ...errors }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const handleSave = async () => {
    // Clear previous errors
    setValidationErrors({})
    setIsSaving(true)
    
    try {
      // Validate the form
      const validation = validateEvent(form)
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        setIsSaving(false)
        return
      }

      // Handle recurring event editing
      if (isEditing) {
        if (editTarget.recurrence && editTarget.recurrence !== 'none') {
          setShowRecurringPrompt(true)
          setIsSaving(false)
          return
        }
        editEvent(editTarget.id, form)
      } else {
        addEvent(form)
      }
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300))
      setIsSaving(false)
      onClose()
    } catch (error) {
      setValidationErrors({ general: error.message || 'Failed to save event' })
      setIsSaving(false)
    }
  }

  const handleRecurringChoice = async (editAll) => {
    setIsSaving(true)
    try {
      editEvent(editTarget.id, form, editAll)
      await new Promise(resolve => setTimeout(resolve, 300))
      setShowRecurringPrompt(false)
      setIsSaving(false)
      onClose()
    } catch (error) {
      setValidationErrors({ general: error.message || 'Failed to save event' })
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsSaving(true)
    try {
      if (editTarget) deleteEvent(editTarget.id)
      await new Promise(resolve => setTimeout(resolve, 300))
      setIsSaving(false)
      onClose()
    } catch (error) {
      setValidationErrors({ general: error.message || 'Failed to delete event' })
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-[#1f1d30] rounded-2xl p-6 w-[400px] shadow-2xl animate-modalIn">
        {showRecurringPrompt ? (
          <>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">Edit recurring event</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This is a recurring event. What would you like to edit?</p>
            {validationErrors.general && (
              <p className="text-xs text-red-500 mb-3 text-center">{validationErrors.general}</p>
            )}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleRecurringChoice(false)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {isSaving && <LoadingSpinner size="sm" />}
                This event only
              </button>
              <button 
                onClick={() => handleRecurringChoice(true)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {isSaving && <LoadingSpinner size="sm" />}
                All future occurrences
              </button>
              <button 
                onClick={() => setShowRecurringPrompt(false)}
                disabled={isSaving}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {isEditing ? 'Edit Event' : 'Add Event'}
            </h3>

            {/* Title */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Title</label>
              <input
                autoFocus
                className={`w-full border ${validationErrors.title ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-white/10'} dark:bg-[#252340] rounded-xl px-3 py-2 text-[13.5px] text-gray-800 dark:text-gray-200 outline-none focus:border-accent transition-colors font-sans`}
                placeholder="Event title…"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              {validationErrors.title && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.title}</p>
              )}
            </div>

            {/* Date + Time */}
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Date</label>
                <input type="date"
                  className={`w-full border ${validationErrors.date ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-white/10'} dark:bg-[#252340] rounded-xl px-3 py-2 text-[13px] text-gray-800 dark:text-gray-200 outline-none focus:border-accent transition-colors font-sans`}
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                />
                {validationErrors.date && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.date}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Time</label>
                <input type="time"
                  className={`w-full border ${validationErrors.time ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-white/10'} dark:bg-[#252340] rounded-xl px-3 py-2 text-[13px] text-gray-800 dark:text-gray-200 outline-none focus:border-accent transition-colors font-sans`}
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                />
                {validationErrors.time && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.time}</p>
                )}
              </div>
            </div>

            {/* Duration + Sub */}
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Duration (min)</label>
                <input type="number"
                  className={`w-full border ${validationErrors.duration ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-white/10'} dark:bg-[#252340] rounded-xl px-3 py-2 text-[13px] text-gray-800 dark:text-gray-200 outline-none focus:border-accent transition-colors font-sans`}
                  value={form.duration} min={15} step={15}
                  onChange={(e) => set('duration', parseInt(e.target.value) || 60)}
                />
                {validationErrors.duration && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.duration}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Location</label>
                <input
                  className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#252340] rounded-xl px-3 py-2 text-[13px] text-gray-800 dark:text-gray-200 outline-none focus:border-accent transition-colors font-sans"
                  placeholder="e.g. Zoom, Office…"
                  value={form.sub}
                  onChange={(e) => set('sub', e.target.value)}
                />
              </div>
            </div>

            {/* Recurrence */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Repeats</label>
              <select
                className={`w-full border ${validationErrors.recurrence ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-white/10'} dark:bg-[#252340] rounded-xl px-3 py-2 text-[13px] text-gray-700 dark:text-gray-200 outline-none focus:border-accent transition-colors bg-white font-sans`}
                value={form.recurrence}
                onChange={(e) => set('recurrence', e.target.value)}
              >
                {RECURRENCE.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
              {validationErrors.recurrence && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.recurrence}</p>
              )}
            </div>

            {/* Color */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Color</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => set('color', c.key)}
                    style={{ background: c.bg }}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all hover:scale-110 ${form.color === c.key ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {validationErrors.color && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.color}</p>
              )}
            </div>

            {/* Buttons */}
            {validationErrors.general && (
              <p className="text-xs text-red-500 mb-3 text-center">{validationErrors.general}</p>
            )}
            <div className="flex items-center gap-2 justify-end">
              {isEditing && (
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-[13px] transition-colors mr-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <LoadingSpinner size="sm" /> : 'Delete'}
                </button>
              )}
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-sidebar-deep text-white text-[13px] font-medium hover:bg-sidebar transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && <LoadingSpinner size="sm" />}
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
