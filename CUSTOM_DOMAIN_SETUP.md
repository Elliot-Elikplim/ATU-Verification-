# Custom Local Domain Setup (cpsverify.local)

## Option 1: Edit Windows Hosts File (Simplest)

### Step 1: Edit hosts file as Administrator
```powershell
# Open Notepad as Administrator
notepad C:\Windows\System32\drivers\etc\hosts
```

### Step 2: Add this line at the bottom:
```
10.164.102.196   cpsverify.local
10.164.102.196   cpsverify
```

### Step 3: Save and close

### Step 4: Run your app
```bash
pnpm run start:network
```

**Users can now access:**
- `http://cpsverify.local:3000`
- `http://cpsverify:3000`

---

## Option 2: nginx + Custom Domain (Professional)

### Install nginx:
```powershell
choco install nginx
```

### Create nginx config:
**File:** `C:\tools\nginx\conf\nginx.conf`

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen 80;
        server_name cpsverify cpsverify.local;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### Start services:
```powershell
# Start your Next.js app
pnpm run start:network

# Start nginx (in nginx directory)
cd C:\tools\nginx
nginx.exe
```

### Edit hosts file (each user's computer):
```
10.164.102.196   cpsverify.local
10.164.102.196   cpsverify
```

**Users access:** `http://cpsverify` (no port!)

---

## Option 3: Local DNS Server (Advanced)

For many computers without editing each hosts file.

### Install dnsmasq (Windows alternative: Acrylic DNS):
```powershell
choco install acrylic-dns-proxy
```

### Configure:
1. Open Acrylic DNS Proxy UI
2. Add custom host:
   - Name: `cpsverify.local`
   - IP: `10.164.102.196`

### Set as DNS on user devices:
- WiFi Settings → DNS → `10.164.102.196`

---

## Option 4: Router DNS (Best for Events)

If you control the WiFi router:

1. Login to router admin (usually `192.168.1.1`)
2. Find DNS/DHCP settings
3. Add custom DNS entry:
   - Hostname: `cpsverify`
   - IP: `10.164.102.196`

All users on WiFi can access `http://cpsverify:3000` automatically!

---

## Quick Setup Script (PowerShell - Run as Admin)

Save as `setup-custom-domain.ps1`:

```powershell
# Add to hosts file
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$yourIP = "10.164.102.196"
$entries = @"

# CPS Verify Local Domain
$yourIP   cpsverify.local
$yourIP   cpsverify
"@

Add-Content -Path $hostsPath -Value $entries
Write-Host "✅ Added cpsverify.local to hosts file"

# Allow firewall
New-NetFirewallRule -DisplayName "CPS Verify Web" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
Write-Host "✅ Firewall rule added for port 3000"

Write-Host ""
Write-Host "🚀 Setup complete!"
Write-Host "Run: pnpm run start:network"
Write-Host "Access at: http://cpsverify.local:3000"
```

Run it:
```powershell
# Run as Administrator
powershell -ExecutionPolicy Bypass -File setup-custom-domain.ps1
```

---

## Distributing to Users

### Option A: Manual (each user adds to their hosts file)
Share this with users:

**Windows:**
1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add line: `10.164.102.196   cpsverify.local`
4. Save
5. Visit: `http://cpsverify.local:3000`

**Mac/Linux:**
```bash
sudo nano /etc/hosts
# Add: 10.164.102.196   cpsverify.local
```

### Option B: Batch Script (for Windows users)
Create `add-cpsverify.bat`:

```batch
@echo off
echo Adding cpsverify to hosts file...
echo 10.164.102.196   cpsverify.local >> C:\Windows\System32\drivers\etc\hosts
echo 10.164.102.196   cpsverify >> C:\Windows\System32\drivers\etc\hosts
echo Done! Visit http://cpsverify.local:3000
pause
```

Share this file - users right-click → Run as Administrator

---

## With nginx (No Port Number)

If you set up nginx:

**Users access:** `http://cpsverify` (clean!)

Instead of: `http://cpsverify:3000`

---

## Recommended Setup

**For small group (< 20 people):**
1. Run setup script on your PC
2. Share batch file with users
3. They run it (adds to hosts)
4. Everyone uses `http://cpsverify.local:3000`

**For larger event (campus lab):**
1. Install nginx on your PC
2. Configure router DNS (if possible)
3. Everyone uses `http://cpsverify` (no port!)

---

## Testing

After setup:
```bash
# Test from your PC
ping cpsverify.local

# Should show: Reply from 10.164.102.196
```

Browser test: `http://cpsverify.local:3000`
