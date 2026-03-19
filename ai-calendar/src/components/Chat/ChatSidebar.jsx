import React, { useRef, useEffect, useState } from 'react'
import { useChatStore } from '../../store/useChatStore'
import { useOllama } from './useOllama'

function TypingDots() {
  return (
    <div className="flex gap-1 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dot-bounce" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dot-bounce-2" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dot-bounce-3" />
    </div>
  )
}

function ChatMessage({ msg }) {
  if (msg.role === 'system') {
    return (
      <div className="text-center text-xs text-gray-500 border border-dashed border-white/10 rounded-lg px-3 py-2 leading-relaxed">
        {msg.text}
      </div>
    )
  }
  if (msg.role === 'user') {
    return (
      <div className="self-end max-w-[85%] bg-chat-msg-user text-gray-200 rounded-xl px-3 py-2 text-[12.5px] leading-relaxed animate-fadeUp">
        {msg.text}
      </div>
    )
  }
  return (
    <div className="bg-chat-msg-ai border border-white/5 rounded-xl px-3 py-2 text-[12.5px] leading-relaxed text-gray-300 animate-fadeUp">
      <div className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-1">AI</div>
      <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
    </div>
  )
}

export default function ChatSidebar() {
  const { messages, isTyping, isOnline, model, setModel } = useChatStore()
  const { send } = useOllama()
  const [input, setInput] = useState('')
  const [modelDraft, setModelDraft] = useState(model)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
    setSending(true)
    await send(text)
    setSending(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleTextarea = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  const onlineDot = isOnline === true
    ? 'bg-green-400 shadow-[0_0_6px_#6fcf97]'
    : isOnline === false
    ? 'bg-gray-500'
    : 'bg-yellow-400'

  return (
    <aside className="w-80 min-w-[320px] bg-chat border-l border-white/[0.07] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${onlineDot}`} />
          <span className="text-sm font-medium text-gray-200">AI Assistant</span>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white/[0.07] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 font-mono outline-none focus:border-accent transition-colors"
            value={modelDraft}
            onChange={(e) => setModelDraft(e.target.value)}
            placeholder="model name…"
          />
          <button
            className="bg-accent hover:bg-accent-light transition-colors text-white text-xs rounded-lg px-3 py-1.5 font-medium"
            onClick={() => setModel(modelDraft)}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
        {messages.map((m) => <ChatMessage key={m.id} msg={m} />)}
        {isTyping && (
          <div className="bg-chat-msg-ai border border-white/5 rounded-xl px-3 py-2 animate-fadeUp">
            <TypingDots />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-4 pt-2 flex-shrink-0">
        <div className="flex items-end gap-2 bg-chat-input border border-white/10 rounded-xl px-3 py-2 focus-within:border-accent transition-colors">
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-gray-200 placeholder-gray-500 resize-none min-h-[20px] max-h-24 leading-relaxed font-sans"
            placeholder="Ask about your calendar…"
            value={input}
            onChange={handleTextarea}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className="bg-accent hover:bg-accent-light disabled:bg-white/10 disabled:cursor-not-allowed transition-colors text-white rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm"
            onClick={handleSend}
            disabled={sending || !input.trim()}
          >
            ↑
          </button>
        </div>
        <p className="text-[10.5px] text-gray-600 text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </aside>
  )
}
