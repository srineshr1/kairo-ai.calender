import React from 'react'
import SettingSection from '../../shared/SettingSection'
import Toggle from '../../shared/Toggle'
import Select from '../../shared/Select'
import ColorPicker from '../../shared/ColorPicker'
import { useSettingsStore } from '../../../store/useSettingsStore'

export default function AppearanceTab() {
  const { accentColor, compactMode, fontSize, showWeekends, updateSetting } = useSettingsStore()

  return (
    <div>
      <SettingSection title="Accent Color">
        <ColorPicker
          label="Accent color"
          description="Primary color used throughout the app"
          value={accentColor}
          onChange={(value) => updateSetting('accentColor', value)}
          presets={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']}
        />
      </SettingSection>

      <SettingSection title="Display">
        <Select
          label="Font size"
          description="Adjust text size throughout the app"
          options={[
            { value: 'small', label: 'Small (90%)' },
            { value: 'medium', label: 'Medium (100%)' },
            { value: 'large', label: 'Large (110%)' },
            { value: 'extraLarge', label: 'Extra Large (120%)' },
          ]}
          value={fontSize}
          onChange={(value) => updateSetting('fontSize', value)}
        />

        <Toggle
          label="Compact mode"
          description="Reduce spacing for a denser layout"
          checked={compactMode}
          onChange={(checked) => updateSetting('compactMode', checked)}
        />

        <Toggle
          label="Show weekends"
          description="Display Saturday and Sunday in week view"
          checked={showWeekends}
          onChange={(checked) => updateSetting('showWeekends', checked)}
        />
      </SettingSection>
    </div>
  )
}
