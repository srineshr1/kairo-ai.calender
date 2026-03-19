import { useChatStore } from '../../store/useChatStore'
import { useEventStore } from '../../store/useEventStore'
import { fmtDate } from '../../lib/dateUtils'

const genId = () => 'e' + Date.now() + Math.random().toString(36).slice(2, 6)

// Robustly extract the first JSON object from any string
function extractJSON(str) {
  // Try direct parse first
  try { return JSON.parse(str.trim()) } catch {}
  // Strip markdown fences
  const stripped = str.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  try { return JSON.parse(stripped) } catch {}
  // Find first { ... } block
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(stripped.slice(start, end + 1)) } catch {}
  }
  return null
}

export function useOllama() {
  const { model, addMessage, setTyping, setOnline } = useChatStore()
  const { events, addEvent, editEvent, deleteEvent } = useEventStore()

  const send = async (userText) => {
    addMessage({ role: 'user', text: userText })
    setTyping(true)

    const todayStr = fmtDate(new Date())
    const todayEvents = events.filter(e => e.date === todayStr)
    const todaySummary = todayEvents.length
      ? todayEvents.map(e => `- ${e.title} at ${e.time}${e.sub ? ` (${e.sub})` : ''}`).join('\n')
      : 'No events today.'

    // Keep events list compact — only send id, title, date, time, sub
    const compactEvents = events.map(({ id, title, date, time, sub, done, recurrence }) =>
      ({ id, title, date, time, sub, done, recurrence })
    )

    const systemPrompt = `You are a helpful AI calendar assistant. Today is ${todayStr}.

Today's events:
${todaySummary}

All events (compact):
${JSON.stringify(compactEvents)}

YOUR ONLY JOB: Respond with exactly ONE JSON object. Nothing else. No explanation. No preamble. No raw data dumps.

RESPONSE FORMAT — pick one:
{"action":"none","reply":"plain English answer here"}
{"action":"add","event":{"title":"...","date":"YYYY-MM-DD","time":"HH:MM","duration":60,"sub":"...","color":"pink|green|blue|amber|gray","recurrence":"none|daily|weekly|monthly"}}
{"action":"edit","id":"event_id","changes":{"title":"...","date":"...","time":"..."}}
{"action":"delete","id":"event_id"}

EXAMPLES:
User: "what do I have today?"
You: {"action":"none","reply":"You have ${todayEvents.length} event${todayEvents.length !== 1 ? 's' : ''} today: ${todayEvents.map(e => e.title + ' at ' + e.time).join(', ') || 'none'}."}

User: "add a meeting tomorrow at 3pm"
You: {"action":"add","event":{"title":"Meeting","date":"TOMORROW_DATE","time":"15:00","duration":60,"sub":"","color":"blue","recurrence":"none"}}

User: "delete the gym event"
You: {"action":"delete","id":"THE_GYM_EVENT_ID"}

RULES:
- NEVER return raw event arrays or object dumps
- NEVER add explanation outside the JSON
- For schedule questions → action "none" with a friendly plain-English reply
- Infer dates: "tomorrow" = day after ${todayStr}, "Friday" = next Friday, etc.
- Color options: pink, green, blue, amber, gray only`

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `${systemPrompt}\n\nUser: ${userText}\nYou:`,
          stream: false,
          options: { temperature: 0.1 }, // low temp = more deterministic JSON
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const raw = (data.response || '').trim()

      setOnline(true)
      setTyping(false)

      const parsed = extractJSON(raw)

      if (parsed?.action === 'add' && parsed.event) {
        const newEv = { id: genId(), done: false, cancelled: false, recurrenceEnd: '', ...parsed.event }
        if (!newEv.duration) newEv.duration = 60
        if (!newEv.color) newEv.color = 'blue'
        if (!newEv.recurrence) newEv.recurrence = 'none'
        addEvent(newEv)
        addMessage({ role: 'ai', text: `✓ Added "${newEv.title}" on ${newEv.date} at ${newEv.time}.` })
      } else if (parsed?.action === 'edit' && parsed.id) {
        const target = events.find((e) => e.id === parsed.id)
        editEvent(parsed.id, parsed.changes)
        addMessage({ role: 'ai', text: `✓ Updated "${target?.title || 'event'}".` })
      } else if (parsed?.action === 'delete' && parsed.id) {
        const target = events.find((e) => e.id === parsed.id)
        deleteEvent(parsed.id)
        addMessage({ role: 'ai', text: `✓ Deleted "${target?.title || 'event'}".` })
      } else if (parsed?.action === 'none' && parsed.reply) {
        addMessage({ role: 'ai', text: parsed.reply })
      } else if (parsed?.reply) {
        // fallback if action key missing but reply exists
        addMessage({ role: 'ai', text: parsed.reply })
      } else {
        // Last resort: if raw looks like prose not JSON, show it
        const looksLikeProse = raw.length < 500 && !raw.includes('"id":')
        addMessage({ role: 'ai', text: looksLikeProse ? raw : "Sorry, I couldn't understand the response. Try rephrasing." })
      }
    } catch (err) {
      setOnline(false)
      setTyping(false)
      addMessage({
        role: 'ai',
        text: `⚠ Could not reach Ollama.\n\nMake sure it's running:\n  ollama serve\n  ollama pull ${model}\n\nError: ${err.message}`,
      })
    }
  }

  return { send }
}
