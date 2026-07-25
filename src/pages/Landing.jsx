import React from 'react'
import { Link } from 'react-router-dom'
import { useDarkStore } from '../store/useDarkStore'

/** Browser-chrome frame around product mocks / screenshots */
function ShotFrame({ children, caption, isDark }) {
  return (
    <figure className="w-full">
      <div
        className={`rounded-xl overflow-hidden border shadow-2xl shadow-black/25 ${
          isDark ? 'border-white/10 bg-[#16141c]' : 'border-light-border bg-white'
        }`}
      >
        <div
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b ${
            isDark ? 'border-white/5 bg-[#1c1a24]' : 'border-light-border bg-light-card'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span
            className={`ml-3 text-[11px] truncate ${
              isDark ? 'text-gray-500' : 'text-light-text-secondary'
            }`}
          >
            kairo.app
          </span>
        </div>
        <div className="relative overflow-hidden">{children}</div>
      </div>
      {caption ? (
        <figcaption
          className={`mt-3 text-center text-xs ${
            isDark ? 'text-gray-500' : 'text-light-text-secondary'
          }`}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

function MockWeekView({ isDark }) {
  const days = ['Mon 24', 'Tue 25', 'Wed 26', 'Thu 27', 'Fri 28']
  const events = [
    { day: 0, top: '18%', h: '14%', label: 'Algorithms', color: 'bg-event-blue/80' },
    { day: 0, top: '42%', h: '12%', label: 'Lab', color: 'bg-event-green/80' },
    { day: 1, top: '28%', h: '16%', label: 'Project sync', color: 'bg-event-pink/80' },
    { day: 2, top: '22%', h: '10%', label: 'Office hours', color: 'bg-event-amber/80' },
    { day: 2, top: '48%', h: '18%', label: 'Workshop', color: 'bg-event-blue/70' },
    { day: 3, top: '34%', h: '12%', label: 'Gym', color: 'bg-event-green/70' },
    { day: 4, top: '20%', h: '22%', label: 'Exam prep', color: 'bg-event-pink/70' },
  ]

  return (
    <div className={`h-[280px] sm:h-[320px] flex flex-col ${isDark ? 'bg-sidebar' : 'bg-main'}`}>
      <div
        className={`flex items-center justify-between px-3 py-2 border-b text-[11px] ${
          isDark ? 'border-white/5 text-gray-400' : 'border-light-border text-light-text-secondary'
        }`}
      >
        <span className="font-medium theme-text-primary text-[12px]">March 2026</span>
        <div className="flex gap-1">
          {['Day', 'Week', 'Month'].map((v, i) => (
            <span
              key={v}
              className={`px-2 py-0.5 rounded-md ${
                i === 1
                  ? 'bg-accent text-white'
                  : isDark
                    ? 'bg-white/5'
                    : 'bg-light-card'
              }`}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        <div
          className={`w-10 shrink-0 flex flex-col justify-between py-2 text-[9px] text-right pr-1.5 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          {['8am', '10', '12', '2pm', '4', '6'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-5 min-w-0">
          {days.map((d, di) => (
            <div
              key={d}
              className={`relative border-l ${
                isDark ? 'border-white/5' : 'border-light-border'
              }`}
            >
              <div
                className={`text-[10px] text-center py-1.5 border-b font-medium ${
                  isDark ? 'border-white/5 text-gray-300' : 'border-light-border text-light-text'
                }`}
              >
                {d}
              </div>
              <div
                className={`absolute inset-x-0 top-7 bottom-0 ${
                  isDark ? 'bg-black/10' : 'bg-black/[0.02]'
                }`}
                style={{
                  backgroundImage: isDark
                    ? 'linear-gradient(to bottom, transparent 24px, rgba(255,255,255,0.04) 25px)'
                    : 'linear-gradient(to bottom, transparent 24px, rgba(0,0,0,0.04) 25px)',
                  backgroundSize: '100% 25px',
                }}
              />
              {events
                .filter((e) => e.day === di)
                .map((e) => (
                  <div
                    key={e.label + e.day}
                    className={`absolute left-0.5 right-0.5 rounded-md px-1 py-0.5 text-[9px] font-medium text-sidebar-deep truncate ${e.color}`}
                    style={{ top: e.top, height: e.h }}
                  >
                    {e.label}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MockChat({ isDark }) {
  const bubbles = [
    { role: 'user', text: 'Add lunch with Sarah tomorrow at 1pm' },
    { role: 'ai', text: 'Done — “Lunch with Sarah” is on Tue 25 Mar, 1:00–2:00pm.' },
    { role: 'user', text: 'What do I have on Friday?' },
    { role: 'ai', text: 'Friday: Exam prep 10am–1pm. Want me to free a slot for something else?' },
  ]

  return (
    <div className={`h-[280px] sm:h-[320px] flex flex-col ${isDark ? 'bg-chat' : 'bg-[#f7f6f3]'}`}>
      <div
        className={`px-4 py-3 border-b text-sm font-medium ${
          isDark ? 'border-white/5 text-white' : 'border-light-border text-light-text'
        }`}
      >
        AI assistant
      </div>
      <div className="flex-1 overflow-hidden px-3 py-3 space-y-2.5">
        {bubbles.map((b, i) => (
          <div
            key={i}
            className={`max-w-[88%] text-[12px] leading-relaxed px-3 py-2 rounded-2xl ${
              b.role === 'user'
                ? isDark
                  ? 'ml-auto bg-chat-msg-user text-gray-100 rounded-br-md'
                  : 'ml-auto bg-accent/15 text-light-text rounded-br-md'
                : isDark
                  ? 'bg-chat-msg-ai text-gray-300 rounded-bl-md'
                  : 'bg-white border border-light-border text-light-text-secondary rounded-bl-md'
            }`}
          >
            {b.text}
          </div>
        ))}
      </div>
      <div className="px-3 pb-3">
        <div
          className={`rounded-xl px-3 py-2.5 text-[12px] ${
            isDark ? 'bg-chat-input text-gray-500' : 'bg-white border border-light-border text-gray-400'
          }`}
        >
          Ask Kairo anything…
        </div>
      </div>
    </div>
  )
}

function MockWhatsApp({ isDark }) {
  const groups = [
    { name: 'CS-3A Official', on: true, n: '12 events this week' },
    { name: 'Project Team', on: true, n: '3 deadlines tracked' },
    { name: 'Hostel Announcements', on: false, n: 'Paused' },
  ]

  return (
    <div className={`h-[280px] sm:h-[320px] flex ${isDark ? 'bg-sidebar' : 'bg-main'}`}>
      <div
        className={`w-[42%] p-4 border-r flex flex-col items-center justify-center gap-3 ${
          isDark ? 'border-white/5 bg-sidebar-card' : 'border-light-border bg-white'
        }`}
      >
        <div
          className={`w-24 h-24 rounded-xl grid grid-cols-5 grid-rows-5 gap-0.5 p-2 ${
            isDark ? 'bg-white' : 'bg-gray-900'
          }`}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-[1px] ${
                [0, 1, 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 23, 24].includes(i)
                  ? isDark
                    ? 'bg-gray-900'
                    : 'bg-white'
                  : 'bg-transparent'
              }`}
            />
          ))}
        </div>
        <p className={`text-[11px] text-center ${isDark ? 'text-gray-400' : 'text-light-text-secondary'}`}>
          Scan to connect WhatsApp
        </p>
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-light-text-secondary'}`}>
          Monitored groups
        </p>
        <div className="space-y-2">
          {groups.map((g) => (
            <div
              key={g.name}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
                isDark ? 'bg-sidebar-card' : 'bg-white border border-light-border'
              }`}
            >
              <div className="min-w-0">
                <p className="text-[12px] font-medium truncate">{g.name}</p>
                <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-light-text-secondary'}`}>
                  {g.n}
                </p>
              </div>
              <span
                className={`shrink-0 w-8 h-4 rounded-full relative ${
                  g.on ? 'bg-accent' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                    g.on ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MockMonthView({ isDark }) {
  const cells = Array.from({ length: 35 }, (_, i) => {
    const day = i - 1
    const inMonth = day >= 1 && day <= 31
    const has = [3, 7, 12, 15, 18, 22, 25, 28].includes(day)
    return { day: inMonth ? day : null, has, today: day === 25 }
  })

  return (
    <div className={`h-[280px] sm:h-[320px] p-4 ${isDark ? 'bg-sidebar' : 'bg-main'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">March 2026</span>
        <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-light-text-secondary'}`}>
          Month view
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={`${d}-${i}`}
            className={`text-center text-[10px] py-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => (
          <div
            key={i}
            className={`aspect-square rounded-md flex flex-col items-center justify-start pt-1 text-[10px] ${
              c.today
                ? 'bg-accent text-white'
                : isDark
                  ? 'bg-sidebar-card text-gray-300'
                  : 'bg-white border border-light-border text-light-text'
            } ${!c.day ? 'opacity-0' : ''}`}
          >
            {c.day}
            {c.has && (
              <span
                className={`mt-auto mb-1 w-1 h-1 rounded-full ${
                  c.today ? 'bg-white' : 'bg-accent'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const modules = [
  {
    id: 'calendar',
    eyebrow: 'Calendar',
    title: 'Week, day, and month — built for real schedules',
    body: 'See your week at a glance, zoom into a single day, or plan the whole month. Drag events to reschedule (15-minute snaps), and sleep hours stay softly grayed out so focus stays on awake time.',
    points: [
      'Day / Week / Month views',
      'Drag-and-drop rescheduling',
      'Custom awake hours',
      'Color-coded event types',
    ],
    Mock: MockWeekView,
    caption: 'Week view with timed events',
  },
  {
    id: 'chat',
    eyebrow: 'AI chat',
    title: 'Talk to your calendar in plain English',
    body: 'Skip forms. Tell Kairo what you need — add lunch, move a meeting, cancel gym, or ask what’s on Friday. The assistant understands natural language and updates the calendar for you.',
    points: [
      '“Add lunch with Sarah at 1pm tomorrow”',
      '“What do I have on Friday?”',
      '“Move my meeting to 3pm”',
      '“Cancel tomorrow’s gym session”',
    ],
    Mock: MockChat,
    caption: 'AI assistant sidebar',
    reverse: true,
  },
  {
    id: 'whatsapp',
    eyebrow: 'WhatsApp',
    title: 'Events extracted from the chats you already live in',
    body: 'College groups bury class changes, deadlines, and postponements in endless messages. Connect WhatsApp with a QR code, pick the groups to watch, and Kairo’s AI pulls schedule-related items into your calendar — including from text, images, and PDFs.',
    points: [
      'QR code session link',
      'Choose which groups to monitor',
      'Text, image & PDF extraction',
      'Keyword relevance filtering',
    ],
    Mock: MockWhatsApp,
    caption: 'WhatsApp bridge & group filters',
  },
  {
    id: 'views',
    eyebrow: 'Overview',
    title: 'Mini calendar, tasks, and the big picture',
    body: 'Jump dates from the sidebar mini calendar, scan upcoming tasks, and switch to month view when you need the bird’s-eye plan. Everything stays in one calm workspace — no app-hopping.',
    points: [
      'Sidebar mini calendar',
      'Upcoming task list',
      'Month overview with dots',
      'Dark & light themes',
    ],
    Mock: MockMonthView,
    caption: 'Month overview',
    reverse: true,
  },
  {
    id: 'sync',
    eyebrow: 'Sync',
    title: 'Real-time everywhere, offline when you need it',
    body: 'Changes sync across devices through Supabase realtime. Edit on your phone, see it on laptop. Lose connectivity and keep working — pending changes catch up when you’re back online.',
    points: [
      'Multi-device realtime sync',
      'Offline-first edits',
      'Conflict-safe updates',
      'Installable PWA',
    ],
    // reuse week mock as visual continuity
    Mock: MockWeekView,
    caption: 'Same calendar, any device',
  },
]

export default function Landing() {
  const { isDark } = useDarkStore()

  const muted = isDark ? 'text-gray-400' : 'text-light-text-secondary'
  const card = isDark
    ? 'bg-sidebar-card/50 border-white/5'
    : 'bg-white/80 border-light-border'

  return (
    <div
      className={`h-full overflow-y-auto ${
        isDark ? 'bg-sidebar-deep text-white' : 'bg-light-bg text-light-text'
      }`}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(152, 128, 204, 0.16), transparent 55%)'
            : 'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(152, 128, 204, 0.12), transparent 55%)',
        }}
        aria-hidden
      />

      <div className="relative min-h-full flex flex-col">
        {/* Nav — single Sign in */}
        <header className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <img src="/icons/icon.svg" alt="" className="w-8 h-8 rounded-lg" width={32} height={32} />
            <span className="font-display text-xl tracking-tight">kairo</span>
          </div>
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-2 rounded-full bg-accent text-white hover:opacity-90 transition-opacity"
          >
            Sign in
          </Link>
        </header>

        <main className="flex-1 w-full">
          {/* Hero */}
          <section className="px-6 sm:px-10 pt-12 sm:pt-16 pb-16 max-w-5xl mx-auto text-center">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.2em] mb-5 ${
                isDark ? 'text-accent-light' : 'text-accent'
              }`}
            >
              AI-powered calendar
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-[3.15rem] leading-[1.12] max-w-2xl mx-auto tracking-tight">
              Your schedule, pulled from the chatter
            </h1>
            <p className={`mt-5 text-base sm:text-lg max-w-xl mx-auto leading-relaxed ${muted}`}>
              Kairo is a calm calendar for students and busy people — WhatsApp extraction, natural-language
              scheduling, and drag-and-drop views in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center min-w-[168px] px-7 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
              >
                Get started
              </Link>
              <a
                href="#modules"
                className={`inline-flex items-center justify-center min-w-[168px] px-7 py-3 rounded-full text-sm font-semibold border transition-colors ${
                  isDark
                    ? 'border-gray-700 text-gray-200 hover:bg-white/5'
                    : 'border-light-border text-light-text hover:bg-white'
                }`}
              >
                See how it works
              </a>
            </div>

            <div className="mt-14 max-w-3xl mx-auto">
              <ShotFrame isDark={isDark} caption="Kairo week view">
                <MockWeekView isDark={isDark} />
              </ShotFrame>
            </div>
          </section>

          {/* Problem strip */}
          <section className={`px-6 sm:px-10 py-12 border-y ${isDark ? 'border-white/5' : 'border-light-border'}`}>
            <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8 text-center sm:text-left">
              {[
                {
                  t: 'Missed deadlines',
                  d: 'Important dates drown in group chat noise.',
                },
                {
                  t: 'Manual entry',
                  d: 'Copying every class and exam into a calendar is tedious.',
                },
                {
                  t: 'Scattered info',
                  d: 'Schedules live across WhatsApp, PDFs, and random texts.',
                },
              ].map((item) => (
                <div key={item.t}>
                  <h2 className="font-medium text-[15px] mb-1.5">{item.t}</h2>
                  <p className={`text-sm leading-relaxed ${muted}`}>{item.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Modules */}
          <section id="modules" className="px-6 sm:px-10 py-20 max-w-5xl mx-auto scroll-mt-8">
            <div className="text-center mb-16">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.18em] mb-3 ${
                  isDark ? 'text-accent-light' : 'text-accent'
                }`}
              >
                Modules
              </p>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
                Everything in one workspace
              </h2>
              <p className={`mt-3 text-sm sm:text-base max-w-md mx-auto ${muted}`}>
                Each piece of Kairo solves a real scheduling headache — here’s what they do.
              </p>
            </div>

            <div className="space-y-20 sm:space-y-28">
              {modules.map((mod) => {
                const Mock = mod.Mock
                return (
                  <article
                    key={mod.id}
                    id={mod.id}
                    className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${
                      mod.reverse ? 'lg:[&>*:first-child]:order-2' : ''
                    }`}
                  >
                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-[0.16em] mb-3 ${
                          isDark ? 'text-accent-light' : 'text-accent'
                        }`}
                      >
                        {mod.eyebrow}
                      </p>
                      <h3 className="font-display text-2xl sm:text-[1.75rem] leading-snug tracking-tight">
                        {mod.title}
                      </h3>
                      <p className={`mt-4 text-[15px] leading-relaxed ${muted}`}>{mod.body}</p>
                      <ul className="mt-6 space-y-2.5">
                        {mod.points.map((p) => (
                          <li key={p} className="flex items-start gap-2.5 text-sm">
                            <span
                              className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                                isDark ? 'bg-accent-light' : 'bg-accent'
                              }`}
                            />
                            <span className={isDark ? 'text-gray-300' : 'text-light-text'}>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <ShotFrame isDark={isDark} caption={mod.caption}>
                      <Mock isDark={isDark} />
                    </ShotFrame>
                  </article>
                )
              })}
            </div>
          </section>

          {/* How it works */}
          <section className={`px-6 sm:px-10 py-16 ${isDark ? 'bg-sidebar/40' : 'bg-white/40'}`}>
            <div className="max-w-5xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-center mb-12">
                How it works
              </h2>
              <ol className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    n: '01',
                    t: 'Create your account',
                    d: 'Sign up with email or Google. Your calendar stays private to your account.',
                  },
                  {
                    n: '02',
                    t: 'Connect WhatsApp (optional)',
                    d: 'Scan a QR code, pick groups, and let AI surface schedule messages automatically.',
                  },
                  {
                    n: '03',
                    t: 'Chat, drag, done',
                    d: 'Add events in natural language or by hand — drag to reschedule anytime.',
                  },
                ].map((step) => (
                  <li key={step.n} className={`rounded-2xl border p-6 ${card}`}>
                    <span
                      className={`text-xs font-semibold tracking-widest ${
                        isDark ? 'text-accent-light' : 'text-accent'
                      }`}
                    >
                      {step.n}
                    </span>
                    <h3 className="mt-3 font-medium text-[15px]">{step.t}</h3>
                    <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{step.d}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Single closing CTA */}
          <section className="px-6 sm:px-10 py-20 max-w-5xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
              Ready to unbury your schedule?
            </h2>
            <p className={`mt-3 text-sm sm:text-base max-w-md mx-auto ${muted}`}>
              Free to try. Open Kairo, connect what you need, and keep deadlines where you can see them.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center justify-center px-8 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get started free
            </Link>
            <p className={`mt-4 text-sm ${muted}`}>
              Already have an account?{' '}
              <Link to="/login" className="text-accent font-medium hover:opacity-80">
                Sign in
              </Link>
            </p>
          </section>
        </main>

        <footer
          className={`px-6 py-8 text-center text-xs border-t ${
            isDark ? 'border-white/5 text-gray-600' : 'border-light-border text-light-text-secondary/70'
          }`}
        >
          kairo · AI-powered calendar
        </footer>
      </div>
    </div>
  )
}
