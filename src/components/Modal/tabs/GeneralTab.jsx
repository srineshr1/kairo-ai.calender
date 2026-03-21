import React from 'react'
import SettingSection from '../../shared/SettingSection'
import RadioGroup from '../../shared/RadioGroup'
import { useSettingsStore } from '../../../store/useSettingsStore'

export default function GeneralTab() {
  const { timeFormat, weekStartDay, dateFormat, updateSetting } = useSettingsStore()

  return (
    <div>
      <SettingSection title="Time & Date">
        <RadioGroup
          label="Time format"
          description="Choose how times are displayed throughout the app"
          options={[
            { value: '12h', label: '12-hour (9:00 AM, 3:30 PM)' },
            { value: '24h', label: '24-hour (09:00, 15:30)' },
          ]}
          value={timeFormat}
          onChange={(value) => updateSetting('timeFormat', value)}
        />

        <RadioGroup
          label="Week start day"
          description="First day of the week in calendar views"
          options={[
            { value: 'sunday', label: 'Sunday' },
            { value: 'monday', label: 'Monday' },
            { value: 'saturday', label: 'Saturday' },
          ]}
          value={weekStartDay}
          onChange={(value) => updateSetting('weekStartDay', value)}
          layout="horizontal"
        />

        <RadioGroup
          label="Date format"
          description="Choose how dates are displayed"
          options={[
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
          ]}
          value={dateFormat}
          onChange={(value) => updateSetting('dateFormat', value)}
        />
      </SettingSection>

      <SettingSection title="Language">
        <RadioGroup
          label="Display language"
          description="More languages coming soon"
          options={[
            { value: 'en', label: 'English' },
          ]}
          value="en"
          onChange={() => {}}
          layout="horizontal"
        />
      </SettingSection>
    </div>
  )
}
