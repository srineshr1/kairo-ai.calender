import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EventModal from '../EventModal'

// Mock the event store
vi.mock('../../../store/useEventStore', () => ({
  useEventStore: () => ({
    addEvent: vi.fn(),
    editEvent: vi.fn(),
    deleteEvent: vi.fn(),
  }),
}))

describe('EventModal - Input Validation', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('should display validation error for empty title', async () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        defaultDate="2026-03-20"
        defaultTime="09:00"
      />
    )

    // Try to save without a title
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })

  it('should display validation error for title over 100 characters', async () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        defaultDate="2026-03-20"
        defaultTime="09:00"
      />
    )

    // Enter a title that's too long
    const titleInput = screen.getByPlaceholderText('Event title…')
    fireEvent.change(titleInput, {
      target: { value: 'a'.repeat(101) },
    })

    // Try to save
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Title must be less than 100 characters')).toBeInTheDocument()
    })
  })

  it('should clear validation error when user starts typing in title field', async () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        defaultDate="2026-03-20"
        defaultTime="09:00"
      />
    )

    // Try to save without a title to trigger error
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    // Now start typing
    const titleInput = screen.getByPlaceholderText('Event title…')
    fireEvent.change(titleInput, { target: { value: 'T' } })

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    })
  })

  it('should highlight invalid fields with red border', async () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        defaultDate="2026-03-20"
        defaultTime="09:00"
      />
    )

    // Try to save without a title
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    // Title input should have red border
    await waitFor(() => {
      const titleInput = screen.getByPlaceholderText('Event title…')
      expect(titleInput.className).toContain('border-red-500')
    })
  })

  it('should display validation error for duration outside valid range', async () => {
    render(
      <EventModal
        isOpen={true}
        onClose={mockOnClose}
        defaultDate="2026-03-20"
        defaultTime="09:00"
      />
    )

    // Enter a valid title
    const titleInput = screen.getByPlaceholderText('Event title…')
    fireEvent.change(titleInput, { target: { value: 'Test Event' } })

    // Set duration to invalid value (less than 5 minutes)
    const durationInputs = screen.getAllByDisplayValue('60')
    const durationInput = durationInputs[0] // Get the first input with value 60 (duration field)
    fireEvent.change(durationInput, { target: { value: '2' } })

    // Try to save
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Duration must be at least 5 minutes')).toBeInTheDocument()
    })
  })
})
