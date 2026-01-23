# pg-monitor-dashboard

React + Vite based PostgreSQL monitoring dashboard with live metrics and rich charts.

## Backend API

This dashboard is designed to work with a Node.js + Express backend that exposes real PostgreSQL metrics via REST APIs.

### Features

- **Production-ready** Express server with connection pooling
- **5 API endpoints** matching dashboard sections:
  - `/api/overview` - Database uptime, QPS, TPS, CPU, query time
  - `/api/performance/cluster-activity` - 30-day QPS/TPS time-series
  - `/api/performance/slow-queries` - Slow query analysis
  - `/api/resources` - Connections, storage, cache hit ratio
  - `/api/reliability` - Replication status, deadlocks, WAL metrics
  - `/api/indexes` - Unused/missing index detection
- **Real-time data** from `pg_stat_database`, `pg_stat_activity`, `pg_stat_statements`
- **CORS enabled** for frontend integration

### Quick Start

```bash
cd backend
npm install

# Configure database connection
cp .env.example .env
# Edit .env: DATABASE_URL=postgres://user:pass@host:5432/db

npm start
```

See [`backend/README.md`](./backend/README.md) for full documentation, deployment options (AWS EC2, Render, Railway), and PostgreSQL setup.

### Frontend Configuration

To connect the dashboard to your backend:

**Local Development:**
```bash
echo "VITE_API_BASE_URL=http://localhost:4000" > .env
npm run dev
```

**Production (Vercel):**
- Go to Project Settings → Environment Variables
- Add: `VITE_API_BASE_URL = https://your-backend-url.com`
- Redeploy

The dashboard will:
- Auto-refresh metrics every 15 seconds
- Show loading and error states
- Display real-time PostgreSQL data
