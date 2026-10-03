# COMPASS — KJO University Lost & Found Platform

<p align="center">
  <strong>COMPASS</strong> — A full-stack web application for KJO University<br/>
  <em>Helping the university community reconnect lost belongings with their owners</em>
</p>

---

## Overview

COMPASS is a centralized Lost & Found platform built exclusively for **KJO University** students and staff. It allows users to report lost or found items, search and filter listings, submit ownership claims, and track their activity — all through a clean, modern web interface.

---

## Features

### For Students & Staff
- 📋 Report lost items with image upload
- 🎒 Report found items with location details
- 🔍 Search and filter all items by category, location, status, date
- 📄 View item details and possible matches
- 🤝 Submit ownership claims with descriptive messages
- 📊 Dashboard showing personal stats and activity
- 📁 Manage your own reports (edit, delete, mark as resolved)
- 🗂 Track submitted claims and their status

### For Admins
- 📈 Platform statistics overview
- 👥 User management (view, deactivate/reactivate)
- 📦 Moderation of all lost/found reports
- 🗑 Remove inappropriate reports
- 📬 View all claims (pending, approved, rejected)

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React, JavaScript, HTML, CSS            |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB (Mongoose ODM)                  |
| Auth       | JWT (jsonwebtoken) + bcryptjs           |
| File Upload| Multer                                  |
| HTTP Client| Axios                                   |
| Routing    | React Router v6                         |
| Dev Server | Vite                                    |

---

## System Architecture

```
Client (React + Vite :5173)
        │
        │ HTTP (Axios)
        ▼
Server (Node.js + Express :5000)
        │
        │ Mongoose
        ▼
MongoDB (:27017) — compass database
```

---

## User Roles

| Role    | Description                                                  |
|---------|--------------------------------------------------------------|
| STUDENT | Can report, search, claim, and manage their own reports      |
| STAFF   | Same capabilities as STUDENT                                 |
| ADMIN   | Full platform access — user management, moderation, stats    |

---

## Database Schema

### User
```
_id, name, email, password (hashed), role, universityId, isActive, createdAt, updatedAt
```

### Item
```
_id, type (LOST/FOUND), title, category, description, location, date, time,
color, additionalDetails, image, status (ACTIVE/RESOLVED), reportedBy (→ User), createdAt, updatedAt
```

### Claim
```
_id, item (→ Item), claimedBy (→ User), message, status (PENDING/APPROVED/REJECTED), createdAt, updatedAt
```

---

## API Documentation

### Authentication
| Method | Endpoint            | Description              | Auth |
|--------|---------------------|--------------------------|------|
| POST   | /api/auth/register  | Register a new user      | ❌   |
| POST   | /api/auth/login     | Login and get JWT token  | ❌   |
| GET    | /api/auth/me        | Get current user info    | ✅   |

### Items
| Method | Endpoint               | Description                          | Auth |
|--------|------------------------|--------------------------------------|------|
| GET    | /api/items             | List items (search, filter, paginate)| ❌   |
| GET    | /api/items/my          | Get current user's items             | ✅   |
| GET    | /api/items/:id         | Get item by ID + possible matches    | ❌   |
| POST   | /api/items/lost        | Report a lost item (with image)      | ✅   |
| POST   | /api/items/found       | Report a found item (with image)     | ✅   |
| PUT    | /api/items/:id         | Update an item report                | ✅   |
| DELETE | /api/items/:id         | Delete an item report                | ✅   |
| PATCH  | /api/items/:id/resolve | Mark item as resolved                | ✅   |

### Claims
| Method | Endpoint                  | Description                    | Auth |
|--------|---------------------------|--------------------------------|------|
| POST   | /api/claims               | Submit a claim for an item     | ✅   |
| GET    | /api/claims/my            | Get current user's claims      | ✅   |
| GET    | /api/claims/item/:itemId  | Get claims for an item (owner) | ✅   |
| PATCH  | /api/claims/:id/approve   | Approve a claim                | ✅   |
| PATCH  | /api/claims/:id/reject    | Reject a claim                 | ✅   |

### Admin (ADMIN role required)
| Method | Endpoint                       | Description                  |
|--------|--------------------------------|------------------------------|
| GET    | /api/admin/stats               | Platform statistics          |
| GET    | /api/admin/users               | List all users               |
| PATCH  | /api/admin/users/:id/deactivate| Deactivate/reactivate user   |
| GET    | /api/admin/items               | List all items               |
| DELETE | /api/admin/items/:id           | Delete item + its claims     |
| GET    | /api/admin/claims              | List all claims              |

---

## Installation

### Prerequisites
- Node.js v18+
- MongoDB (local) running on port 27017
- npm or yarn

### Clone the repository
```bash
git clone https://github.com/your-username/campus-lost-n-found.git
cd campus-lost-n-found
```

### Install dependencies

**Backend**
```bash
cd server
npm install
```

**Frontend**
```bash
cd client
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` in the `server/` directory:

```bash
cd server
copy .env.example .env
```

Edit `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/compass
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
ADMIN_EMAIL=admin@kjo.edu
ADMIN_PASSWORD=Admin@123456
```

> **Never commit `.env` to git.** It is already in `.gitignore`.

---

## How to Run

### 1. Start MongoDB
Make sure your local MongoDB service is running on port `27017`.

### 2. Seed the admin account (run only once)
```bash
cd server
npm run seed:admin
```

This creates the admin user with credentials from your `.env` file.

### 3. Start the backend
```bash
cd server
npm run dev
```
Backend runs at: `http://localhost:5000`

### 4. Start the frontend
```bash
cd client
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## MongoDB Atlas (Cloud Deployment)

To use MongoDB Atlas instead of local MongoDB:

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user and whitelist your IP
3. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/compass?retryWrites=true&w=majority
   ```
4. Update `MONGO_URI` in `server/.env` with this connection string
5. Deploy backend to Render/Railway and update the `MONGO_URI` environment variable there

---

## Project Structure

```
CAMPUS_LOST_N_FOUND/
├── server/                     # Express backend
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Business logic
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── middleware/             # Auth, role, upload middleware
│   ├── seed/adminSeed.js       # Admin account seeder
│   ├── uploads/                # Uploaded item images
│   ├── .env.example
│   └── server.js
│
└── client/                     # React frontend
    └── src/
        ├── components/         # Reusable components
        ├── pages/              # Page components
        ├── context/            # Auth context
        ├── services/api.js     # Axios instance
        ├── App.jsx             # Router
        └── index.css           # Global styles
```

---

## Future Improvements

- 📧 Email notifications when a claim is approved/rejected
- 🔔 In-app notification system
- 📍 Campus map integration for item location pinning
- 📱 Progressive Web App (PWA) support
- 🔐 Password reset via university email
- 📊 Advanced admin analytics and charts
- 📸 Multiple image uploads per item
- 🌐 Multilingual support

---

## License

MIT License — KJO University COMPASS Platform © 2026
