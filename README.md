# Fest event manager

**Campus Event Management Platform for IIIT Hyderabad's Felicity Fest**

## Technology Stack

| Layer    | Technology            |
| -------- | --------------------- |
| Frontend | Next.js (React), MUI  |
| Backend  | Node.js, Express.js   |
| Database | MongoDB (Mongoose)    |
| Realtime | Socket.IO             |
| Email    | Nodemailer            |
| QR       | qrcode / qrcode.react |
| Auth     | JWT, bcrypt           |

## Features Implemented

### Core Features

- **Authentication & Security** - IIIT email validation, bcrypt hashing, JWT auth, role-based access control, CAPTCHA
- **User Onboarding** - Interest selection + organizer following on registration; editable from profile
- **Event Types** - Normal Events (with custom form builder) and Merchandise Events (with stock management)
- **Event Status Lifecycle** - Draft → Published → Ongoing → Closed with editing rules
- **Browse & Filter** - Keyword search (debounced), type filter, date range, eligibility, followed clubs, trending (Top 5 by 24h registrations), preference-based ordering
- **Registration** - Event registration with deadline/stock checks, QR code generation, email confirmation
- **Dashboard** - Upcoming events, history (Normal/Merchandise/Completed/Cancelled tabs), real QR codes
- **Organizer Dashboard** - Analytics summary (registrations, revenue, attendance, merch sales), event management
- **Admin Dashboard** - Organizer provisioning with auto-generated credentials, password reset management
- **Role-specific Navigation** - Different navbars for Participant, Organizer, and Admin roles
- **Dynamic Form Builder** - Text, number, email, dropdown, checkbox, file upload fields with ordering and lock-after-registration

### Advanced Features

#### Tier A (Choose 2)

1. **Hackathon Team Registration** — Create/join teams via invite code, auto-ticket on team completion, team chat
2. **Merchandise Payment Approval Workflow** — Upload payment proof, organizer approve/reject, stock decrement on approval

#### Tier B (Choose 2)

1. **Organizer Password Reset Workflow** — Request → Admin review → Approve with auto-generated password / Reject
2. **Real-time Team Chat** — Socket.IO-based messaging within teams, typing indicators, online status, file sharing

#### Tier C (Choose 1)

1. **Bot Protection (CAPTCHA)** — Google reCAPTCHA v2 on login and registration pages, server-side verification

### Justification for Advanced Features

- **Hackathon Team Registration**: Essential for Felicity hackathons where collaborative team formation is core to the event experience
- **Merchandise Payment Approval**: Needed for campus merch sales where UPI payments require manual verification before dispatch
- **Organizer Password Reset**: Since organizers can't self-register, a secure admin-mediated reset workflow is necessary
- **Team Chat**: Enables coordination among hackathon team members without leaving the platform
- **CAPTCHA**: Prevents automated abuse of registration and login endpoints

## Project Structure

```
assignment-1/
├── backend/
│   ├── controllers/     # Business logic (auth, events, tickets, teams, admin, users)
│   ├── middleware/       # JWT auth & role-based authorization
│   ├── models/           # Mongoose schemas (User, Event, Ticket, Team, Message, PasswordResetRequest)
│   ├── routes/           # Express route definitions
│   ├── utils/            # Email sender, Discord webhook
│   ├── index.js          # Server entry point with Socket.IO
│   └── seed.js           # Database seeder with sample data
├── frontend/
│   ├── src/app/          # Next.js pages (login, register, dashboard, events, profile, etc.)
│   ├── src/components/   # Reusable components (Navbar, TeamsTab)
│   └── src/types/        # TypeScript interfaces
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure MONGO_URI, JWT_SECRET, RECAPTCHA_SECRET_KEY
npm run seed           # Seed database with sample data
npm run dev            # Start dev server on port 5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Start Next.js dev server on port 3000
```

### Seed Credentials

| Role        | Email                            | Password    |
| ----------- | -------------------------------- | ----------- |
| Admin       | admin@felicity.iiit.ac.in        | password123 |
| Organizer   | techclub@felicity.iiit.ac.in     | password123 |
| Organizer 2 | literaryclub@felicity.iiit.ac.in | password123 |
| Participant | student@students.iiit.ac.in      | password123 |
| External    | external@gmail.com               | password123 |
