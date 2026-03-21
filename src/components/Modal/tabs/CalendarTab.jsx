import React from 'react'
import SettingSection from '../../shared/SettingSection'
import Select from '../../shared/Select'
import Toggle from '../../shared/Toggle'
import DualSlider from '../../shared/DualSlider'
import { useSettingsStore } from '../../../store/useSettingsStore'

export default function CalendarTab() {
  const {
    defaultView,
    defaultEventDuration,
    defaultEventColor,
    awakeStart,
    awakeEnd,
    showPastEvents,
    updateSetting,
    updateMultiple,
  } = useSettingsStore()

  const formatHour = (hour) => {
    const h = hour % 12 || 12
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return `${h}:00 ${ampm}`
  }

  return (
    <div>
      <SettingSection title="Defaults">
        <Select
          label="Default view"
          description="Calendar view shown when app opens"
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={defaultView}
          onChange={(value) => updateSetting('defaultView', value)}
        />

        <Select
          label="Default event duration"
          description="Duration pre-filled when creating new events"
          options={[
            { value: 15, label: '15 minutes' },
            { value: 30, label: '30 minutes' },
            { value: 60, label: '1 hour' },
            { value: 90, label: '1.5 hours' },
            { value: 120, label: '2 hours' },
          ]}
          value={defaultEventDuration}
          onChange={(value) => updateSetting('defaultEventDuration', parseInt(value))}
        />

        <Select
          label="Default event color"
          description="Color pre-filled when creating new events"
          options={[
            { value: 'pink', label: 'Pink' },
            { value: 'green', label: 'Green' },
            { value: 'blue', label: 'Blue' },
            { value: 'amber', label: 'Amber' },
            { value: 'gray', label: 'Gray' },
          ]}
          value={defaultEventColor}
          onChange={(value) => updateSetting('defaultEventColor', value)}
        />
      </SettingSection>

      <SettingSection title="View Options">
        <DualSlider
          label="Awake hours"
          description="Time range displayed in calendar views"
          valueStart={awakeStart}
          valueEnd={awakeEnd}
          min={0}
          max={24}
          step={1}
          formatValue={formatHour}
          onChange={(start, end) => updateMultiple({ awakeStart: start, awakeEnd: end })}
        />

        <Toggle
          label="Show past events"
          description="Display events that have already occurred"
          checked={showPastEvents}
          onChange={(checked) => updateSetting('showPastEvents', checked)}
        />
      </SettingSection>
    </div>
  )
}
