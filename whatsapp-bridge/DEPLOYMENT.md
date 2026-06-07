# WhatsApp Bridge — Deployment Guide

Deploy the WhatsApp bridge to **AWS EC2** with Docker Compose and Caddy reverse proxy.

## Architecture

```
Internet ──▶ Caddy (:443, TLS) ──▶ Bridge (:3001, Docker)
                 │                       │
            Auto Let's Encrypt      Node.js + Express
            Security headers         whatsapp-web.js
            Request body limits      Puppeteer + Chromium
```

## Prerequisites

1. **AWS Account** with EC2 access
2. **Key pair** (`.pem` file) for SSH
3. **Domain or nip.io** — TLS via Let's Encrypt (nip.io works for bare IPs)

## Step 1 — Launch EC2 Instance

| Setting | Value |
|---------|-------|
| AMI | Ubuntu 22.04 LTS |
| Instance type | **t3.small** (2 GB) recommended; t3.micro (1 GB) works with swap |
| Storage | 20 GB gp3 |
| Security group | Allow: SSH (22) your-IP, HTTP (80) 0.0.0.0/0, HTTPS (443) 0.0.0.0/0 |
| Key pair | Your `.pem` key |

## Step 2 — Install Docker & Caddy

SSH into the instance:

```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
```

Install Docker:

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
```

Install Caddy:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

## Step 3 — Add Swap (if t3.micro)

The 1 GB t3.micro can OOM without swap. Add 4 GB:

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Step 4 — Deploy the Bridge

```bash
# Clone the repo
git clone https://github.com/srineshr1/kairo.git ~/kairo
cd ~/kairo/whatsapp-bridge

# Create .env from example
cp .env.example .env
nano .env   # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, GROQ_API_KEY

# Build and start
docker compose up -d --build
```

Verify:

```bash
curl http://localhost:3001/health
```

## Step 5 — Configure Caddy

Write `/etc/caddy/Caddyfile`:

```caddyfile
18.61.114.31.nip.io {
    header {
        -Server
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    request_body {
        max_size 1MB
    }
    reverse_proxy localhost:3001 {
        flush_interval -1
        transport http {
            dial_timeout 10s
            response_header_timeout 30s
        }
    }
}
```

Replace `18.61.114.31.nip.io` with your instance's public IP (nip.io resolves `<ip>.nip.io` to that IP) or your real domain.

Reload Caddy:

```bash
sudo systemctl reload caddy
```

Caddy auto-obtains a Let's Encrypt certificate on first request.

## Step 6 — Verify

```bash
# Health check via HTTPS
curl https://<your-domain>/health

# Check security headers
curl -sI https://<your-domain>/health | grep -i 'x-frame\|x-content\|referrer\|strict-transport'
```

## Docker Compose Reference

```yaml
services:
  bridge:
    build: .
    container_name: kairo-bridge
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - bridge-sessions:/app/sessions
    environment:
      - NODE_ENV=production
      - BRIDGE_REQUIRE_AUTH=true
      - PORT=3001
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - NODE_OPTIONS=--max-old-space-size=400 --max-semi-space-size=32
    env_file:
      - .env
    mem_limit: 700m
    mem_reservation: 500m
    memswap_limit: 1g
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    healthcheck:
      test: ["CMD-SHELL", "node -e \"const http=require('http'); const port=process.env.PORT||3001; const req=http.get({host:'127.0.0.1',port,path:'/health',timeout:5000},res=>process.exit(res.statusCode===200?0:1)); req.on('error',()=>process.exit(1)); req.on('timeout',()=>{req.destroy();process.exit(1);});\""]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  bridge-sessions:
```

## CI/CD — GitHub Actions

Push to the `BackendChanges` branch to auto-deploy:

```bash
git push origin BackendChanges
```

The workflow (`../.github/workflows/deploy-bridge.yml`) SSHs into EC2 and runs:

```bash
cd ~/kairo && git fetch origin BackendChanges && git reset --hard origin/BackendChanges
cd whatsapp-bridge && docker compose up -d --build
```

## Manual Deploy

```bash
ssh -i aws/kairo-bridge-key.pem ubuntu@18.61.114.31 \
  "cd ~/kairo && git fetch origin BackendChanges && git reset --hard origin/BackendChanges && cd whatsapp-bridge && docker compose up -d --build"
```

## Security Hardening Summary

| Layer | Measure |
|-------|---------|
| OS | 4 GB swap (prevents OOM) |
| OS | Security group restricts SSH to known IPs |
| Container | `mem_limit: 700m`, `memswap_limit: 1g` |
| Node.js | `--max-old-space-size=400` |
| Caddy | Auto-TLS, request body 1 MB max, connection timeouts |
| Caddy | Security headers (HSTS, X-Frame-Options, etc.) |
| App | `BRIDGE_REQUIRE_AUTH=true`, rate limits, X-API-Key validation |
| App | API keys in Supabase (never on disk) |

## Troubleshooting

### Container won't start

```bash
docker logs kairo-bridge
docker compose down && docker compose up -d --build
```

### Caddy can't get TLS certificate

- Port 80 must be open to 0.0.0.0/0 (Let's Encrypt HTTP challenge)
- Check: `sudo journalctl -u caddy --no-pager | tail -20`

### Instance runs out of memory

```bash
free -h                    # check RAM + swap
docker stats kairo-bridge  # container memory
sudo dmesg | grep -i oom   # OOM killer logs
```

If it keeps OOM-ing despite swap, upgrade to t3.small (2 GB RAM).

### WhatsApp sessions lost

Sessions are in the `bridge-sessions` Docker volume. Only lost if you run:

```bash
docker compose down -v   # -v deletes volumes!
```

Normal `docker compose up -d` preserves the volume.

### Health check timeout

On t3.micro, Chromium startup can take 30-60 seconds. The health check has a 60s `start_period` to accommodate this. If it still times out, increase `start_period` in `docker-compose.yml`.

## Updating the Bridge

```bash
# SSH into EC2
cd ~/kairo
git pull origin main           # or your deployment branch
cd whatsapp-bridge
docker compose up -d --build   # rebuilds and restarts
```

Or push to `BackendChanges` for CI/CD auto-deploy.
