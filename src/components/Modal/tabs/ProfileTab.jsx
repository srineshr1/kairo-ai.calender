import React from 'react'
import SettingSection from '../../shared/SettingSection'
import Input from '../../shared/Input'
import EmojiPicker from '../../shared/EmojiPicker'
import { useSettingsStore } from '../../../store/useSettingsStore'

export default function ProfileTab() {
  const { userName, userEmail, userAvatar, updateSetting } = useSettingsStore()

  return (
    <div>
      <SettingSection title="Basic Information">
        <Input
          label="Name"
          description="Your display name"
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(value) => updateSetting('userName', value)}
          maxLength={50}
        />

        <Input
          label="Email"
          description="Optional - for future features"
          type="email"
          placeholder="your.email@example.com"
          value={userEmail}
          onChange={(value) => updateSetting('userEmail', value)}
        />
      </SettingSection>

      <SettingSection title="Avatar">
        <EmojiPicker
          label="Choose your avatar"
          description="Select an emoji to represent you"
          value={userAvatar}
          onChange={(value) => updateSetting('userAvatar', value)}
          presets={['👤', '😊', '🚀', '💼', '🎯', '⭐', '🌟', '💡', '🎨', '🔥', '💪', '🌈', '🎭', '🦄', '🐱', '🐶']}
        />
      </SettingSection>
    </div>
  )
}
