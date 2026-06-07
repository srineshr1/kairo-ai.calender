import React, { useRef, useEffect, useState, useId, useCallback } from 'react'
import { useChatStore } from '../../store/useChatStore'
import { useLLM } from './useLLM'
import { useIsMobile } from '../../hooks/useMediaQuery'

const ACCEPTED_FILE_TYPES = 'image/png,image/jpeg,image/jpg,image/webp,application/pdf'
const MAX_FILE_SIZE = 10 * 1024 * 1024

const SUGGESTIONS = [
  { text: "What's on my schedule today?", icon: '📅' },
  { text: 'Create a new event for tomorrow', icon: '✨' },
  { text: 'Find free time this week', icon: '🔍' },
  { text: 'Upload a timetable to import', icon: '📎' },
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1" role="status" aria-label="AI is typing">
      <div className="flex gap-1">
        <span className="w-[6px] h-[6px] rounded-full bg-accent/60 animate-[bounce_1.4s_infinite]" />
        <span className="w-[6px] h-[6px] rounded-full bg-accent/60 animate-[bounce_1.4s_0.2s_infinite]" />
        <span className="w-[6px] h-[6px] rounded-full bg-accent/60 animate-[bounce_1.4s_0.4s_infinite]" />
      </div>
    </div>
  )
}

function FileAttachment({ attachment }) {
  const [imgError, setImgError] = useState(false)

  if (attachment.type === 'image' && !imgError) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden max-w-[200px] border border-white/5">
        <img
          src={attachment.url}
          alt={attachment.name || 'Attached image'}
          className="w-full h-auto object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 max-w-[200px]">
      <svg className="w-4 h-4 text-accent/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span className="text-xs theme-text-secondary truncate">{attachment.name || 'File'}</span>
    </div>
  )
}

