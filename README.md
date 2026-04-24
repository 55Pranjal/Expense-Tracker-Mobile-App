# Expense Tracker App

A full-stack mobile application built with React Native (Expo) + Node.js + MongoDB.

## Features

- JWT-based user authentication (register/login/logout)
- Add, edit, delete expense records (amount, category, date, note)
- Dashboard with category-wise expense summary and progress bars
- REST API with Express.js + MongoDB
- Loading states, empty states, and form validation throughout

---

## Project Structure

```
expense-tracker/
├── backend/
│   ├── controllers/        # Business logic
│   ├── middleware/          # JWT auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   └── server.js
└── frontend/
    └── src/
        ├── context/        # AuthContext, ExpenseContext (state management)
        ├── navigation/     # React Navigation setup
        ├── screens/        # Auth, Dashboard, Expenses
        └── services/       # Axios API layer
```

---

## Setup & Run

### Prerequisites

- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI
- Expo Go app on your phone (or an emulator)

### Backend

```bash
cd backend
cp .env.example .env       # Fill in your MONGO_URI and JWT_SECRET
npm install
npm run dev                # Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
```

Open `src/services/api.js` and update `BASE_URL`:
- **Android emulator**: `http://10.0.2.2:5000/api` (default)
- **iOS simulator**: `http://localhost:5000/api`
- **Real device**: `http://<your-local-ip>:5000/api`

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/expenses` | List expenses | Yes |
| POST | `/api/expenses` | Create expense | Yes |
| PUT | `/api/expenses/:id` | Update expense | Yes |
| DELETE | `/api/expenses/:id` | Delete expense | Yes |
| GET | `/api/expenses/summary` | Category-wise totals | Yes |

---

## Tech Stack

**Frontend**: React Native, Expo, React Navigation, Axios, Context API, expo-secure-store

**Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs