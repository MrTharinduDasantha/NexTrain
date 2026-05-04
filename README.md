# NexTrain: Sri Lanka Railway Reservation System

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/State-Redux_Toolkit-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Framework-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/ODM-Mongoose-880000?logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![Socket.io](https://img.shields.io/badge/Real--time-Socket.io-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Nodemailer](https://img.shields.io/badge/Email-Nodemailer-22B573?logo=minutemailer&logoColor=white)](https://nodemailer.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

NexTrain is a production-grade, full-stack railway reservation system built for Sri Lanka's intercity rail network. The platform delivers a complete end-to-end booking experience — from intelligent train search and live interactive seat maps to secure Stripe-powered checkout, automated e-ticket delivery, and real-time seat-hold synchronization across users. A dedicated admin panel offers full operational control over stations, trains, routes, schedules, fares, coach layouts, bookings, and reporting, all wrapped in a polished dark-mode interface.

---

## 🚀 Demo

Click the link below to see a demonstration of the NexTrain platform.

Link 👉 https://drive.google.com/file/d/1aduYvxCS_HZYREWueKT1DgTw-FblQIPR/view?usp=drive_link 👈

---

## ✨ Features

| Category | Features |
|---|---|
| Public Discovery | Modern landing page with hero search, featured travel classes, and an explorable catalog of all six Sri Lankan train classes (Observation Saloon, 1st AC, 2nd Reserved/Unreserved, 3rd Reserved/Unreserved). |
| Authentication & Profiles | Secure JWT-based auth with HTTP-only cookies. Separate user and admin login flows. Profile management with Cloudinary-hosted profile photo uploads, contact details, and password change. |
| Train Search | Origin/destination autocomplete with full station catalog, journey-date picker, day-of-operation filtering, fare-aware results, and class-level availability counts shown per train. |
| Filter & Sort | Sort results by departure, arrival, duration, or fare; filter by class code; toggle "only available" to hide sold-out trains. |
| Live Seat Map | Interactive seat grids per coach with status colors (available, booked, held by another user, your selection, blocked). Real-time updates via Socket.io rooms — seats taken by other users light up live without a refresh. |
| 10-Minute Seat Hold | Selected seats are reserved server-side for 10 minutes via a TTL-indexed `SeatHold` collection. A visible countdown banner warns the user as the timer approaches expiry, then auto-releases the seats. |
| Passenger Capture | Per-seat passenger forms with live Yup validation (name, age, gender). Passenger data syncs to Redux on every keystroke and is matched 1-to-1 with the held seats. |
| Fare Calculation | Server-computed totals based on class fare, per-km rate, segment distance, configurable reservation charge, and GST. Fare summary card with full breakdown. |
| Stripe Checkout | Hosted Stripe Checkout integration with success/cancel redirects. Stripe webhook (raw-body verified) confirms bookings server-side; a fallback `verify` endpoint covers webhook misfires. |
| E-Tickets & Email | Booking confirmation triggers an automated email with a server-rendered PDF e-ticket attachment (pdfkit). Users can additionally download a quick client-side jsPDF version on demand. |
| My Bookings | Dashboard split into Upcoming and Past tabs with PNR/train/station search, status pills (confirmed, pending, cancelled, failed), and one-click ticket access. |
| Admin Dashboard | Live KPIs (today's bookings, revenue, active trains, seats filled) plus 7-day Recharts visualizations for revenue (area chart) and bookings (bar chart). |
| Network Management | Full CRUD for stations (with codes & cities), trains (with day-of-week operation), and ordered route stops with distance + arrival/departure timing validation. |
| Schedule Management | Per-day train instances. Schedules can be auto-created on first user search or manually managed by admins with status control (scheduled, running, completed, cancelled). |
| Inventory Management | Class catalog with one-click seeder for Sri Lanka's six standard classes. Per-train fare editor with base + per-km rate. Coach layout editor with rows × columns × aisle config and live seat-grid preview. |
| Operations Tools | Filterable bookings table (by PNR, train, status, date range), passenger manifest grouped by coach for any train + journey date, and revenue/occupancy reports with PDF export. |
| Notifications | Real-time success and error feedback powered by React Toastify across the entire app. |

---

## 🛠️ Technologies Used

### Frontend (Client)
* **React 18:** Frontend library for building dynamic user interfaces.
* **Vite:** Lightning-fast dev server and bundler.
* **Tailwind CSS v4:** CSS-first utility framework with custom design tokens for the dark theme.
* **Redux Toolkit & React-Redux:** Predictable state management for auth, search, seats, bookings, and passengers.
* **React Router v7:** Client-side routing with lazy-loaded pages and code splitting.
* **Axios:** HTTP client with interceptors for auth and error handling.
* **Socket.io Client:** Real-time seat-map synchronization.
* **Recharts:** Interactive charts on the admin dashboard.
* **React Hook Form + Yup:** Form state management with schema validation.
* **React Datepicker:** Journey-date picker with dark-theme styling.
* **jsPDF + jsPDF-AutoTable:** Client-side PDF e-ticket generation.
* **Stripe.js:** Browser-side Stripe primitives.
* **React Icons & React Toastify:** Icon library and toast notifications.
* **date-fns:** Date formatting and manipulation.

### Backend (Server) & Database
* **Node.js & Express.js:** Scalable backend runtime and web framework (ES modules).
* **MongoDB & Mongoose:** Document database with rich modeling, populated queries, and TTL indexes for seat holds.
* **Socket.io:** WebSocket server for real-time seat-map updates and seat-hold events.
* **Bcrypt:** Secure password hashing.
* **JSON Web Token (JWT):** HTTP-only cookie-based authentication with admin role guards.
* **Multer:** Middleware for handling multipart/form-data file uploads (memory storage).
* **pdfkit:** Server-side PDF generation for official e-tickets and revenue reports.
* **Helmet, CORS, Morgan, Cookie-parser:** Security and middleware essentials.

### Third-Party Services
* **Stripe:** Hosted Checkout for payments with webhook-verified booking confirmation.
* **Cloudinary:** Cloud storage for user profile photos and train class images.
* **Nodemailer (SMTP):** Transactional emails for booking confirmations with PDF e-ticket attachments.

---

## ⚙️ Installation & Setup

Clone the repository and navigate to the project folder to install dependencies.
```bash
  git clone https://github.com/MrTharinduDasantha/NexTrain.git
  cd NexTrain
```

**1. MongoDB Setup**

Before running the backend, set up your database:
* Sign in to [MongoDB Atlas](https://www.mongodb.com/).
* Create a new cluster and database named `nextrain_db`.
* Whitelist your IP address and create a database user.
* Copy the connection string — you will use it for the `MONGODB_URI` environment variable in the next step.

> ℹ️ The application auto-creates an initial admin account on first login using the credentials defined in the server `.env` file (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). All required collections and indexes are created automatically by Mongoose on first connection.

**2. Cloudinary Setup**

* Sign up at [Cloudinary](https://cloudinary.com/) and grab your account's `CLOUDINARY_URL` from the dashboard.
* This single URL is used by the server for profile photos upload.

**3. Server Deployment to Vercel & Stripe Webhook Setup**

NexTrain's Stripe webhook requires a publicly reachable HTTPS endpoint. The simplest way to obtain one during development is to deploy the server to Vercel for free.

1. Push the project to your GitHub account.
2. Sign in to [Vercel](https://vercel.com/) and import the repository.
3. Set the **Root Directory** to `server` and deploy. You will receive a live URL like `https://your-project.vercel.app`.
4. Open the [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks) and click **Add destination**.
5. Select to the following three events:
   * `checkout.session.completed`
   * `checkout.session.expired`
   * `payment_intent.payment_failed`
6. Select destination type as **Webhook endpoint**
7. Add the **Endpoint URL** `https://your-project.vercel.app/api/stripe/webhook` and **Create destination**.
8. Then copy the **Signing secret** — this is your `STRIPE_WEBHOOK_SECRET`.
9. From [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys), copy your **Secret key** — this is your `STRIPE_SECRET_KEY`.

> ⚠️ Both keys must come from the **same Stripe environment** (test or live). Mixing them will cause webhook verification to fail.

**4. Server Setup (Backend)**

Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

**Environment Variables (Server)**

Create a `.env` file in the `server` folder and add the following configuration:
```bash
# ----- Server -----
PORT = 5000
NODE_ENV = development
CLIENT_URL = http://localhost:5173

# ----- MongoDB -----
MONGODB_URI = "Enter your MongoDB connection string"

# ----- JWT / Auth -----
JWT_SECRET = nextrain_website_secret_key
JWT_EXPIRES_IN = 7d
COOKIE_DOMAIN = localhost

# ----- Admin (auto-created on first login) -----
ADMIN_EMAIL = admin@gmail.com
ADMIN_PASSWORD = Admin123

# ----- Cloudinary -----
CLOUDINARY_URL = "Enter your Cloudinary URL"

# ----- Stripe -----
STRIPE_SECRET_KEY = "Enter your Stripe secret key"
STRIPE_WEBHOOK_SECRET = "Enter your Stripe webhook signing secret"
STRIPE_SUCCESS_URL = http://localhost:5173/payment/success
STRIPE_CANCEL_URL = http://localhost:5173/payment/failure

# ----- Email (SMTP via Nodemailer) -----
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = "Enter your SMTP email"
SMTP_PASS = "Enter your SMTP app password"
SMTP_FROM = "NexTrain <no-reply@nextrain.lk>"

# ----- Pricing rules -----
RESERVATION_CHARGE = 40
GST_PERCENT = 8

# ----- Seat hold (10 minutes) -----
SEAT_HOLD_SECONDS = 600
```

> 📧 For Gmail SMTP, generate an [App Password](https://myaccount.google.com/apppasswords).

**5. Client Setup (Frontend)**

Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

**Environment Variables (Client)**

Create a `.env` file in the `client` folder and add the following configuration:
```bash
VITE_API_URL = "https://your-project.vercel.app"
VITE_SOCKET_URL = "http://localhost:5000"
```

> 💡 Use the live Vercel server URL for `VITE_API_URL` (so Stripe webhooks can reach it) and the local server URL for `VITE_SOCKET_URL` (Socket.io performs best with a direct connection during development).

**6. Run the Application**

Start the backend server:
```bash
cd server
npm run server
```

Start the frontend development server:
```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 💻 Usage

**Admin Workflow:**

1. Visit `/admin/login` and sign in with the credentials from your server `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). The admin account is auto-provisioned on first login.

2. Open the **Dashboard** to view live KPIs and 7-day revenue/bookings analytics.

3. Visit **Classes & Fares** and click **Seed default classes** to load Sri Lanka's six standard train classes (FCO, FAC, SCR, SCU, TCR, TCU).

4. Add **Stations** (with codes and cities) and **Trains** (with name, number, and days of operation).

5. Build **Routes** for each train — ordered list of station stops with arrival/departure times and cumulative distance.

6. Configure per-train **Fares** (base + per-km rate) for each class and define **Coach Layouts** (rows × columns × aisle).

7. Manage **Schedules** to control which trains run on which dates, and post **Bookings** filters or generate **Passenger Lists** and **Reports** as needed.

**User Workflow:**

1. **Register** an account with name, email, password, and an optional profile photo.

2. From the home page, search trains by **From station**, **To station**, and **Journey date** — autocomplete handles station selection.

3. Browse search results, filter/sort as needed, and click a class card to begin booking.

4. **Pick seats** on the live interactive seat map (up to 6 seats). A 10-minute hold begins automatically.

5. Fill in **Passenger details** for each held seat (validated in real time).

6. Review the full **Fare summary** (base + reservation + GST) and click **Pay securely with Stripe**.

7. Complete payment on Stripe's hosted checkout page. On success, you'll be returned to NexTrain with a **confirmed e-ticket** displayed on screen and emailed to you as a PDF.

8. Access **My Bookings** anytime to view upcoming and past trips, search by PNR, and re-download tickets.

---

## 📸 Screenshots

### User Authentication
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%201.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%202.png)

### Public Pages
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%203.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%204.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%205.png)

### Train Search & Results
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%206.png)

### Booking Flow (Seat Map → Passengers → Review → Payment)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%207.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%208.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%209.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2010.png)

### E-Ticket & My Bookings
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2011.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2012.png)

### User Profile & Change Password
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2013.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2014.png)

### Admin Login & Dashboard
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2015.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2016.png)

### Admin — Network Management (Stations, Trains, Routes, Schedules)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2017.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2018.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2019.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2020.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2021.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2022.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2023.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2024.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2025.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2026.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2027.png)

### Admin — Inventory (Classes, Fares, Coach Layouts)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2028.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2029.png)

### Admin — Operations (Bookings, Passenger Lists, Reports)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2030.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2031.png)
![image alt](https://github.com/MrTharinduDasantha/NexTrain/blob/e8ccb1031c3cd1ed493213b01e7221e776cd7bdc/client/src/assets/website-images/Img%20-%2032.png)

<h4 align="center"> Don't forget to leave a star ⭐️ </h4>
