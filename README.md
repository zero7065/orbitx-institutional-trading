# OrbitX Institutional Trading Platform

## Platform Overview

OrbitX is a comprehensive institutional-grade trading platform with full admin control, investment plans, crypto wallet management, and premium trading bots. This platform supports both virtual and real money trading simulation.

---

## 🔐 Login Credentials

### Admin Account (Full Access)
```
Email: admin@cryptovault.io
Password: supersecretadmin
```

### Test User Account
```
Email: user1@example.com
Password: password123
PIN: 1234
```

---

## 🌐 Accessing the Platform

1. **Development Mode:**
   ```bash
   cd orbitx-institutional-trading
   npm run dev
   ```
   Then open: http://localhost:3000

2. **Production Mode:**
   ```bash
   npm run build
   npx tsx server.ts
   ```
   Then open: http://localhost:3000

3. **Quick Start:**
   - Double-click `start.bat` in the project folder

---

## 📱 Navigation Guide

### User Dashboard
- **Dashboard** - Overview, portfolio stats, recent activity
- **Markets** - Live crypto prices and charts
- **Deposit** - Add funds via crypto or payment methods
- **Withdraw** - Request withdrawals with PIN verification
- **History** - Complete transaction history
- **Affiliates** - Referral program
- **Lucky Wheel** - Spin to win rewards
- **Incentives** - Bonuses and rewards
- **Settings** - Profile, security, theme toggle

### Admin Dashboard (/admin)
Access via the Nexus Terminal link in the sidebar when logged in as admin.

#### Admin Sections:
1. **Dashboard** - Platform stats, quick actions
2. **Users** - Manage all users, add/remove funds, reset PIN/password, suspend/ban
3. **Crypto Networks** - Add/edit wallet addresses for BTC, ETH, USDT, etc.
4. **Deposits** - View and approve deposits
5. **Withdrawals** - Approve/reject withdrawal requests
6. **Investment Plans** - Create custom plans with ROI settings
7. **All Investments** - View and manage user investments
8. **KYC Reviews** - Verify user identity documents
9. **Support Tickets** - Handle user support requests
10. **Announcements** - Create broadcasts to all users
11. **Platform Settings** - Customize platform name, colors, fees, features

---

## 🔧 Admin Controls

### User Management
- ✅ Add funds to any user account
- ✅ Remove/lock funds from any account
- ✅ Reset user PIN
- ✅ Reset user password
- ✅ Suspend/Ban users
- ✅ View full user details and transactions

### Platform Customization (No Code Required)
- Change platform name (edits title, logo, branding everywhere)
- Change primary/secondary colors
- Enable/disable features:
  - Registration
  - Maintenance mode
  - KYC requirement
  - Spin wheel
  - Trading
  - Investments
- Set deposit/withdrawal limits
- Set fee percentages
- Configure referral bonuses

### Crypto Network Management
- Add new cryptocurrencies (BTC, ETH, USDT, etc.)
- Input real wallet addresses for deposits
- Set minimum deposits/withdrawals
- Configure network fees
- Enable/disable deposit/withdrawal per crypto

### Investment Plans
- Create custom plans with:
  - Custom ROI percentages
  - Duration (hours/days)
  - Min/max investment amounts
  - Featured status
- Edit existing plans
- Activate/deactivate plans

---

## 🎨 Features

### Dark/Light Mode
Toggle between dark and light themes in Settings > Terminal UI

### Markets
View live crypto prices with charts. Click on prices to see more details.

### Lucky Wheel
Spin to win various rewards! Configured by admin in Platform Settings.

### KYC (Know Your Identity)
- Compulsory for all users
- Upload ID document and selfie
- Admin reviews and approves/rejects

### Support System
- Users can submit support tickets
- Admin can view and respond to tickets

### Premium Trading Bots
Rent trading bots with different price tiers:
- **Basic Bot** - $300/month - 5% daily profit
- **Pro Bot** - $500/month - 10% daily profit  
- **Premium Bot** - $1000/month - 20% daily profit

### Token/Crypto Purchase
Users can purchase tokens via:
- Credit/Debit Card
- Bank Transfer
- Crypto deposit

### Toast Notifications
Live notifications showing user activities:
- New deposits
- Withdrawals
- Investments
- Achievements
- Warnings

### Security Features
- Google Authentication option
- Password recovery via email
- PIN verification for withdrawals
- Session management

---

## 📋 Database Models

The platform uses SQLite via Prisma with the following key models:
- Users (with admin control)
- CryptoNetworks
- InvestmentPlans
- Investments
- Deposits/Withdrawals
- Transactions
- Notifications
- Announcements
- SupportTickets
- PlatformSettings

---

## 🔒 Security Warnings Displayed

- "Never share your login credentials with anyone"
- "Keep your PIN secure - never disclose it"
- "Beware of phishing - verify URLs"
- "Your data is encrypted and secure"
- "Enable 2FA for extra security"

---

## 🌐 PWA Install

Users can install the app as a standalone application:
- Click "Install App" in Settings
- Works on mobile and desktop
- Offline capable after first load

---

## 📧 Password Recovery

Users can recover their password:
1. Click "Forgot Password" on login
2. Enter email address
3. Receive recovery link (simulated in demo)
4. Reset password

---

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, TypeScript
- **Backend:** Express.js, Prisma, SQLite
- **Authentication:** JWT, bcrypt
- **Charts:** Recharts, Lightweight Charts

---

## 📞 Support

For issues or questions:
- Use the Support Ticket system in the dashboard
- Contact admin via admin@cryptovault.io

---

*Platform Version: 2.0*
*Last Updated: May 2026*