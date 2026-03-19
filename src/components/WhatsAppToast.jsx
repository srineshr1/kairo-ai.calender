import React, { useState, useEffect } from 'react'

export default function WhatsAppToast({ events }) {
  const [visible, setVisible] = useState(false)
  const [displayEvent, setDisplayEvent] = useState(null)

  useEffect(() => {
    if (events && events.length > 0) {
      setDisplayEvent(events[0])
      setVisible(true)
      
      const timer = setTimeout(() => {
        setVisible(false)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [events])

  if (!visible || !displayEvent) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
      <div className="bg-white dark:bg-[#1f1d30] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden max-w-sm">
        <div className="bg-[#25D366] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-white font-semibold text-sm">WhatsApp Sync</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Event Added
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {displayEvent.title || 'New event from WhatsApp'}
              </p>
              {displayEvent.sub && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  from {displayEvent.sub}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#252340] px-4 py-2 flex justify-end">
          <button
            onClick={() => setVisible(false)}
            className="text-sm text-[#25D366] hover:text-[#1da851] font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
