# OrbitX Platform User Guide

## Getting Started

### 1. Registration

1. Go to the landing page and click **Get Started** or **Create Account**
2. Enter your email (must be valid format)
3. Choose a password (minimum 8 characters)
4. Optionally enter a referral code if you were invited
5. Click **Create Account** — you'll be logged in automatically

### 2. Logging In

1. Click **Sign In** from the landing page or navigate to `/auth/login`
2. Enter your email and password
3. Click **Sign In**
4. Your session persists for 24 hours via secure cookie

### 3. Dashboard Overview

After logging in, the dashboard shows:
- **Total Balance** — your current account balance
- **Total Deposited** — lifetime deposits
- **Total Earned** — profits from investments and bonuses
- **Login Streak** — consecutive daily logins
- **PRO Status** — upgrade button (if Standard) or PRO badge
- **Portfolio Chart** — 30-day growth visualization
- **Investment Plans** — top plan cards with quick-invest link
- **Recent Activity** — latest transactions

## Core Features

### Deposits

1. Navigate to **Deposit** in the sidebar
2. Select a cryptocurrency network (BTC, ETH, USDT, etc.)
3. Copy the deposit address or scan the QR code
4. Send funds from your external wallet
5. Wait for admin confirmation (simulated in dev)

### Withdrawals

1. Navigate to **Withdraw** in the sidebar
2. Enter the amount and wallet address
3. Enter your 4-digit PIN
4. Enter the email confirmation code sent to your email
5. Submit — admin must approve the withdrawal

### Investment Plans

1. From **Dashboard**, click **Invest Now** on any plan card
2. Or navigate to your accounts section in the admin panel
3. Choose from 5 tiers:
   - **Genesis** ($100-$2,500) — 1.5% daily, 12h
   - **Alpha Reserve** ($2,500-$25,000) — 3.5% daily, 24h
   - **Sigma Prime** ($10,000-$100,000) — 6% daily, 48h
   - **Omega Elite** ($50,000-$500,000) — 10% daily, 72h
   - **Titan Vault** ($250,000-$5,000,000) — 15% daily, 120h
4. Investments auto-complete with returns credited to balance

### Live Markets

1. Navigate to **Markets** in the sidebar
2. View real-time candlestick charts for each cryptocurrency
3. Prices update every 10 seconds
4. Search and filter by symbol or name

### Lucky Wheel (Spin)

1. Navigate to **Lucky Wheel**
2. Click **SPIN** to spin the wheel
3. Prizes are determined server-side using probability weights
4. Winnings are credited instantly to your balance
5. Confetti animation on win!

### Points & Rewards

1. **Points Hub** — view your points balance and earn via daily activities
2. **Swap Shop** — redeem points for rewards (USDT, bonuses, etc.)
3. Daily login rewards increase with streak multiplier

### Referral Program

1. Navigate to **Affiliates** in the sidebar
2. Copy your unique referral link
3. Share with friends — you earn a bonus when they register and deposit
4. Track your referrals, earnings, and status on the referrals page

### DApps Hub

1. Navigate to **DApps** in the sidebar
2. Select a wallet provider (MetaMask, Trust Wallet, etc.)
3. Create or import a wallet using your recovery phrase
4. Complete validation within the 40-minute timer
5. Earn 500 points for successful verification

### Server Swaps

1. Navigate to **Server Swaps**
2. View open buy/sell orders from other users
3. Create your own order (specify crypto, quantity, price)
4. Cancel pending orders that you created

### PRO Tier

**Upgrade for $500 to unlock:**
- Enhanced security with PIN-protected withdrawals
- PRO badge displayed in sidebar and dashboard
- Priority support
- Exclusive investment opportunities (coming soon)

To upgrade, click the **Upgrade to PRO** button on your Dashboard.

## Security

- **Password:** Minimum 8 characters, bcrypt-hashed
- **PIN:** 4-digit security PIN, bcrypt-hashed after change
- **Withdrawals:** Require both PIN and email confirmation code
- **JWT:** Tokens expire after 24 hours
- **Session:** HTTP-only secure cookies
- **PRO Users:** Enhanced security protocols active

## Admin Panel

Navigate to `/admin` (admin role required).

### Admin Capabilities

- **Dashboard** — platform-wide stats, growth charts
- **Users** — search, edit balances, suspend/ban, manage KYC
- **Deposits** — view and confirm pending deposits
- **Withdrawals** — approve or reject with fund return
- **Investment Plans** — create, edit, activate/deactivate plans
- **Crypto Networks** — manage network settings, wallet addresses
- **KYC** — review and approve/reject identity documents
- **Payment Methods** — configure available payment options
- **Announcements** — create and broadcast to users
- **Support Tickets** — respond to user inquiries
- **Sessions** — view active user login sessions
- **Swap Items** — manage points shop inventory
- **Platform Settings** — configure all platform parameters

### Admin Credentials (dev)

- Email: `admin@cryptovault.io`
- Password: `supersecretadmin`

## Troubleshooting

**Cannot log in?**
- Verify your email and password
- Check that registration is enabled in Platform Settings
- Clear cookies and try again

**Deposit not showing?**
- Deposits require admin confirmation (simulated)
- Check the Deposits page in admin panel

**Withdrawal pending?**
- Must be approved by an admin
- Ensure PIN and confirmation code are correct
