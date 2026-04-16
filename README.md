# Shikor Showpno Fund Dashboard

React dashboard for Shikor Showpno Fund with Tailwind CSS, role-based access, and Firebase Firestore support.

## Features

- Member, Leader, Admin login flow
- Member panel with payment submission, current month status, and history
- Leader panel with pending approvals, summary table, filtering, and totals
- Admin panel to assign leaders and review approved payments
- Dark / Light mode with responsive design
- Firebase Firestore real-time updates for payments

## Setup

1. Install dependencies:

```bash
npm install
```

2. Open `src/firebaseConfig.ts` and add your Firebase configuration.

3. Start the development server:

```bash
npm run dev
```

## Demo accounts

- Member: `member@shikor.com` / `member123`
- Leader: `leader@shikor.com` / `leader123`
- Admin: `admin@shikor.com` / `admin123`

## Notes

- The app uses a local demo login system for role assignment.
- Firestore should have a `payments` collection for payment records.
- Tailwind is configured with `darkMode: 'class'`.
