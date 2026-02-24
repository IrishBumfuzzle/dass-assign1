# Fest event manager

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

## Advanced Features

### 1. Tier A Features (Choose 2)

#### 1.1. Hackathon Team Registration

- **Description**: Allows participants to create/join teams via an invite code. Auto-generates tickets for the whole team once the maximum team size is reached. Includes a real-time team chat.
- **Justification**: Felicity prominently features hackathons and team-based events. Enabling team registration directly within the portal enhances the participant's collaborative experience and reduces the administrative burden on organizers. Choosing the QR scanner instead seemed more complex due to handling the camera and instand sending, as well making the dashboard
- **Design Choices & Implementation**:
    - **Data Model**: Implemented a `Team` mongoose schema storing `eventId`, `teamName`, `inviteCode`, and an array of `members`.
    - **Invite Flow**: A unique random `inviteCode` is generated upon team creation. Users enter this code in the frontend (Teams tab) to query and push themselves into the team's `members` logic.
    - **Auto-Ticketing**: Once the team size hits `maxTeamSize` defined by the Event, a backend controller automatically triggers `Ticket.insertMany` and `sendTicketEmail` for all registered members.

#### 1.2. Merchandise Payment Approval Workflow

- **Description**: Participants upload proof of payment (e.g., UPI screenshot) to purchase an event ticket or merchandise. Organizers review the proof and approve/reject it.
- **Justification**: Not that difficult
- **Design Choices & Implementation**:
    - **Base64 Processing**: To remove the need for an external API, payment proofs are collected natively on the frontend via an `<input type="file" />`, instantly read into Base64 format through `FileReader`, and posted natively inside the JSON body to the backend (`express.json({ limit: "50mb" })` was implemented specifically for this).
    - **Workflow**: Tickets are generated in a `Pending` state. Organizers see a list of pending tickets, click to un-collapse the Base64 image in a Modal, and trigger a `PUT` request to update status.
    - **Inventory Management**: Stock decrementation occurs only upon final Organizer Approval.

### 2. Tier B Features (Choose 2)

#### 2.1. Organizer Password Reset Workflow

- **Description**: Organizers request a password reset, which an Admin then approves (providing an auto-generated password) or rejects.
- **Justification**: Not very difficult
- **Design Choices & Implementation**:
    - **Data Model**: A `PasswordResetRequest` collection tracks `organizerId`, `reason`, `status` (Pending/Approved/Rejected), and `adminComments`.
    - **Admin Flow**: Admins have a dedicated Dashboard tab to review incoming reset requests. If approved, `crypto.randomBytes` immediately injects a secure newly-hashed password into the `User` model, and passes the raw string to the Admin's frontend UI to securely give to the organizer.

#### 2.2. Real-time Team Chat

- **Description**: Team members can communicate privately within a live chat interface equipped with Socket.IO, typing indicators, and file-sharing.
- **Justification**: Implementing a real-time team chat was highly synergistic with the Tier A Team Registration feature. It solves the issue of team coordination, bypassing the need for students to create external WhatsApp/Discord groups. The alternative Tier B task (Global Discussion Forum) was bypassed as team-level scoping provides significantly more targeted value and lower spam risk for an event system.
- **Design Choices & Implementation**:
    - **Technology**: Utilized `Socket.IO` connected over the central `http` express server, attaching event listeners natively for `joinTeamRoom`, `sendMessage`, and `typing`.
    - **State Management**: Online statuses are tracked natively inside a backend global `Map()` linking `userId` to `socket.id`.
    - **Content Handlers**: File sharing was explicitly designed around Base64 payloads pushed straight over the Socket layer (`transmitMsg.fileUrl`)-`a technical decision made to avoid handling more APis.

### 3. Tier C Features (Choose 1)

#### 3.1. Bot Protection (CAPTCHA)

- **Description**: Added Google reCAPTCHA v2 verification over unauthenticated, outward-facing endpoints (Login & Registration).
- **Justification**: Easy
- **Design Choices & Implementation**:
    - **Frontend**: Used `react-google-recaptcha` to physically render the "I am not a robot" widget, blocking the "Submit" `<Button />` state until `onChange` fires a token.
    - **Backend**: Overrode the authentication controllers to ingest the `captcha` object, passing it securely inside an `axios.post` backend-to-backend pipeline against Google's `siteverify` API.
    - **Technical note**: I natively injected the standard globally accepted `v2 Test Site Key` into the implementation to allow immediate functionality checkups without needing to expose or configure production API keys.

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
cp .env.example .env
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Seed Credentials

| Role        | Email                            | Password    |
| ----------- | -------------------------------- | ----------- |
| Admin       | admin@felicity.iiit.ac.in        | password123 |
| Organizer   | techclub@felicity.iiit.ac.in     | password123 |
| Organizer 2 | literaryclub@felicity.iiit.ac.in | password123 |
| Participant | student@students.iiit.ac.in      | password123 |
| External    | external@gmail.com               | password123 |
