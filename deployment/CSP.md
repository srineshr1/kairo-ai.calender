# CSP Configuration

Content Security Policy should be configured at the server/CDN level for production. The meta tag in `index.html` is for development only.

## Required CSP Headers

### Connect Sources
- `https://*.supabase.co` - Supabase authentication
- `wss://*.supabase.co` - Supabase real-time
- `https://accounts.google.com` - Google OAuth
- `https://api.groq.com` - Groq AI (if not using bridge proxy)
- `http://kairo.srinesh.in:3001` - WhatsApp bridge

### Script Sources
- `'self'` - Same origin scripts
- `'unsafe-inline'` - Required for Vite HMR
- `'unsafe-eval'` - Required for React dev build

### Style Sources
- `'self'` - Same origin styles
- `'unsafe-inline'` - Required for Tailwind
- `https://fonts.googleapis.com` - Google Fonts

### Font Sources
- `https://fonts.gstatic.com` - Google Fonts static files

## Nginx Example

```nginx
server {
    # ... other config ...
    
    # CSP Header
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://api.groq.com http://kairo.srinesh.in:3001 ws://kairo.srinesh.in:3001; img-src 'self' data: blob:; base-uri 'self'; form-action 'self';" always;
}
```

## Vercel (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://api.groq.com http://kairo.srinesh.in:3001 ws://kairo.srinesh.in:3001; img-src 'self' data: blob:; base-uri 'self'; form-action 'self';"
        }
      ]
    }
  ]
}
```

## Cloudflare (Page Rules)

Add a header rule with:
- **Custom headers**: `Content-Security-Policy` = the CSP string above

## Apache (.htaccess)

```apache
<IfModule mod_headers.c>
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://api.groq.com http://kairo.srinesh.in:3001 ws://kairo.srinesh.in:3001; img-src 'self' data: blob:; base-uri 'self'; form-action 'self';"
</IfModule>
```

## Bridge Server CSP

The WhatsApp bridge (`whatsapp-bridge/`) should have CORS configured. Already set in `bridge-server.js`:
- `https://kairo.srinesh.in` is in allowedOrigins
