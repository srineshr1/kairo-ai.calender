import React from 'react'
import SettingSection from '../../shared/SettingSection'
import Toggle from '../../shared/Toggle'
import Select from '../../shared/Select'
import DualSlider from '../../shared/DualSlider'
import { useSettingsStore } from '../../../store/useSettingsStore'

export default function NotificationsTab() {
  const {
    notificationsEnabled,
    reminderTime,
    soundAlerts,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
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
      <SettingSection title="Notification Preferences">
        <Toggle
          label="Enable notifications"
          description="Show notifications for events and reminders"
          checked={notificationsEnabled}
          onChange={(checked) => updateSetting('notificationsEnabled', checked)}
        />

        <Select
          label="Default reminder time"
          description="How early to notify before events start"
          options={[
            { value: 5, label: '5 minutes before' },
            { value: 10, label: '10 minutes before' },
            { value: 15, label: '15 minutes before' },
            { value: 30, label: '30 minutes before' },
            { value: 60, label: '1 hour before' },
          ]}
          value={reminderTime}
          onChange={(value) => updateSetting('reminderTime', parseInt(value))}
          disabled={!notificationsEnabled}
        />

        <Toggle
          label="Sound alerts"
          description="Play sound when notifications appear"
          checked={soundAlerts}
          onChange={(checked) => updateSetting('soundAlerts', checked)}
          disabled={true}
        />
      </SettingSection>

      <SettingSection title="Quiet Hours">
        <Toggle
          label="Enable quiet hours"
          description="Don't send notifications during specific times"
          checked={quietHoursEnabled}
          onChange={(checked) => updateSetting('quietHoursEnabled', checked)}
        />

        {quietHoursEnabled && (
          <DualSlider
            label="Quiet hours range"
            description="No notifications will be sent during this time"
            valueStart={quietHoursStart}
            valueEnd={quietHoursEnd}
            min={0}
            max={23}
            step={1}
            formatValue={formatHour}
            onChange={(start, end) => updateMultiple({ quietHoursStart: start, quietHoursEnd: end })}
          />
        )}
      </SettingSection>
    </div>
  )
}
