/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#201e27',
        'sidebar-deep': '#1a1820',
        'sidebar-card': '#252330',
        'sidebar-hover': '#2d2b3a',
        chat: '#1e1c2a',
        'chat-msg-user': '#2e2b3e',
        'chat-msg-ai': '#252233',
        'chat-input': '#2a2838',
        accent: '#9880cc',
        'accent-light': '#c8b8e8',
        main: '#f5f4f0',
        // Richer, more visible event colors
        'event-pink':  '#e8c8f0',  // deeper lavender-pink
        'event-green': '#b8e8cc',  // deeper mint green
        'event-blue':  '#b8d4f0',  // deeper sky blue
        'event-amber': '#f0d8a0',  // deeper warm amber
        'event-gray':  '#d8d8d8',  // deeper gray
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"DM Serif Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
