# OrbitX Institutional Trading Platform

Enterprise-grade crypto trading and investment platform with automated portfolios, real-time analytics, and institutional security.

## Features

- **Investment Plans** — 5 tiers from Genesis ($100) to Titan Vault ($5M) with daily ROI up to 15%
- **Live Markets** — Real-time price charts with lightweight-charts and 10s polling
- **Deposits & Withdrawals** — Multi-crypto support with PIN + email confirmation security
- **Spin Wheel** — Probability-weighted prize wheel with server-side validation
- **Points & Rewards** — Earn points via daily login, trades, referrals; redeem in Swap Shop
- **Referral Program** — Track referrals, earnings, and milestone bonuses
- **DApps Hub** — Wallet validation with recovery phrase verification
- **Server Swaps** — P2P orderbook for crypto buy/sell orders
- **PRO Tier** — Upgrade for enhanced security, priority support, and exclusive features
- **Admin Panel** — Full CRUD for users, deposits, withdrawals, plans, KYC, announcements
- **KYC Verification** — Document upload and admin review workflow
- **Notifications** — Real-time alerts for deposits, withdrawals, investments
- **Dark/Light Theme** — Persistent theme toggle across sessions

## Quick Start

```bash
# Install dependencies
npm install

# Copy env and configure
cp .env.example .env

# Generate Prisma client and run migrations
npx prisma migrate dev

# Seed the database with demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@cryptovault.io` | `supersecretadmin` |
| User (PRO) | `user1@example.com` | `password123` |
| User | `user2@example.com` | `password123` |

## Deployment

### Build for Production

```bash
npm run build
```

This produces a `dist/` folder with the compiled frontend and a `server.ts` that serves both API and static files.

### Run in Production

```bash
NODE_ENV=production PORT=3000 npx tsx server.ts
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate && npm run build
EXPOSE 3000
CMD ["node", "--import", "tsx", "server.ts"]
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `JWT_SECRET` | _(hardcoded fallback)_ | JWT signing secret — **set a strong secret in production** |

### Database

The app uses SQLite by default (`prisma/dev.db`). For production, switch to PostgreSQL by updating `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run `npx prisma migrate deploy`.

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, motion/react, Recharts, lightweight-charts
- **Backend:** Express.js, Prisma ORM, JWT auth, bcrypt
- **Database:** SQLite (dev) / PostgreSQL (production)
- **Icons:** Lucide React
- **Notifications:** Sonner toast

## License

MIT
