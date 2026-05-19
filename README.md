<div align="center">

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white" />
<img src="https://img.shields.io/badge/No_Backend-Offline_Ready-4EA94B?style=for-the-badge" />

<br/><br/>

<h1>🦷 DentalCare — Clinic Management System</h1>

<p><b>A modern, fully offline React web app to manage a dental clinic — patients, doctors, appointments, and billing — all in one place. No backend or server required!</b></p>

<a href="https://smart123-12.github.io/dental-clinic-management-system/" target="_blank">
  <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-blue?style=for-the-badge" />
</a>

</div>

---

## 🔐 Demo Login Credentials

> ✅ Click any demo card on the login page to **instantly sign in** — no registration needed!

| Role | Email | Password |
|------|-------|----------|
| 🛡️ **Admin** | `admin@test.com` | `123456` |
| 🩺 **Doctor** | `doctor@test.com` | `123456` |
| 👤 **Patient** | `customer@test.com` | `123456` |

---

## ✨ Features

### 👤 Patient (Customer)
- Signup / Login with any email
- Browse available dentists with specialization & charges
- Book appointment with date, time & problem type
- Cancel upcoming bookings
- View full appointment history with status & total bill

### 🩺 Doctor
- Login to personal dashboard
- View all assigned appointments (filter by status)
- Approve, reject or reschedule appointment requests
- Mark visits complete with treatment notes and charges
- Manage available time slots

### 🛡️ Admin
- Live stats dashboard (patients, doctors, revenue, appointments)
- View & manage all registered users
- Add new users with any role
- View & manage all appointments across the system
- Approve / cancel any appointment

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **Routing** | React Router DOM v7 (HashRouter) |
| **Icons** | Lucide React |
| **Data** | Offline mock API (no backend, no database) |
| **Hosting** | GitHub Pages via GitHub Actions CI/CD |

---

## 🚀 Live Deployment

> 🌐 **Live Site**: [https://smart123-12.github.io/dental-clinic-management-system/](https://smart123-12.github.io/dental-clinic-management-system/)

Deployed automatically on every push to `main` via GitHub Actions → GitHub Pages.

---

## 📁 Project Structure

```
dental-clinic-management-system/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions — auto deploy to Pages
│
└── frontend/                   # React + Vite + Tailwind CSS
    ├── public/
    └── src/
        ├── components/
        │   ├── Navbar.jsx       # Top navigation bar
        │   └── Sidebar.jsx      # Role-based sidebar
        ├── pages/
        │   ├── Login.jsx        # Login + demo quick-cards
        │   ├── Signup.jsx       # Registration page
        │   ├── CustomerDashboard.jsx
        │   ├── DoctorDashboard.jsx
        │   └── AdminDashboard.jsx
        ├── services/
        │   └── api.js           # Offline mock API (no backend!)
        ├── App.jsx              # Routes (HashRouter)
        └── index.css            # Global styles & animations
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+

### 1. Clone the Repo
```bash
git clone https://github.com/Smart123-12/dental-clinic-management-system.git
cd dental-clinic-management-system/frontend
```

### 2. Install & Run
```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — done! No `.env`, no backend, no database needed. 🎉

---

## 🌐 How Deployment Works

1. Push any change to `main` branch
2. GitHub Actions automatically:
   - Installs Node.js 20
   - Runs `npm run build` inside `./frontend`
   - Deploys the `dist/` folder to `gh-pages` branch
3. GitHub Pages serves the site from `gh-pages`

---

## 📝 License

MIT License © 2025 [Smart123-12](https://github.com/Smart123-12)
