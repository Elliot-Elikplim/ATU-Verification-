# Local Network Deployment Guide

## Option 1: Simple Local Network Access (Easiest)

### Run on your local network IP:
```bash
# Find your local IP
ipconfig  # Look for IPv4 Address (e.g., 192.168.1.100)

# Run Next.js on local network
pnpm dev -- -H 0.0.0.0
```

**Users connect to:** `http://192.168.1.100:3000`

**Pros:**
- No extra software needed
- Works immediately on same WiFi/LAN
- Good for small events (10-50 people)

**Cons:**
- Only works on same network
- No HTTPS (insecure over internet)
- Port 3000 must be accessible

---

## Option 2: ngrok (Quick Internet Access)

### Install ngrok:
```bash
# Download from https://ngrok.com
# Or use chocolatey: choco install ngrok

# Run ngrok
ngrok http 3000
```

**Users connect to:** `https://abc123.ngrok.io` (given by ngrok)

**Pros:**
- Works over internet
- Automatic HTTPS
- Easy setup
- Free tier available

**Cons:**
- URL changes each restart (unless paid)
- Free tier has limits
- Requires ngrok running

---

## Option 3: nginx Reverse Proxy (Professional)

### Install nginx:
```bash
# Windows: Download from https://nginx.org/en/download.html
# Or chocolatey: choco install nginx
```

### nginx config (`nginx.conf`):
```nginx
server {
    listen 80;
    server_name 192.168.1.100;  # Your local IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Users connect to:** `http://192.168.1.100`

**Pros:**
- Professional setup
- Hide port 3000
- Can add SSL/HTTPS
- Better performance
- Load balancing possible

**Cons:**
- More complex setup
- Requires nginx knowledge

---

## Option 4: Local Tunnel

### Install localtunnel:
```bash
npm install -g localtunnel

# Run tunnel
lt --port 3000 --subdomain mycps
```

**Users connect to:** `https://mycps.loca.lt`

**Pros:**
- Free
- Custom subdomain (if available)
- No account needed
- HTTPS included

**Cons:**
- Less reliable than ngrok
- May require password on first visit

---

## Option 5: Production Build + PM2 (Best for Local Server)

### Setup:
```bash
# Install PM2
npm install -g pm2

# Build for production
pnpm build

# Start with PM2
pm2 start npm --name "cps-verify" -- start
pm2 startup  # Auto-start on reboot
pm2 save
```

### With nginx:
```nginx
server {
    listen 80;
    server_name 192.168.1.100;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Users connect to:** `http://192.168.1.100`

**Pros:**
- Runs in background
- Auto-restart on crash
- Production performance
- Reliable for events

**Cons:**
- Requires setup
- Local network only (unless port forwarded)

---

## Recommended Setup by Use Case

### 1. Quick Test (Same Room/Office)
```bash
pnpm dev -- -H 0.0.0.0
# Users: http://YOUR_IP:3000
```

### 2. Event with Internet Access
```bash
ngrok http 3000
# Users: https://random.ngrok.io (share this URL)
```

### 3. Campus/Office Network (No Internet)
```bash
pnpm build
pnpm start -- -H 0.0.0.0
# Users: http://YOUR_IP:3000
# OR with nginx: http://YOUR_IP
```

### 4. Permanent Local Server
```bash
# Install nginx + PM2
pnpm build
pm2 start npm --name cps-verify -- start
# Configure nginx
# Users: http://YOUR_IP or http://cps-verify.local
```

---

## Quick Start Commands

Create these scripts in `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:network": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start",
    "start:network": "next start -H 0.0.0.0 -p 3000",
    "pm2:start": "pm2 start npm --name cps-verify -- start",
    "pm2:stop": "pm2 stop cps-verify",
    "pm2:restart": "pm2 restart cps-verify"
  }
}
```

---

## Firewall Configuration (Windows)

Allow port 3000:
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "CPS Verify" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Or use Windows Firewall GUI:
1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Port → TCP 3000
4. Allow the connection

---

## Environment Variables for Local

Update `.env.local`:
```bash
# Use your local IP or localhost
NEXT_PUBLIC_API_ENDPOINT=/api
NEXT_PUBLIC_OFFLINE_MODE=true

# Supabase (keep existing)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Testing Connection

### Find your IP:
```bash
ipconfig
# Look for "IPv4 Address" under your network adapter
# Example: 192.168.1.100
```

### Test from another device:
1. Connect to same WiFi/network
2. Open browser
3. Go to `http://YOUR_IP:3000`
4. Should see verification page

---

## My Recommendation for Your Use Case

**For Campus Event/Lab:**
```bash
# 1. Build production version
pnpm build

# 2. Run on network
pnpm run start:network

# 3. Share with users
"Connect to: http://192.168.1.100:3000"
```

**With nginx (cleaner URL):**
```bash
# Install nginx
choco install nginx

# Configure nginx (see Option 3)
# Start nginx
nginx

# Users connect to: http://192.168.1.100
```

Want me to set up any of these options for you?
