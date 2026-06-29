# 🛵 Feasto — Full-Stack Food Delivery Platform

A production-style, microservices-based food ordering and delivery platform with real-time tracking, multi-role dashboards, and dual payment gateways — built to mirror how modern apps like Swiggy and Zomato are architected.

<div align="center">
  <a href="https://getfeasto.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-brightgreen?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>&nbsp;
  <a href="https://santhosh-vs-portfolio.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🌐%20Portfolio-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" />
  </a>&nbsp;
  <a href="https://github.com/Itssanthoshhere" target="_blank">
    <img src="https://img.shields.io/badge/%20GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</div>

---

## 📋 Table of Contents

- [🛵 Feasto — Full-Stack Food Delivery Platform](#-feasto--full-stack-food-delivery-platform)
  - [📋 Table of Contents](#-table-of-contents)
  - [📖 About The Project](#-about-the-project)
  - [✨ Features](#-features)
    - [🔐 Authentication \& Roles](#-authentication--roles)
    - [🛒 Customer Experience](#-customer-experience)
    - [🏪 Restaurant (Seller) Dashboard](#-restaurant-seller-dashboard)
    - [🛵 Rider Dashboard](#-rider-dashboard)
    - [👑 Admin Control Panel](#-admin-control-panel)
    - [⚡ Real-Time \& Async Pipeline](#-real-time--async-pipeline)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🏗️ Project Structure](#️-project-structure)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Running Locally](#running-locally)
  - [🎯 Key Components \& Services](#-key-components--services)
    - [1. Order Lifecycle (`order.controller.ts`)](#1-order-lifecycle-ordercontrollerts)
    - [2. Payment Pipeline (RabbitMQ)](#2-payment-pipeline-rabbitmq)
    - [3. `<Checkout />`](#3-checkout-)
    - [4. Socket Context \& Realtime Service](#4-socket-context--realtime-service)
  - [📡 Service Ports (Default)](#-service-ports-default)
  - [🌐 Live Demo](#-live-demo)
  - [🤝 Contributing](#-contributing)
  - [📜 License \& Attribution](#-license--attribution)

---

## 📖 About The Project

**Feasto** is a full-stack food delivery ecosystem that connects **customers**, **restaurants (sellers)**, **delivery riders**, and **platform admins** through a role-aware React frontend and six independent Node.js microservices.

This project demonstrates:

- 🔑 **Google OAuth + JWT** identity across all services
- 🗄️ **MongoDB + Mongoose** with geospatial queries for nearby restaurants and riders
- 🐇 **RabbitMQ** for decoupled payment confirmation and rider dispatch events
- 📡 **Socket.io** for live order status updates to customers, sellers, and riders
- 💳 **Razorpay & Stripe** dual payment gateway integration
- ☁️ **Cloudinary** image uploads via a dedicated utils service
- 🗺️ **Leaflet** maps for delivery tracking and address selection

---

## ✨ Features

### 🔐 Authentication & Roles

- Google OAuth sign-in via `@react-oauth/google`.
- JWT session tokens (15-day expiry) shared across all microservices.
- Role selection flow: **customer**, **seller** (restaurant owner), or **rider**.
- Separate admin role with a dedicated dashboard (set manually in MongoDB).

### 🛒 Customer Experience

- Location-aware restaurant discovery with Haversine distance sorting.
- Category filters, search, and restaurant detail pages with menu items.
- Cart management (single-restaurant constraint enforced server-side).
- Saved delivery addresses with map-based geocoding.
- Checkout with promo codes, delivery fee logic (free above ₹250), and platform fees.
- Dual payment: **Razorpay** (modal) and **Stripe** (redirect).
- Live order tracking via Socket.io with Leaflet routing maps.
- Order history and post-delivery reviews.

### 🏪 Restaurant (Seller) Dashboard

- One restaurant per seller with Cloudinary image upload.
- Menu item CRUD with availability toggles.
- Real-time incoming order notifications via WebSocket.
- Order status pipeline: `accepted` → `preparing` → `ready_for_rider`.
- Promotion code management (percent/flat discounts).
- Revenue analytics with 7-day Recharts bar graph.
- Kitchen load indicator affecting estimated prep time.

### 🛵 Rider Dashboard

- Rider onboarding with Aadhaar/DL verification (admin-approved).
- Geospatial rider matching within 500m when orders are ready.
- Real-time order request notifications.
- Pickup → delivery status flow with earnings tracking.
- Live map routing from restaurant to customer via Leaflet.

### 👑 Admin Control Panel

- Platform analytics: revenue, active orders, user counts.
- Restaurant & rider verification/unverification workflows.
- Revenue charts, order history, and user management.
- Activity log and broadcast notification system.
- Dark mode toggle and CSV export.

### ⚡ Real-Time & Async Pipeline

```
Customer pays → Utils Service verifies → RabbitMQ PAYMENT_SUCCESS
  → Restaurant Service marks paid → Socket.io notifies restaurant
  → Seller marks ready → RabbitMQ ORDER_READY_FOR_RIDER
  → Rider Service finds nearby riders → Socket.io notifies riders
  → Rider accepts → Order assigned → Live tracking updates
```

---

## 🛠️ Tech Stack

| Category          | Technology         | Version | Purpose                                              |
| :---------------- | :----------------- | :------ | :--------------------------------------------------- |
| **Frontend**      | React              | 19.2.6  | SPA with role-based routing                          |
| **Build Tool**    | Vite               | 8.0.12  | Fast dev server and production bundling              |
| **Styling**       | Tailwind CSS       | 4.3.1   | Utility-first responsive UI                          |
| **Backend**       | Express.js         | 5.2.1   | REST API for all microservices                       |
| **Language**      | TypeScript         | 6.x     | Type safety across frontend and backend              |
| **Database**      | MongoDB            | —       | Document store with 2dsphere geospatial indexes      |
| **ODM**           | Mongoose           | 9.7.x   | Schema modeling and aggregation pipelines            |
| **Message Queue** | RabbitMQ           | 3.x     | Async payment and rider dispatch events              |
| **Real-Time**     | Socket.io          | 4.8.3   | WebSocket rooms per user/restaurant                  |
| **Auth**          | Google OAuth + JWT | —       | Identity provider and stateless sessions             |
| **Payments**      | Razorpay + Stripe  | —       | INR payment processing (India + international cards) |
| **Media**         | Cloudinary         | 2.10.0  | Image upload and CDN delivery                        |
| **Maps**          | Leaflet            | 1.9.4   | Address picker and live delivery routing             |
| **Charts**        | Recharts           | 3.9.0   | Admin and seller analytics visualizations            |
| **Deployment**    | Docker + Vercel    | —       | Containerized services; SPA on Vercel                |

---

## 🏗️ Project Structure

```
feasto/
│
├── 📁 frontend/                          # React + Vite SPA (Vercel-deployed)
│   ├── 📁 src/
│   │   ├── 📁 pages/                     # Route-level screens
│   │   │   ├── Home.tsx                  # Restaurant discovery (geo-sorted)
│   │   │   ├── RestaurantPage.tsx        # Menu & add-to-cart
│   │   │   ├── Cart.tsx                  # Cart review
│   │   │   ├── Checkout.tsx              # Address, promo, payment
│   │   │   ├── OrderPage.tsx             # Live order tracking map
│   │   │   ├── Restaurant.tsx            # Seller dashboard
│   │   │   ├── RiderDashboard.tsx        # Rider delivery UI
│   │   │   └── Admin.tsx                 # Platform admin panel
│   │   ├── 📁 components/                # Reusable UI widgets
│   │   │   ├── RestaurantCard.tsx        # Discovery card with distance
│   │   │   ├── OrderCard.tsx             # Order list item
│   │   │   ├── UserOrderMap.tsx          # Customer live tracking map
│   │   │   ├── RiderOrderMap.tsx         # Rider navigation map
│   │   │   └── AdminRevenueChart.tsx     # Platform revenue Recharts
│   │   ├── 📁 context/
│   │   │   ├── AppContext.tsx            # Auth, cart, location global state
│   │   │   └── SocketContext.tsx         # Socket.io connection manager
│   │   └── main.tsx                      # Service URL config & providers
│   └── vercel.json                       # SPA rewrite rules
│
├── 📁 services/
│   ├── 📁 auth/                          # Port 8000 — Google OAuth, JWT, roles
│   │   └── src/
│   │       ├── controllers/auth.controller.ts
│   │       ├── model/User.ts
│   │       └── middlewares/isAuth.ts
│   │
│   ├── 📁 restaurant/                    # Port 8002 — Core domain service
│   │   └── src/
│   │       ├── controllers/              # Restaurant, cart, order, review, promo
│   │       ├── models/                     # Order, Restaurant, Cart, Address, etc.
│   │       └── config/
│   │           ├── payment.consumer.ts   # RabbitMQ: payment → order placed
│   │           └── order.publisher.ts    # RabbitMQ: order ready → riders
│   │
│   ├── 📁 utils/                         # Port 8003 — Payments & Cloudinary
│   │   └── src/
│   │       ├── controllers/payment.controller.ts
│   │       └── config/verifyRazorpay.ts
│   │
│   ├── 📁 realtime/                      # Port 8004 — Socket.io hub
│   │   └── src/
│   │       ├── socket.ts                 # JWT-authenticated rooms
│   │       └── routes/internal.routes.ts # Service-to-service emit API
│   │
│   ├── 📁 rider/                         # Port 8005 — Rider profiles & dispatch
│   │   └── src/
│   │       ├── model/Rider.ts            # 2dsphere geospatial index
│   │       └── config/orderReady.consumer.ts
│   │
│   └── 📁 admin/                         # Port 8006 — Cross-DB admin queries
│       └── src/
│           ├── controllers/admin.ts      # Analytics, verification, notifications
│           └── util/collection.ts        # Direct MongoDB collection access
│
├── Auth-Service-Setup.md                 # Per-service setup guides
├── Restaurant-Service-Setup.md
├── RabbitMQ-Docker-Setup.md
├── Realtime-Service-Setup.md
├── Rider-Service-Setup.md
├── Utils-Service-Setup.md
└── admin-setup.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (local or Atlas)
- **Docker** (for RabbitMQ)
- **Google Cloud Console** project with OAuth credentials
- **Razorpay** and/or **Stripe** test keys
- **Cloudinary** account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Itssanthoshhere/Feasto.git
   cd Feasto
   ```

2. **Start RabbitMQ**

   ```bash
   docker run -d \
     --hostname rabbitmq-host \
     --name rabbitmq-container \
     -e RABBITMQ_DEFAULT_USER=admin \
     -e RABBITMQ_DEFAULT_PASS=admin123 \
     -p 5672:5672 \
     -p 15672:15672 \
     rabbitmq:3-management
   ```

3. **Install and configure each service**

   ```bash
   # Install dependencies for all services
   cd services/auth && npm install && cd ../..
   cd services/restaurant && npm install && cd ../..
   cd services/utils && npm install && cd ../..
   cd services/realtime && npm install && cd ../..
   cd services/rider && npm install && cd ../..
   cd services/admin && npm install && cd ../..
   cd frontend && npm install && cd ..
   ```

4. **Create `.env` files** in each service directory (see below).

5. **Build and start services** (in separate terminals):

   ```bash
   # Auth (8000)
   cd services/auth && npm run dev

   # Restaurant (8002)
   cd services/restaurant && npm run dev

   # Utils (8003)
   cd services/utils && npm run dev

   # Realtime (8004)
   cd services/realtime && npm run dev

   # Rider (8005)
   cd services/rider && npm run dev

   # Admin (8006)
   cd services/admin && npm run dev
   ```

6. **Start the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

### Environment Variables

Each service requires its own `.env`. Key variables:

**Auth Service (`services/auth/.env`)**

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/feasto
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Restaurant Service (`services/restaurant/.env`)**

```env
PORT=8002
MONGO_URI=mongodb://localhost:27017/feasto
JWT_SECRET=your_jwt_secret
UTILS_SERVICE=http://localhost:8003
REALTIME_SERVICE=http://localhost:8004
RIDER_SERVICE=http://localhost:8005
INTERNAL_SERVICE_KEY=your_shared_internal_key
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
PAYMENT_QUEUE=payment_success_queue
ORDER_READY_QUEUE=order_ready_queue
ALLOWED_ORIGINS=http://localhost:5173
```

**Utils Service (`services/utils/.env`)**

```env
PORT=8003
RESTAURANT_SERVICE=http://localhost:8002
FRONTEND_URL=http://localhost:5173
INTERNAL_SERVICE_KEY=your_shared_internal_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=your_stripe_secret
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
PAYMENT_QUEUE=payment_success_queue
CLOUD_NAME=your_cloudinary_cloud
CLOUD_API_KEY=your_cloudinary_key
CLOUD_SECRET_KEY=your_cloudinary_secret
```

**Frontend (`frontend/.env`)**

```env
VITE_AUTH_SERVICE_URL=http://localhost:8000
VITE_RESTAURANT_SERVICE_URL=http://localhost:8002
VITE_UTILS_SERVICE_URL=http://localhost:8003
VITE_REALTIME_SERVICE_URL=http://localhost:8004
VITE_RIDER_SERVICE_URL=http://localhost:8005
VITE_ADMIN_SERVICE_URL=http://localhost:8006
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

> See individual `*-Setup.md` files in the repo root for detailed per-service configuration.

### Running Locally

| Service     | Command       | URL                    |
| :---------- | :------------ | :--------------------- |
| Frontend    | `npm run dev` | http://localhost:5173  |
| Auth        | `npm run dev` | http://localhost:8000  |
| Restaurant  | `npm run dev` | http://localhost:8002  |
| Utils       | `npm run dev` | http://localhost:8003  |
| Realtime    | `npm run dev` | http://localhost:8004  |
| Rider       | `npm run dev` | http://localhost:8005  |
| Admin       | `npm run dev` | http://localhost:8006  |
| RabbitMQ UI | —             | http://localhost:15672 |

---

## 🎯 Key Components & Services

### 1. Order Lifecycle (`order.controller.ts`)

The central orchestrator for the entire platform:

- Validates cart, address ownership, restaurant open status, and single-restaurant constraint.
- Computes Haversine delivery distance, fees, promo discounts, and ETA.
- Creates pending orders with a 15-minute TTL (MongoDB TTL index auto-deletes unpaid orders).
- Publishes RabbitMQ events when orders are ready for rider pickup.
- Emits Socket.io events on every status transition.

### 2. Payment Pipeline (RabbitMQ)

Decoupled payment verification prevents race conditions:

1. Frontend calls Utils Service → Razorpay/Stripe verification.
2. Utils publishes `PAYMENT_SUCCESS` to RabbitMQ.
3. Restaurant Service consumer atomically marks order paid and clears cart.
4. Socket.io notifies the restaurant of a new order.

Includes idempotency checks and Razorpay signature verification.

### 3. `<Checkout />`

Multi-step checkout with:

- Address radio selection with add-new flow.
- Client-side promo validation against restaurant promotions API.
- Parallel Razorpay modal and Stripe redirect payment paths.
- Fee breakdown: subtotal, delivery (₹49 or free), platform fee (₹7), discounts.

### 4. Socket Context & Realtime Service

- JWT-authenticated Socket.io connections join `user:{id}` and `restaurant:{id}` rooms.
- Internal `/api/v1/internal/emit` endpoint allows backend services to push events securely via `x-internal-key`.
- Events: `order:new`, `order:update`, `order:available`, `order:rider_assigned`.

---

## 📡 Service Ports (Default)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Auth :8000  │     │ Admin :8006 │
│   :5173     │     └──────────────┘     └─────────────┘
│  (Vercel)   │     ┌──────────────┐     ┌─────────────┐
│             │────▶│Restaurant    │────▶│ Realtime    │
│             │     │   :8002      │     │   :8004     │
│             │     └──────┬───────┘     └─────────────┘
│             │            │ RabbitMQ
│             │     ┌──────▼───────┐     ┌─────────────┐
│             │────▶│  Utils :8003 │     │ Rider :8005 │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                      MongoDB Atlas
```

---

## 🌐 Live Demo

- **Production Frontend:** [https://getfeasto.vercel.app](https://getfeasto.vercel.app/)
- **Source Code:** [https://github.com/Itssanthoshhere/Feasto](https://github.com/Itssanthoshhere/Feasto)

The live deployment hosts the React frontend on Vercel. Backend microservices must be running separately (or deployed to your own infrastructure) for full functionality — auth, ordering, payments, and real-time tracking.

---

## 🤝 Contributing

1. Fork the [repository](https://github.com/Itssanthoshhere/Feasto)
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add order cancellation flow'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License & Attribution

This project is for educational and portfolio purposes.

Developed by **[V S Santhosh](https://github.com/Itssanthoshhere)** ([@Itssanthoshhere](https://github.com/Itssanthoshhere)).

⭐ If this project helped you understand microservices architecture for food delivery platforms, please give it a [star on GitHub](https://github.com/Itssanthoshhere/Feasto)!
