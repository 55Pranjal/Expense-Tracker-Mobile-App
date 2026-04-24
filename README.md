# Expense Tracker App

A full-stack, highly secure mobile application built with React Native (Expo) + Node.js + MongoDB.

## Features

- **Dual Tracking**: Seamlessly track both **Incomes** and **Expenses** with automatic total balance calculations.
- **Data Visualization**: Beautiful interactive **Pie Charts** (category breakdown) and **Line Charts** (7-day trends) using `react-native-chart-kit`.
- **Advanced Filtering**: Full-text search and a sleek bottom modal to filter records by specific categories and date ranges.
- **Biometric Security**: Native FaceID / Fingerprint lock screen integration via `expo-local-authentication` to keep your financial data private.
- **Export Data**: One-tap export to generate a **CSV file** of your records and share it natively using `expo-file-system` and `expo-sharing`.
- **Authentication**: JWT-based user authentication (register/login/logout).
- **REST API**: Custom Express.js + MongoDB backend.

---

## Tech Stack

**Frontend**: React Native, Expo, React Navigation, Axios, `react-native-chart-kit`, `expo-local-authentication`, `expo-file-system`, `expo-sharing`, `expo-secure-store`

**Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

---

## Setup & Run

### Prerequisites

- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI
- Expo Go app on your phone (or an emulator/simulator)

### Backend Setup

1. Open a terminal and navigate to the backend directory:
```bash
cd backend
```
2. Create your environment variables file (copy `.env.example` if available, or create a `.env` file) and add:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```
3. Install dependencies and run:
```bash
npm install
npm run dev
# The server will start on http://localhost:5000
```

### Frontend Setup

1. Open a new terminal and navigate to the project root (where the main `package.json` is located).
2. Install the dependencies:
```bash
npm install
```
3. Open `src/services/api.js` and update `BASE_URL` based on your testing environment:
   - **Android emulator**: `http://10.0.2.2:5000/api` (default for Android emulator)
   - **iOS simulator**: `http://localhost:5000/api`
   - **Real physical device**: `http://<your-computer-local-ip>:5000/api`

4. Start the app:
```bash
npx expo start
```
*Note: Because this app uses native modules for biometrics and file sharing, they are fully supported in the standard Expo Go app. However, if you are building a custom development client, you will need to compile the native code by running `npx expo run:android` or `npx expo run:ios` instead.*

---

## API Endpoints

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| GET | `/api/expenses` | List expenses (Supports `?startDate`, `?endDate`, `?category`, `?search`) | Yes |
| POST | `/api/expenses` | Create a new income/expense | Yes |
| PUT | `/api/expenses/:id` | Update an existing record | Yes |
| DELETE | `/api/expenses/:id` | Delete a record | Yes |