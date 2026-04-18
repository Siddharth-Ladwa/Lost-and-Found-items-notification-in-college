# 🔍 Lost & Found System

A full-stack web application built with **React + Spring Boot + MySQL (XAMPP)**.

---

## 📁 Project Structure

```
lost-found/
├── database/
│   └── schema.sql          ← Run this first in phpMyAdmin
├── backend/                ← Spring Boot (Maven) — port 8080
│   ├── pom.xml
│   └── src/main/java/com/lostandfound/
│       ├── LostFoundApplication.java
│       ├── config/         SecurityConfig.java, CorsConfig.java
│       ├── entity/         All JPA entities
│       ├── repository/     Spring Data JPA repositories
│       ├── controller/     REST API controllers
│       └── util/           JwtUtil.java
└── frontend/               ← React + Vite — port 3000
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── api/            axios.js
        ├── context/        AuthContext.jsx
        ├── styles/         global.css
        ├── components/     Sidebar, Topbar, ItemCard
        └── pages/          All page components
```

---

## 🚀 Setup & Run

### Step 1 — Database (XAMPP)

1. Start **XAMPP** → Start **Apache** and **MySQL**
2. Open **phpMyAdmin** → `http://localhost/phpmyadmin`
3. Create a new database named `lost_found_db`
4. Select it → click **Import** → choose `database/schema.sql` → click **Go**

---

### Step 2 — Backend (Spring Boot)

> **Requirements:** Java 17+, Maven 3.8+

```bash
cd backend
mvn spring-boot:run
```

Backend runs at → `http://localhost:8080`

**Config file:** `src/main/resources/application.properties`
- Default MySQL user: `root` with no password (XAMPP default)
- If your MySQL has a password, update `spring.datasource.password=`

---

### Step 3 — Frontend (React + Vite)

> **Requirements:** Node.js 18+, npm

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → `http://localhost:3000`

---

## 🔑 Default Admin Login

| Field    | Value                      |
|----------|----------------------------|
| Email    | admin@lostandfound.com     |
| Password | admin123                   |

---

## 🗂️ Features / Modules

| Module          | Description                                              |
|-----------------|----------------------------------------------------------|
| 🏠 Home         | Recent lost/found items, announcements, events preview   |
| 📊 Dashboard    | Stats overview, recent reports, notifications            |
| 📦 Items        | Browse all items with filters (type, category, location) |
| 🔍 Search       | Advanced search with keyword, category, location, type   |
| ➕ Report       | Report lost or found items with image upload             |
| ❌ Lost Items   | Browse only lost item reports                            |
| ✅ Found Items  | Browse only found item reports                           |
| 🔔 Notifications| Real-time notifications for claims and matches           |
| 💬 Messages     | Real-time chat between users                             |
| 👤 Profile      | View and edit user profile                               |
| 📈 Activity     | My reports and claim history                             |
| 🛠 Support      | FAQ and contact support                                  |
| 📝 Feedback     | Submit feedback, suggestions, bug reports                |
| 📢 Announcements| System-wide announcements                               |
| 🎉 Events       | Upcoming and past community events                       |
| ℹ️ About        | How it works, terms, privacy policy                      |
| 🔐 Admin Panel  | User management, item moderation, analytics, content     |

---

## 🌐 API Endpoints Reference

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | /api/auth/register          | Register new user        |
| POST   | /api/auth/login             | Login (returns JWT)      |
| GET    | /api/items                  | List items (with filters)|
| POST   | /api/items                  | Report new item          |
| GET    | /api/items/:id              | Get item detail          |
| PUT    | /api/items/:id              | Update item              |
| DELETE | /api/items/:id              | Delete item              |
| GET    | /api/items/my               | My reported items        |
| GET    | /api/items/stats            | System stats             |
| POST   | /api/claims                 | Submit claim             |
| PUT    | /api/claims/:id/status      | Approve/reject claim     |
| GET    | /api/notifications          | My notifications         |
| PUT    | /api/notifications/read-all | Mark all as read         |
| GET    | /api/messages/chats         | List chat contacts       |
| POST   | /api/messages               | Send message             |
| GET    | /api/profile                | Get my profile           |
| PUT    | /api/profile                | Update profile           |
| GET    | /api/announcements          | Get active announcements |
| GET    | /api/events/upcoming        | Upcoming events          |
| POST   | /api/feedback               | Submit feedback          |
| GET    | /api/admin/dashboard        | Admin stats              |
| GET    | /api/admin/users            | All users (admin only)   |
| DELETE | /api/admin/users/:id        | Delete user (admin only) |

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Axios, React Hot Toast, Lucide Icons
- **Backend:** Spring Boot 3.2, Spring Security, Spring Data JPA, JWT (JJWT)
- **Database:** MySQL 8 via XAMPP
- **Build:** Maven (backend), npm (frontend)
# Lost_and_Found
