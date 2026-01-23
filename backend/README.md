# PG Monitor Backend API

Production-ready Node.js + Express backend for the PostgreSQL Monitor Dashboard.

## Features

- **Real-time PostgreSQL metrics** from `pg_stat_database`, `pg_stat_activity`, `pg_stat_statements`
- **5 API endpoints** matching dashboard sections (Overview, Performance, Resources, Reliability, Indexes)
- **Connection pooling** with automatic retry and timeout handling
- **CORS enabled** for frontend integration
- **Health check endpoint** for monitoring
- **Production-ready** error handling and logging

## API Endpoints

### GET /health
Health check endpoint
```json
{ "status": "healthy", "timestamp": "2026-01-23T09:00:00.000Z" }
```

### GET /api/overview
Database overview metrics: uptime, QPS, TPS, CPU, query time, operations breakdown

### GET /api/performance/cluster-activity
30-day QPS/TPS time-series chart data

### GET /api/performance/slow-queries
Slow query analysis from pg_stat_statements

### GET /api/resources
Connections, storage usage, cache hit ratio

### GET /api/reliability
Replication status, deadlocks, WAL metrics

### GET /api/indexes
Unused and missing index detection

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your PostgreSQL connection
# DATABASE_URL=postgres://user:pass@host:5432/db

# Start server
npm start

# Development mode with auto-reload
npm run dev
```

## Deployment

### Option 1: AWS EC2 (Recommended)

Deploy in the same VPC as your RDS instance for lowest latency and private traffic.

```bash
# On EC2 instance
git clone <your-repo>
cd pg-monitor-dashboard/backend
npm install --production

# Create .env with RDS endpoint
echo "DATABASE_URL=postgres://pgmonitor:password@your-rds.region.rds.amazonaws.com:5432/postgres" > .env
echo "PORT=4000" >> .env

# Install PM2 for process management
npm install -g pm2
pm2 start src/server.js --name pg-monitor-api
pm2 save
pm2 startup

# Setup nginx reverse proxy (optional)
sudo apt install nginx
# Configure nginx to proxy port 80/443 to 4000
```

### Option 2: Render / Railway

1. Push this repo to GitHub
2. Create new Web Service on Render.com or Railway.app
3. Set environment variable: `DATABASE_URL=postgres://...`
4. Deploy automatically from main branch

## PostgreSQL Setup

### Enable pg_stat_statements

```sql
-- As superuser
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Verify
SELECT * FROM pg_stat_statements LIMIT 1;
```

### Create Read-Only Monitoring User

```sql
CREATE USER pgmonitor WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE postgres TO pgmonitor;
GRANT pg_monitor TO pgmonitor;
GRANT SELECT ON pg_stat_statements TO pgmonitor;
```

## Environment Variables

```bash
DATABASE_URL=postgres://username:password@hostname:5432/database
PORT=4000  # Optional, defaults to 4000
```

## Testing

```bash
# Start the server
npm start

# In another terminal, test endpoints
curl http://localhost:4000/health
curl http://localhost:4000/api/overview
```

## Production Checklist

- [ ] Use read-only monitoring user
- [ ] Enable pg_stat_statements extension
- [ ] Deploy in same VPC as RDS (if using AWS)
- [ ] Use private RDS endpoint (not public)
- [ ] Setup PM2 or systemd for process management
- [ ] Configure nginx reverse proxy with SSL
- [ ] Set up monitoring/alerts for API uptime
- [ ] Limit CORS origins in production

## Dependencies

- `express` - Web framework
- `pg` - PostgreSQL client with connection pooling
- `cors` - CORS middleware
- `dotenv` - Environment variable management

## License

MIT
