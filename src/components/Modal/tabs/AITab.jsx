import React, { useState } from 'react'
import SettingSection from '../../shared/SettingSection'
import Input from '../../shared/Input'
import Select from '../../shared/Select'
import Slider from '../../shared/Slider'
import { useSettingsStore } from '../../../store/useSettingsStore'
import { useDarkStore } from '../../../store/useDarkStore'

export default function AITab() {
  const { isDark } = useDarkStore()
  const { ollamaUrl, ollamaModel, ollamaTemperature, updateSetting } = useSettingsStore()
  const [testStatus, setTestStatus] = useState(null)
  const [testing, setTesting] = useState(false)

  const handleTestConnection = async () => {
    setTesting(true)
    setTestStatus(null)

    try {
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        setTestStatus({ success: true, message: 'Connected successfully!' })
      } else {
        setTestStatus({ success: false, message: 'Failed to connect. Check URL.' })
      }
    } catch (error) {
      setTestStatus({ success: false, message: 'Connection failed. Is Ollama running?' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      <SettingSection title="Ollama Configuration">
        <Input
          label="Ollama API URL"
          description="Address of your local Ollama server"
          type="url"
          placeholder="http://localhost:11434"
          value={ollamaUrl}
          onChange={(value) => updateSetting('ollamaUrl', value)}
        />

        <Select
          label="AI Model"
          description="Which Ollama model to use for responses"
          options={[
            { value: 'llama3.2:3b', label: 'Llama 3.2 3B (Recommended)' },
            { value: 'llama3.2:1b', label: 'Llama 3.2 1B (Faster)' },
            { value: 'mistral', label: 'Mistral' },
            { value: 'phi3', label: 'Phi-3' },
          ]}
          value={ollamaModel}
          onChange={(value) => updateSetting('ollamaModel', value)}
        />

        <Slider
          label="Temperature"
          description="Lower = more factual, Higher = more creative"
          value={ollamaTemperature}
          onChange={(value) => updateSetting('ollamaTemperature', value)}
          min={0}
          max={2}
          step={0.1}
          showValue={true}
        />
      </SettingSection>

      <SettingSection title="Connection">
        <div>
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              testing
                ? 'opacity-50 cursor-not-allowed'
                : ''
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
