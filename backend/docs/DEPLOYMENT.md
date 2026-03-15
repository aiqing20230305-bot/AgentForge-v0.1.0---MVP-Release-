# AgentForge Backend Deployment Guide

Complete guide for deploying AgentForge backend to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Deployment](#local-deployment)
3. [Production Deployment](#production-deployment)
4. [MongoDB Setup](#mongodb-setup)
5. [Environment Variables](#environment-variables)
6. [Process Management](#process-management)
7. [Nginx Configuration](#nginx-configuration)
8. [SSL/HTTPS Setup](#sslhttps-setup)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6.0+
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

---

## Local Deployment

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Generate Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

### 4. Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

### 5. Build and Run

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

### 6. Test API

```bash
# Health check
curl http://localhost:3001/health

# Run full test suite
./test-api.sh
```

---

## Production Deployment

### Option 1: VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
# See MongoDB Setup section below

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 2. Clone and Setup

```bash
# Create app directory
sudo mkdir -p /var/www/agentforge-backend
sudo chown $USER:$USER /var/www/agentforge-backend

# Clone repository
cd /var/www/agentforge-backend
git clone <your-repo-url> .

# Install dependencies
cd backend
npm ci --production
```

#### 3. Configure Environment

```bash
# Create production .env
nano .env
```

**Production .env:**
```env
NODE_ENV=production
PORT=3001

MONGODB_URI=mongodb://localhost:27017/agentforge

# Strong secrets (use openssl rand -base64 32)
JWT_SECRET=<your_production_secret>
JWT_REFRESH_SECRET=<your_production_refresh_secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Your production frontend URLs
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

#### 4. Build Application

```bash
npm run build
```

#### 5. Start with PM2

```bash
# Start application
pm2 start dist/index.js --name agentforge-backend

# Configure auto-restart on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs agentforge-backend
```

---

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/index.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - MONGODB_URI=mongodb://mongodb:27017/agentforge
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

#### 3. Deploy with Docker

```bash
# Create .env file for Docker Compose
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)" >> .env
echo "CORS_ORIGIN=https://yourdomain.com" >> .env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## MongoDB Setup

### Option 1: Local MongoDB

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Add database user
4. Whitelist your server IP
5. Get connection string
6. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agentforge?retryWrites=true&w=majority
   ```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/agentforge` |
| `JWT_SECRET` | JWT access token secret | (generate with openssl) |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | (generate with openssl) |
| `CORS_ORIGIN` | Allowed frontend origins | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` |
| `MONGODB_TEST_URI` | Test database URI | (local test db) |

---

## Process Management

### PM2 Commands

```bash
# Start
pm2 start dist/index.js --name agentforge-backend

# Stop
pm2 stop agentforge-backend

# Restart
pm2 restart agentforge-backend

# Delete
pm2 delete agentforge-backend

# View logs
pm2 logs agentforge-backend
pm2 logs agentforge-backend --lines 100

# Monitor
pm2 monit

# List all processes
pm2 list

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

### PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'agentforge-backend',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

Start with: `pm2 start ecosystem.config.js`

---

## Nginx Configuration

### 1. Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/agentforge-backend
```

### 2. Configuration File

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API proxy
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/agentforge-backend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

---

## Monitoring

### 1. PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View metrics
pm2 describe agentforge-backend

# Install PM2 web dashboard
pm2 install pm2-server-monit
```

### 2. Log Rotation

```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 3. System Monitoring

```bash
# Install htop
sudo apt install htop

# Monitor resources
htop

# Check disk usage
df -h

# Check MongoDB status
sudo systemctl status mongod
```

---

## Troubleshooting

### Server Won't Start

```bash
# Check logs
pm2 logs agentforge-backend --lines 50

# Check port availability
sudo lsof -i :3001

# Verify MongoDB connection
mongosh
```

### MongoDB Connection Errors

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### JWT Errors

```bash
# Verify .env file exists
cat .env | grep JWT

# Regenerate secrets
openssl rand -base64 32

# Restart server after updating
pm2 restart agentforge-backend
```

### High Memory Usage

```bash
# Check memory usage
free -h
pm2 describe agentforge-backend

# Restart with memory limit
pm2 restart agentforge-backend --max-memory-restart 500M
```

### CORS Errors

```bash
# Check CORS_ORIGIN in .env
cat .env | grep CORS_ORIGIN

# Update CORS origins
echo "CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com" >> .env

# Restart server
pm2 restart agentforge-backend
```

---

## Security Checklist

- [ ] Use strong JWT secrets (32+ random characters)
- [ ] Set `NODE_ENV=production` in production
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (ufw/iptables)
- [ ] Set up MongoDB authentication
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable rate limiting (TODO: add express-rate-limit)
- [ ] Regular security updates (`sudo apt update && sudo apt upgrade`)
- [ ] Monitor logs for suspicious activity
- [ ] Backup MongoDB regularly

---

## Performance Optimization

### PM2 Cluster Mode

```bash
# Run multiple instances
pm2 start dist/index.js -i max --name agentforge-backend
```

### MongoDB Indexes

Already configured in models. Verify:

```javascript
// In MongoDB shell
use agentforge
db.agents.getIndexes()
db.tasks.getIndexes()
db.teams.getIndexes()
db.users.getIndexes()
```

### Nginx Caching

Add to Nginx config:

```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Backup and Recovery

### MongoDB Backup

```bash
# Create backup directory
mkdir -p /var/backups/mongodb

# Backup database
mongodump --db agentforge --out /var/backups/mongodb/$(date +%Y%m%d)

# Automated daily backups (cron)
echo "0 2 * * * mongodump --db agentforge --out /var/backups/mongodb/\$(date +\%Y\%m\%d)" | crontab -
```

### Restore MongoDB

```bash
# Restore from backup
mongorestore --db agentforge /var/backups/mongodb/20260315/agentforge
```

---

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Nginx upstream configuration
2. **Redis Adapter**: For Socket.io multi-instance support
3. **MongoDB Replica Set**: For high availability

### Vertical Scaling

```bash
# Increase PM2 instances
pm2 scale agentforge-backend +2

# Decrease instances
pm2 scale agentforge-backend -1
```

---

For more help, see:
- [README.md](../README.md)
- [API Documentation](./API.md)
- [Socket.io Guide](./SOCKET_IO.md)
