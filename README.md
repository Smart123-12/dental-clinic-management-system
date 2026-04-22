<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" />
</div>

<br/>

<div align="center">
  <h1>🦷 DentalCare - Clinic Management System</h1>
  <p><b>A full-stack, responsive web application to manage a dental clinic — patients, doctors, appointments, and billing — all in one place.</b></p>

  <a href="https://starlit-sherbet-cb1415.netlify.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀 Live Demo-Netlify-00C7B7?style=for-the-badge" />
  </a>
</div>

## 🔐 Demo Login Credentials

> ✅ These users are **auto-created** when the server starts for the first time on an empty database. No manual setup needed!

| Role | Email | Password |
|------|-------|----------|
| 🛡️ **Admin** | `admin@dentalcare.com` | `Admin@123` |
| 🩺 **Doctor 1** (Orthodontist) | `doctor@dentalcare.com` | `Doctor@123` |
| 🩺 **Doctor 2** (Endodontist) | `doctor2@dentalcare.com` | `Doctor@123` |
| 👤 **Patient** | `patient@dentalcare.com` | `Patient@123` |



### 👤 Patient (Customer)
- Signup / Login
- Browse available dentists with charges
- Book appointment with date, time & problem type
- Cancel bookings
- View full appointment history with status and total bill

### 🩺 Doctor
- Login to personal dashboard
- View all assigned appointments
- Approve or reject appointment requests
- Complete a visit with treatment notes and charges

### 🛡️ Admin
- Dashboard with live stats (patients, doctors, revenue, appointments)
- View all registered users
- View all appointments across the system

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Free Tier) |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs |
| **Frontend Hosting** | Netlify |
| **Backend Hosting** | Render (Free Tier) |

---

## 🚀 Live Deployment

> 🌐 **Frontend**: [https://starlit-sherbet-cb1415.netlify.app](https://starlit-sherbet-cb1415.netlify.app)

---

## 📁 Project Structure

```
dental-clinic/
├── backend/                  # Node.js + Express API
│   ├── middleware/
│   │   └── auth.js           # JWT Auth & Role-based Access
│   ├── models/
│   │   ├── User.js           # User schema (customer/doctor/admin)
│   │   └── Appointment.js    # Appointment schema
│   ├── routes/
│   │   ├── auth.js           # Register & Login routes
│   │   ├── appointments.js   # Book, view, update, cancel
│   │   └── users.js          # Doctors list, manage users
│   ├── server.js             # Main entry point
│   └── package.json
│
└── frontend/                 # React + Vite + Tailwind
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── CustomerDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── services/
    │   │   └── api.js        # Axios instance
    │   ├── App.jsx
    │   └── index.css
    ├── netlify.toml
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free) or local MongoDB

### 1. Clone the Repo
```bash
git clone https://github.com/Smart123-12/dental-clinic.git
cd dental-clinic
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key
PORT=5000
```

Start the backend:
```bash
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

---

## 🌐 Deployment Guide

### Backend → Render (Free)
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo (`Smart123-12/dental-clinic`)
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add **Environment Variables**:
   - `MONGO_URI` → MongoDB Atlas URI
   - `JWT_SECRET` → any secret string

### Frontend → Netlify (Free)
Already deployed! To re-deploy:
```bash
cd frontend
netlify deploy --prod --dir=dist
```

---

## 🔐 Default Test Users

To test the app, register using the Signup page and choose a role:
- **Patient** → Select "Patient" during signup
- **Doctor** → Select "Doctor" during signup
- **Admin** → Must be created manually in MongoDB with `role: "admin"`

---

## 📄 API Endpoints

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/users/doctors` | Public | List all doctors |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/appointments` | Auth | Get appointments |
| POST | `/api/appointments` | Customer | Book appointment |
| PUT | `/api/appointments/:id/status` | Doctor/Admin | Update status |
| DELETE | `/api/appointments/:id` | Customer | Cancel appointment |

---

## 📝 License

MIT License © 2025 [Smart123-12](https://github.com/Smart123-12)
