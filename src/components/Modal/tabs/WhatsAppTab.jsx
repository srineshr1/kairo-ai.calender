import React, { useState } from 'react'
import SettingSection from '../../shared/SettingSection'
import Input from '../../shared/Input'
import Toggle from '../../shared/Toggle'
import NumberInput from '../../shared/NumberInput'
import { useSettingsStore } from '../../../store/useSettingsStore'
import { useDarkStore } from '../../../store/useDarkStore'

export default function WhatsAppTab() {
  const { isDark } = useDarkStore()
  const { whatsappBridgeUrl, whatsappPollInterval, whatsappAutoAdd, updateSetting } = useSettingsStore()
  const [testStatus, setTestStatus] = useState(null)
  const [testing, setTesting] = useState(false)

  const handleTestConnection = async () => {
    setTesting(true)
    setTestStatus(null)

    try {
      const response = await fetch(`${whatsappBridgeUrl}/status`, {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        setTestStatus({ success: true, message: `Connected! Status: ${data.status || 'OK'}` })
      } else {
        setTestStatus({ success: false, message: 'Failed to connect. Check URL.' })
      }
    } catch (error) {
      setTestStatus({ success: false, message: 'Connection failed. Is the bridge running?' })
    } finally {
      setTesting(false)
    }
  }

  const handleManageGroups = () => {
    // This will be wired to open WhatsAppSettings modal
    alert('Group management will open from TopBar WhatsApp button')
  }

  return (
    <div>
      <SettingSection title="Bridge Configuration">
        <Input
          label="WhatsApp Bridge URL"
          description="Address of your WhatsApp bridge server"
          type="url"
          placeholder="http://localhost:3001"
          value={whatsappBridgeUrl}
          onChange={(value) => updateSetting('whatsappBridgeUrl', value)}
        />

        <NumberInput
          label="Poll interval"
          description="How often to check for new messages"
          value={whatsappPollInterval}
          onChange={(value) => updateSetting('whatsappPollInterval', value)}
          min={10}
          max={300}
          step={10}
          suffix="seconds"
        />

        <Toggle
          label="Auto-add events"
          description="Automatically create events from WhatsApp messages"
          checked={whatsappAutoAdd}
          onChange={(checked) => updateSetting('whatsappAutoAdd', checked)}
        />
      </SettingSection>

      <SettingSection title="Group Management">
        <div>
          <button
            onClick={handleManageGroups}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Select Groups...
          </button>
          <p className={`text-[12px] mt-2 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            Opens group selection from TopBar WhatsApp button
          </p>
        </div>
      </SettingSection>

      <SettingSection title="Connection">
        <div>
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              testing ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          {testStatus && (
            <p
              className={`text-[12px] mt-2 ${
                testStatus.success ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {testStatus.success ? '✅' : '❌'} {testStatus.message}
            </p>
          )}
        </div>
      </SettingSection>
    </div>
  )
}
