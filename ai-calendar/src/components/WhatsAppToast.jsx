import React, { useEffect, useState } from 'react'

export default function WhatsAppToast({ count }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (count > 0) {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(t)
    }
  }, [count])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeUp">
      <div className="flex items-center gap-3 bg-[#1a1820] text-white px-4 py-3 rounded-xl shadow-2xl border border-white/10">
        {/* WhatsApp green dot */}
        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
        <span className="text-[13px] font-medium">
          {count} new event{count > 1 ? 's' : ''} added from WhatsApp
        </span>
        <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
}
