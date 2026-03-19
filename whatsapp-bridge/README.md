# 📱 WhatsApp → my.calendar Bridge

Automatically detects exam/class announcements in your college WhatsApp groups and adds them to your calendar.

## Setup

### 1. Install dependencies
```bash
cd whatsapp-bridge
npm install
```

### 2. Add your Gemini API key
Edit `.env`:
```
GEMINI_API_KEY=your_key_from_aistudio.google.com
```

### 3. Add your college group names
Edit `config.js` and add your group names to `WATCHED_GROUPS`:
```js
const WATCHED_GROUPS = [
  'CSE 3-2',        // partial match works
  'Prof. Sharma',
  'JNTUH Notices',
]
```

### 4. Install llava for image analysis (optional but recommended)
```bash
ollama pull llava
```

### 5. Run everything

**Terminal 1 — Calendar app:**
```bash
cd ai-calendar
npm run dev
```

**Terminal 2 — Bridge server (in ai-calendar folder):**
```bash
cd ai-calendar
node bridge-server.js
```

**Terminal 3 — WhatsApp bridge:**
```bash
cd whatsapp-bridge
node index.js
```

### 6. Scan QR code
- Open WhatsApp on your phone
- Go to Linked Devices → Link a Device
- Scan the QR code shown in Terminal 3

## How it works

```
WhatsApp group message (text/image/pdf)
          ↓
whatsapp-bridge filters by group name + keywords
          ↓
Text → Ollama llama3
Image → llava (local) → Gemini Vision (fallback)
PDF → pdf-parse → Ollama llama3
          ↓
Event extracted: { title, date, time, subject }
          ↓
POST → bridge-server (port 3001) → events-queue.json
          ↓
Calendar app polls every 10s → adds events automatically
          ↓
Toast notification: "2 new events added from WhatsApp" ✅
```

## Supported message types
- ✅ Text announcements ("Exam postponed to 25th March")
- ✅ Timetable images (JPG/PNG)
- ✅ PDF timetables
- ✅ Indian date formats (DD/MM/YYYY, "17th March", "next Monday")

## Troubleshooting

**QR code not showing:** Make sure puppeteer installed correctly
```bash
npm install puppeteer
```

**llava not working:** Pull it first
```bash
ollama pull llava
```

**Events not appearing in calendar:** Make sure bridge-server.js is running on port 3001

**WhatsApp session expired:** Delete `.wwebjs_auth` folder and re-scan QR
