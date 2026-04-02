import React from 'react'
import { useSettingsStore } from '../../../store/useSettingsStore'
import { getPerformanceTierName } from '../../../lib/performanceDetection'

export default function AppearanceTab() {
  const { 
    accentColor, 
    themePreset, 
    compactMode, 
    showWeekends, 
    savingKeys, 
    updateSetting,
    blurEnabled,
    blurOverride,
    deviceBlurLevel,
    getEffectiveBlurLevel
  } = useSettingsStore()

  const effectiveBlurLevel = getEffectiveBlurLevel()

  const accentColors = [
    { name: 'Sapphire', value: '#3b82f6' },
    { name: 'Champagne', value: '#cda45e' },
    { name: 'Coral', value: '#e46a6a' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rosewood', value: '#c35e89' },
    { name: 'Ocean', value: '#0ea5b7' },
  ]

  const themePresets = [
    { id: 'royal', name: 'Royal Night', colors: ['#3b82f6', '#6d4ec9', '#f8f4ff'] },
    { id: 'emerald', name: 'Emerald Gold', colors: ['#10b981', '#cda45e', '#f3fff7'] },
    { id: 'rose', name: 'Rose Graphite', colors: ['#c35e89', '#a0645f', '#fff5f7'] },
    { id: 'ocean', name: 'Ocean Steel', colors: ['#0ea5b7', '#4f7fa0', '#f1fafd'] },
  ]

  const blurOptions = [
    { value: null, label: 'Auto', desc: `(${getPerformanceTierName(deviceBlurLevel)})` },
    { value: 'full', label: 'Full', desc: 'Best quality' },
    { value: 'reduced', label: 'Reduced', desc: 'Balanced' },
    { value: 'none', label: 'Off', desc: 'Best performance' },
  ]

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-4 theme-text-secondary">
        Theme
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-[13px] font-medium theme-text-primary mb-2">Premium Theme</p>
          <div className="grid grid-cols-2 gap-3">
            {themePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => updateSetting('themePreset', preset.id)}
                disabled={savingKeys.themePreset}
                className={`press-feedback p-3 rounded-xl border text-left transition-all theme-control ${
                  themePreset === preset.id ? 'theme-control-active' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  {preset.colors.map((color) => (
                    <span key={color} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="text-[12px] font-semibold theme-text-primary">{preset.name}</div>
                <div className="text-[11px] theme-text-secondary">
                  {savingKeys.themePreset && themePreset === preset.id ? 'Applying...' : 'Balanced across light and dark'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px my-4 border-t border-[color:var(--theme-border)]" />

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] font-medium theme-text-primary">
              Accent Color
            </p>
            <p className="text-[12px] mt-0.5 theme-text-secondary">
              Primary color used throughout
            </p>
          </div>
          <div className="flex gap-2">
            {accentColors.map(({ name, value }) => (
              <button
                key={value}
                onClick={() => updateSetting('accentColor', value)}
                disabled={savingKeys.accentColor}
                title={name}
                className={`w-7 h-7 rounded-full transition-all press-feedback ${
                  accentColor === value 
                    ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: value }}
              />
            ))}
          </div>
        </div>

        {savingKeys.accentColor && (
          <p className="text-[11px] theme-text-secondary -mt-2">Applying accent color...</p>
        )}

        <div className="h-px my-4 border-t border-[color:var(--theme-border)]" />

        <div className="text-[11px] font-semibold uppercase tracking-wider mb-4 theme-text-secondary">
          Effects
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] font-medium theme-text-primary">
              Blur Effects
            </p>
            <p className="text-[12px] mt-0.5 theme-text-secondary">
              Premium glassmorphism effects
            </p>
          </div>
          <button
            onClick={() => updateSetting('blurEnabled', !blurEnabled)}
            disabled={savingKeys.blurEnabled}
            className={`relative w-10 h-5 rounded-full transition-colors press-feedback ${
              blurEnabled 
                ? 'theme-toggle-on' 
                : 'theme-toggle'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              blurEnabled ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>

        {blurEnabled && (
          <div className="py-2">
            <p className="text-[13px] font-medium theme-text-primary mb-2">
              Blur Quality
            </p>
            <div className="grid grid-cols-4 gap-2">
              {blurOptions.map((option) => (
                <button
                  key={option.value ?? 'auto'}
                  onClick={() => updateSetting('blurOverride', option.value)}
                  disabled={savingKeys.blurOverride}
                  className={`press-feedback p-2.5 rounded-xl border text-center transition-all theme-control ${
                    blurOverride === option.value ? 'theme-control-active' : ''
                  }`}
                >
                  <div className="text-[12px] font-semibold theme-text-primary">{option.label}</div>
                  <div className="text-[10px] theme-text-secondary">{option.desc}</div>
                </button>
              ))}
            </div>
            {blurOverride === 'full' && deviceBlurLevel !== 'full' && (
              <p className="text-[11px] text-amber-500 mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                May impact performance on your device
              </p>
            )}
            <p className="text-[11px] theme-text-secondary mt-2">
              Active: <span className="font-medium">{effectiveBlurLevel === 'full' ? 'Full' : effectiveBlurLevel === 'reduced' ? 'Reduced' : 'Off'}</span>
            </p>
          </div>
        )}

        <div className="h-px my-4 border-t border-[color:var(--theme-border)]" />

        <div className="text-[11px] font-semibold uppercase tracking-wider mb-4 theme-text-secondary">
          Layout
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] font-medium theme-text-primary">
              Show Weekends
            </p>
            <p className="text-[12px] mt-0.5 theme-text-secondary">
              Display Sat and Sun in week view
            </p>
          </div>
          <button
            onClick={() => updateSetting('showWeekends', !showWeekends)}
            disabled={savingKeys.showWeekends}
            className={`relative w-10 h-5 rounded-full transition-colors press-feedback ${
              showWeekends 
                ? 'theme-toggle-on' 
                : 'theme-toggle'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              showWeekends ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] font-medium theme-text-primary">
              Compact Mode
            </p>
            <p className="text-[12px] mt-0.5 theme-text-secondary">
              Denser layout with less spacing
            </p>
          </div>
          <button
            onClick={() => updateSetting('compactMode', !compactMode)}
            disabled={savingKeys.compactMode}
            className={`relative w-10 h-5 rounded-full transition-colors press-feedback ${
              compactMode 
                ? 'theme-toggle-on' 
                : 'theme-toggle'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              compactMode ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
      </div>
    </div>
  )
}
