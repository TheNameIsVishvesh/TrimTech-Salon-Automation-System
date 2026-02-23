# TrimTech – Salon Automation & Management System

A full-stack web application for Indian salon business: appointments, staff, inventory, billing, analytics, and customer experience.

## Features

- **Public website**: Home, Services, Products, About, Contact (no login required). Booking requires login.
- **Role-based auth**: Client, Employee, Owner with JWT; role-based redirect after login.
- **Client dashboard**: Book appointment (Category → Service → Employee → Date & slot → Confirm & pay), appointment history, cancel/reschedule, feedback & ratings. GST-ready invoice.
- **Employee dashboard**: Daily/weekly schedule, only assigned appointments, status (Available/Busy/Completed), apply leave, performance.
- **Owner dashboard**: System settings (services, pricing ₹, time slots), staff (add/remove, unique IDs, assign services), inventory (products, stock, low stock alerts), reports (daily revenue, monthly bookings, top services, staff performance), database tools (view users/appointments, export CSV).
- **Smart/AI**: Service demand analysis, peak hour detection, time prediction (suggested slot), rule-based FAQ chatbot.
- **UI**: Light/Dark theme switcher (saved in localStorage), ₹ formatting, Indian date (DD-MM-YYYY) and 12-hour time, responsive.

## Tech Stack

- **Frontend**: React 18, React Router 6, Axios, Socket.io-client
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Auth**: JWT, bcrypt

## Project Structure

```
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Header, Footer, Chatbot
│   │   ├── context/       # Auth, Theme
│   │   ├── hooks/         # useSocket
│   │   ├── layouts/       # PublicLayout, DashboardLayout
│   │   ├── pages/         # Home, Services, Products, About, Contact, Login, Register
│   │   └── pages/dashboard/ # Client, Employee, Owner dashboards
│   │   ├── utils/         # format (currency, date, time)
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # db, socket
│   ├── controllers/
│   ├── middleware/         # auth
│   ├── models/            # User, Service, Product, Appointment, TimeSlot, Contact, Leave
│   ├── routes/
│   ├── scripts/           # seed.js
│   └── server.js
├── package.json
└── README.md
```

## Setup & Run

### Prerequisites

- Node.js 18+
- MongoDB running locally (or set `MONGODB_URI` in `server/.env`)

### Install

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### Environment

Copy `server/.env.example` to `server/.env` and set:

- `PORT=5000`
- `MONGODB_URI=mongodb://localhost:27017/trimtech`
- `JWT_SECRET=your-secret-key`

### Seed database (sample data)

```bash
npm run seed
```

This creates services, products, time slots, and sample users:

- **Owner**: email `owner@trimtech.com`, password `owner123`
- **Employees**: `emp1@trimtech.com`, `emp2@trimtech.com` / `emp123`
- **Client**: `client@trimtech.com` / `client123`

### Run locally

**Option 1 – Backend and frontend together (from project root):**

```bash
npm run dev
```

**Option 2 – Separate terminals:**

```bash
# Terminal 1 – backend
npm run server

# Terminal 2 – frontend (from project root)
npm run client
```

- Backend: http://localhost:5000  
- Frontend: http://localhost:3000 (React proxy to API)

### Usage

1. Open http://localhost:3000
2. Browse Home, Services, Products, About, Contact; use the FAQ chatbot (bottom-right).
3. Register or log in (Client / Employee / Owner).
4. After login you are redirected to the correct dashboard.
5. As **Client**: Book appointment, view/cancel appointments, add feedback.
6. As **Employee**: View schedule, update status, apply leave, see performance.
7. As **Owner**: Manage services, slots, staff, inventory, view reports, export CSV.

## API Overview

- `POST /api/auth/register` – Register (name, email, password, role, phone)
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Current user (protected)
- `PATCH /api/auth/me` – Update profile (e.g. employee status)
- `GET/POST/PATCH/DELETE /api/services` – Services (owner for write)
- `GET/POST/PATCH/DELETE /api/products` – Products (owner for write)
- `GET /api/time-slots` – List slots; POST/PATCH/DELETE owner only
- `GET/POST/PATCH /api/appointments` – Appointments (protected); `GET /api/appointments/available-slots?date=&employeeId=`
- `GET/POST/PATCH/DELETE /api/users` – Users (owner); `POST /api/users/employees` – add employee
- `GET /api/reports/dashboard` – Owner: daily revenue, monthly bookings, top services, staff performance
- `GET /api/reports/service-demand` – Service demand analysis
- `GET /api/reports/peak-hours` – Peak hour detection
- `GET /api/reports/time-prediction?date=&employeeId=` – Suggested next slot
- `POST /api/contact` – Contact form; `GET /api/contact` – Owner list messages
- `GET/POST /api/leaves` – Leave requests; `PATCH /api/leaves/:id/status` – Owner approve/reject

Real-time: Socket.io emits `appointment-update` when appointments are created/updated so dashboards can refresh.

## Module Summary

| Module | Description |
|--------|-------------|
| Public site | Home, Services (categories + book CTA), Products (MRP, discount, stock), About (vision, team), Contact (form + map placeholder) |
| Auth | Register/Login with role; JWT; redirect Client → /dashboard/client, Employee → /dashboard/employee, Owner → /dashboard/owner |
| Client dashboard | Multi-step booking, payment simulation, GST invoice, history, cancel, rating/feedback |
| Employee dashboard | Schedule (day/week), status, leave, performance stats |
| Owner dashboard | Services & pricing, time slots, staff (IDs, assign services), inventory & low stock, reports, DB tools & CSV export |
| Smart features | Service demand, peak hours, time prediction API, FAQ chatbot (rule-based) |
| Theme | Light/Dark with localStorage; ₹ and DD-MM-YYYY, 12h time |

---

© TrimTech – Salon Automation & Management System
