import React from 'react'
import { useToastStore } from '../store/useToastStore'

const toastStyles = {
  success: {
    bg: 'bg-green-500',
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
      </svg>
    )
  },
  error: {
    bg: 'bg-red-500',
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
      </svg>
    )
  },
  warning: {
    bg: 'bg-amber-500',
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
      </svg>
    )
  },
  info: {
    bg: 'bg-blue-500',
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
      </svg>
    )
  }
}

function ToastItem({ toast }) {
  const { removeToast } = useToastStore()
  const style = toastStyles[toast.type] || toastStyles.info

  return (
    <div className="animate-slideUp mb-2">
      <div className="bg-white dark:bg-[#1f1d30] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden max-w-sm">
        <div className={`${style.bg} px-4 py-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {style.icon}
            <span className="text-white font-semibold text-sm">{toast.title}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {toast.message}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-[#252340] px-4 py-2 flex justify-end">
          <button
            onClick={() => removeToast(toast.id)}
            className={`text-sm font-medium transition-colors ${
              toast.type === 'error' 
                ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500' 
                : 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500'
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
