import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import TopBar from './components/Calendar/TopBar'
import WeekView from './components/Calendar/WeekView'
import DayView from './components/Calendar/DayView'
import MonthView from './components/Calendar/MonthView'
import ChatSidebar from './components/Chat/ChatSidebar'
import EventModal from './components/Modal/EventModal'
import SettingsModal from './components/Modal/SettingsModal'
import WhatsAppSettings from './components/WhatsApp/WhatsAppSettings'
import WhatsAppToast from './components/WhatsAppToast'
import ToastContainer from './components/ToastContainer'
import { useWhatsAppSync } from './hooks/useWhatsAppSync'
import { useNotificationTriggers } from './hooks/useNotificationTriggers'
import { useEventStore } from './store/useEventStore'
import { useDarkStore } from './store/useDarkStore'
import { useSettingsStore } from './store/useSettingsStore'
import { LoadingSkeleton } from './components/LoadingSpinner'

export default function App() {
  const settings = useSettingsStore()
  const [activeView, setActiveView] = useState('Week')
  const [modal, setModal] = useState({ open: false, event: null, date: null, time: null })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [whatsappSettingsOpen, setWhatsappSettingsOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const { events } = useEventStore()
  const { isDark, setIsDark } = useDarkStore()
  const { lastSyncedEvents } = useWhatsAppSync()
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Navigate to day view
  const navigateToDay = (date) => {
    setSelectedDate(date)
    setActiveView('Day')
  }
  
  // Enable notification triggers
  useNotificationTriggers()

  // Apply all settings whenever they change
  useEffect(() => {
    // Apply accent color
    document.documentElement.style.setProperty('--color-accent', settings.accentColor)
    
    // Apply font size
    const fontSizes = { small: '90%', medium: '100%', large: '110%', extraLarge: '120%' }
    document.documentElement.style.fontSize = fontSizes[settings.fontSize]
    
    // Apply compact mode
    document.body.classList.toggle('compact-mode', settings.compactMode)
    
    // Set default view from settings
    setActiveView(settings.defaultView === 'day' ? 'Day' : settings.defaultView === 'month' ? 'Month' : 'Week')
  }, [settings.accentColor, settings.fontSize, settings.compactMode, settings.defaultView])

  // Apply dark mode class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Load test helper in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      import('./test-notifications.js').catch(() => {})
    }
  }, [])

  // Initial loading state (shorter delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const openAdd = (date = null, time = null) =>
    setModal({ open: true, event: null, date, time })

  const openEdit = (ev) => {
    const source = ev._sourceId ? events.find((e) => e.id === ev._sourceId) : ev
    setModal({ open: true, event: source || ev, date: null, time: null })
  }

  const closeModal = () => setModal({ open: false, event: null, date: null, time: null })

  const renderView = () => {
    switch (activeView) {
      case 'Week':
        return (
          <WeekView
            onEventClick={openEdit}
            onSlotClick={(date, time) => openAdd(date, time)}
          />
        )
      case 'Day':
        return (
          <DayView
            onEventClick={openEdit}
            onSlotClick={(date, time) => openAdd(date, time)}
            initialDate={selectedDate}
          />
        )
      case 'Month':
        return (
          <MonthView
            onEventClick={openEdit}
            onSlotClick={(date, time) => openAdd(date, time)}
            onNavigateToDay={navigateToDay}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans ${isDark ? 'bg-sidebar-deep' : 'bg-light-bg'}`}>
      {isInitialLoading ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-6xl">
            <div className="mb-6 h-8 w-48 bg-light-card dark:bg-gray-800 rounded animate-pulse" />
            <LoadingSkeleton rows={8} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-shrink-0">
            <Sidebar onAddEvent={() => openAdd()} />
          </div>

          <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopBar
              activeView={activeView}
              setActiveView={setActiveView}
              onAddEvent={() => openAdd()}
              onWhatsAppSettings={() => setWhatsappSettingsOpen(true)}
              onSettings={() => setSettingsOpen(true)}
            />
            <div className="flex-1 min-w-0 min-h-0 overflow-hidden bg-light-card dark:bg-[#1a1a2e] flex flex-col">
              {renderView()}
            </div>
          </main>

          <div className="flex-shrink-0">
            <ChatSidebar />
          </div>

          <EventModal
            isOpen={modal.open}
            onClose={closeModal}
            editEvent={modal.event}
            defaultDate={modal.date}
            defaultTime={modal.time}
          />

          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />

          <WhatsAppSettings 
            isOpen={whatsappSettingsOpen} 
            onClose={() => setWhatsappSettingsOpen(false)} 
          />

          <WhatsAppToast events={lastSyncedEvents} />
          <ToastContainer />
        </>
      )}
    </div>
  )
}