function ChatMessage({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end mb-3 animate-fadeUp">
        <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 bg-accent text-white shadow-sm">
          <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
            {msg.text}
          </p>
          {msg.attachments?.map((attachment, idx) => (
            <FileAttachment key={idx} attachment={attachment} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5 mb-3 animate-fadeUp">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0 max-w-[85%]">
        <div className="rounded-2xl rounded-tl-md px-4 py-2.5 chat-ai-bubble">
          <p className="text-[13px] leading-relaxed theme-text-primary break-words whitespace-pre-wrap">
            {msg.text}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ChatSidebar({ onClose, initialMessage }) {
  const { messages, isTyping, isOnline, error, clearError, clearMessages } = useChatStore()
  const { send, isInWizard, resetWizard, startTimetableImport } = useLLM()
  const isMobile = useIsMobile()
  const [input, setInput] = useState(initialMessage || '')
  const [sending, setSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const chatRegionId = useId()
  const prevMessageCountRef = useRef(0)
  const prevTypingRef = useRef(false)
  const isInitialMountRef = useRef(true)

  useEffect(() => {
    if (initialMessage) setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  const handleFileSelect = useCallback((file) => {
    if (!file) return
    if (!ACCEPTED_FILE_TYPES.split(',').includes(file.type)) {
      alert('Please upload an image (PNG, JPG, WebP) or PDF file.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 10MB.')
      return
    }
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setFilePreview(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }, [])

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false) }, [])
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation() }, [])
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  useEffect(() => {
    const currentMessageCount = messages.length
    const messageAdded = currentMessageCount > prevMessageCountRef.current
    const typingStarted = isTyping && !prevTypingRef.current
    if (isInitialMountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' })
      isInitialMountRef.current = false
    } else if (messageAdded || typingStarted) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = currentMessageCount
    prevTypingRef.current = isTyping
  }, [messages, isTyping])

  const handleSend = async () => {
    const text = input.trim()
    if (!text && !selectedFile) return
    if (sending) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setSending(true)
    try {
      if (selectedFile) {
        await startTimetableImport(selectedFile)
        clearSelectedFile()
      } else {
        await send(text)
      }
    } finally {
      setSending(false)
    }
  }

  const handleSuggestionClick = useCallback((text) => {
    if (text === 'Upload a timetable to import') {
      fileInputRef.current?.click()
    } else {
      setInput(text)
      setTimeout(() => {
        textareaRef.current?.focus()
        textareaRef.current?.setSelectionRange(text.length, text.length)
      }, 50)
    }
  }, [])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleTextarea = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px'
  }

  const containerStyle = isMobile
    ? { height: '100%', width: '100%' }
    : { height: '600px', width: '400px', maxHeight: '82vh', maxWidth: '90vw' }

  const showSuggestions = messages.length === 0 && !isInWizard

  return (
    <aside
      className={`flex-shrink-0 flex flex-col overflow-hidden ${
        isMobile ? 'h-full w-full' : 'rounded-2xl shadow-2xl chat-panel border border-white/[0.06]'
      }`}
      role="complementary"
      aria-label="AI chat assistant"
      style={containerStyle}
    >
      {/* Header */}
      <header className="px-4 py-3 border-b border-white/[0.06] flex-shrink-0 flex items-center justify-between chat-header">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/25 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-[13px] theme-text-primary leading-tight">Kairo AI</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                isOnline === true ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                : isOnline === false ? 'bg-gray-500' : 'bg-amber-400 animate-pulse'
              }`} />
              <span className="text-[10px] theme-text-secondary font-medium">
                {isOnline === true ? 'Ready' : isOnline === false ? 'Offline' : 'Connecting'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isInWizard && (
            <button onClick={() => { resetWizard(); clearSelectedFile() }} className="text-[11px] px-2 py-1 rounded-md text-red-400 hover:bg-red-500/10 transition-colors">
              Cancel
            </button>
          )}
          {messages.length > 0 && !isInWizard && (
            <button
              onClick={clearMessages}
              className="p-1.5 rounded-lg theme-icon-btn opacity-60 hover:opacity-100 transition-opacity"
              aria-label="New conversation"
              title="New conversation"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg theme-icon-btn" aria-label="Close chat">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 animate-fadeUp">
          <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[11px] text-red-400 flex-1 leading-snug">{error}</p>
          <button onClick={clearError} className="text-red-400/60 hover:text-red-400 p-0.5" aria-label="Dismiss">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        id={chatRegionId}
        className={`flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 flex flex-col relative custom-scrollbar ${isDragging ? 'ring-2 ring-accent/30 ring-inset' : ''}`}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-accent/5 backdrop-blur-sm z-10 pointer-events-none rounded-lg">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-accent font-medium">Drop timetable here</p>
            </div>
          </div>
        )}

        {showSuggestions && (
          <div className="flex-1 flex flex-col items-center justify-center px-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/20 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold theme-text-primary mb-1">How can I help?</h3>
            <p className="text-[11px] theme-text-secondary mb-6 text-center max-w-[240px]">
              Manage your calendar with natural language or import a timetable
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s.text)}
                  className="suggestion-chip group flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all"
                  style={{ borderColor: 'color-mix(in srgb, var(--theme-border) 60%, transparent)' }}
                >
                  <span className="text-base flex-shrink-0">{s.icon}</span>
                  <span className="text-[11px] theme-text-secondary group-hover:theme-text-primary leading-tight">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => <ChatMessage key={m.id} msg={m} />)}

        {isTyping && (
          <div className="flex gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="rounded-2xl rounded-tl-md px-4 py-3 chat-ai-bubble">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className={`px-3 pt-2 flex-shrink-0 border-t border-white/[0.06] ${isMobile ? 'pb-20' : 'pb-3'}`}
        style={isMobile ? { paddingBottom: 'max(80px, calc(64px + env(safe-area-inset-bottom)))' } : undefined}
      >
        <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleFileInputChange} className="hidden" aria-hidden="true" />

        {selectedFile && (
          <div className="mb-2 p-2 rounded-xl border border-accent/20 bg-accent/5 flex items-center gap-2 animate-fadeUp">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] theme-text-primary truncate font-medium">{selectedFile.name}</p>
              <p className="text-[10px] theme-text-secondary">{(selectedFile.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={clearSelectedFile} className="p-1 rounded hover:bg-red-500/10 text-red-400" aria-label="Remove file">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-xl px-3 py-2 chat-input-container">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8 rounded-lg hover:text-accent hover:bg-accent/10 transition-colors flex items-center justify-center flex-shrink-0 theme-text-secondary disabled:opacity-30"
            disabled={sending || isInWizard}
            aria-label="Attach timetable"
            title="Upload timetable"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <label htmlFor="chat-input" className="sr-only">Message</label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            className="flex-1 bg-transparent border-none outline-none text-[13px] theme-text-primary placeholder:theme-text-secondary placeholder:opacity-50 resize-none min-h-[20px] max-h-28 leading-relaxed"
            placeholder={selectedFile ? "Press send to import..." : "Ask anything..."}
            value={input}
            onChange={handleTextarea}
            onKeyDown={handleKey}
            rows={1}
          />

          <button
            className="h-8 w-8 rounded-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-20"
            style={{
              background: (input.trim() || selectedFile) ? 'var(--color-accent)' : 'transparent',
              color: (input.trim() || selectedFile) ? '#fff' : 'var(--theme-text-secondary)',
              transform: (input.trim() || selectedFile) ? 'scale(1)' : 'scale(0.9)',
            }}
            onClick={handleSend}
            disabled={sending || (!input.trim() && !selectedFile)}
            aria-label={sending ? 'Sending...' : 'Send message'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>

        <p className="text-[9px] text-center mt-1.5 theme-text-secondary opacity-40">
          Powered by Llama 3.3 · May produce inaccurate results
        </p>
      </div>
    </aside>
  )
}
