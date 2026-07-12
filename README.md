<div align="center">

# 🛵 Feasto

### Full-Stack Real-Time Food Delivery Platform

<p>
  <strong>A production-grade microservices food delivery ecosystem built with React, TypeScript, Node.js, RabbitMQ, Socket.IO, MongoDB, and Docker.</strong>
</p>

<p>
  Connecting <b>Customers</b>, <b>Restaurants</b>, <b>Riders</b>, and <b>Admins</b> through a scalable event-driven architecture inspired by modern delivery platforms like Swiggy and Zomato.
</p>

<br/>

<a href="https://getfeasto.vercel.app" target="_blank">
  <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_Feasto-success?style=for-the-badge&logo=vercel&logoColor=white" />
</a>

<a href="https://santhosh-vs-portfolio.vercel.app" target="_blank">
  <img src="https://img.shields.io/badge/🌐_Portfolio-Santhosh_VS-black?style=for-the-badge&logo=vercel&logoColor=white" />
</a>

<a href="https://github.com/Itssanthoshhere" target="_blank">
  <img src="https://img.shields.io/badge/GitHub-Itssanthoshhere-181717?style=for-the-badge&logo=github&logoColor=white" />
</a>


<img src="https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Messaging-RabbitMQ-FF6600?style=flat-square&logo=rabbitmq&logoColor=white" />
<img src="https://img.shields.io/badge/Realtime-Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white" />
<img src="https://img.shields.io/badge/Maps-Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white" />
<img src="https://img.shields.io/badge/Containers-Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />

</div>

<br/>

> **A production-style, microservices-based food delivery platform** — connecting customers, restaurants, riders, and admins through a role-aware React frontend and six independent Node.js backend services. Architected to mirror how modern apps like Swiggy and Zomato are built.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Key Design Decisions](#-key-design-decisions)
- [API & Service Communication](#-api--service-communication)
- [Live Demo](#-live-demo)
- [Contributing](#-contributing)

---

## 🔭 Overview

**Feasto** is a full-stack food delivery ecosystem that demonstrates real-world microservices architecture at the application level. It implements:

- **Decoupled async communication** via RabbitMQ between payment, restaurant, and rider services
- **Real-time WebSocket** delivery with JWT-authenticated rooms per user and restaurant
- **Geospatial queries** in MongoDB for location-aware restaurant discovery and rider dispatching
- **Dual payment gateway** integration (Razorpay + Stripe) with idempotent verification
- **Multi-role RBAC** for customers, sellers (restaurant owners), riders, and admins — all from a single React SPA

This is a portfolio-grade project built for educational purposes, demonstrating how modern food delivery platforms handle ordering, payments, real-time updates, and dispatch logic.

---

## 🏗️ Architecture

### Service Map

```
                          ┌──────────────────────┐      ┌──────────────────────┐
                          │   Frontend (Web)     │      │   Mobile App (Expo)  │
                          │   Vite · Port 5173   │      │   React Native       │
                          │   Deployed on Vercel │      │   Customer UI        │
                          └──────┬───────────────┘      └────────┬─────────────┘
                                 │ HTTP / WebSocket              │
          ┌──────────────────────┼───────────────────────────────┘
          │                      │                      │
   ┌──────▼──────┐       ┌───────▼──────┐      ┌───────▼──────┐
   │  Auth :8000 │       │Rest :8002    │      │ Utils :8003  │
   │  Google OAuth│      │Core Domain   │      │ Payments &   │
   │  JWT Sessions│      │Orders, Cart  │      │ Cloudinary   │
   └─────────────┘       └──────┬───────┘      └──────┬───────┘
                                │                      │
                         ┌──────▼──────────────────────▼──────┐
                         │           RabbitMQ                  │
                         │  PAYMENT_SUCCESS · ORDER_READY      │
                         └──────┬──────────────────────┬───────┘
                                │                      │
                         ┌──────▼──────┐       ┌───────▼──────┐
                         │  Rider :8005│       │Realtime :8004│
                         │  Dispatch & │       │Socket.io Hub │
                         │  Geospatial │       │JWT-auth rooms│
                         └─────────────┘       └─────────────┘

                         ┌─────────────┐
                         │ Admin :8006 │
                         │ Cross-DB    │
                         │ Analytics   │
                         └─────────────┘

                              All services ──▶ MongoDB Atlas
```

### Async Order Pipeline

```
Customer pays
    │
    ▼
Utils Service (verifies Razorpay / Stripe)
    │
    ▼
RabbitMQ → PAYMENT_SUCCESS
    │
    ▼
Restaurant Service (marks order paid, clears cart)
    │
    ├──▶ Socket.io → notifies restaurant of new order
    │
Seller marks order ready_for_rider
    │
    ▼
RabbitMQ → ORDER_READY_FOR_RIDER
    │
    ▼
Rider Service (geospatial query: riders within 500m)
    │
    ├──▶ Socket.io → notifies nearby riders
    │
Rider accepts → Order assigned
    │
    ▼
Socket.io → live tracking updates to customer
```

---

## ✨ Features

### 🔐 Authentication & Roles

- Google OAuth sign-in via `@react-oauth/google`
- JWT session tokens with 15-day expiry, shared and verified across all microservices
- Role selection flow post-login: **customer**, **seller**, or **rider**
- Separate **admin** role (manually assigned in MongoDB) with dedicated control panel

### 🛒 Customer Experience (Web & Mobile)

- **Cross-platform access** — Responsive web app and native Expo mobile app (iOS/Android)
- **Location-aware restaurant discovery** — Haversine distance sorting, category filters, and search
- **Cart management** — single-restaurant constraint enforced server-side to prevent cross-restaurant orders
- **Saved delivery addresses** — map-based geocoding via Leaflet
- **Checkout flow** — promo code validation, delivery fee logic (free above ₹250), ₹7 platform fee
- **Dual payment** — Razorpay modal (INR) and Stripe redirect (international cards)
- **Live order tracking** — Socket.io status updates with Leaflet routing maps
- **Order history** and post-delivery review system
- **Mobile enhancements** — Biometric lock, Haptic feedback, Apple Sign-in, and Skeleton loading

### 🏪 Restaurant (Seller) Dashboard

- One restaurant per seller with Cloudinary image uploads
- **Menu CRUD** with per-item availability toggles
- **Real-time order notifications** via WebSocket (no page refresh needed)
- **Order pipeline management** — `pending` → `accepted` → `preparing` → `ready_for_rider`
- **Promotion code management** — percent and flat-rate discounts
- **Revenue analytics** — 7-day Recharts bar graph
- **Kitchen load indicator** — affects estimated prep time shown to customers

### 🛵 Rider Dashboard

- Onboarding with Aadhaar / DL document upload (admin approval required)
- **Geospatial dispatch** — matched to orders within 500m radius when ready
- Real-time order request notifications with accept/decline flow
- **Pickup → delivery status** pipeline with earnings tracking
- Live map routing from restaurant to customer via Leaflet

### 👑 Admin Control Panel

- Platform-wide analytics: revenue, active orders, registered users
- **Restaurant & rider verification workflows** — approve or revoke
- Revenue charts, full order history, and user management
- Activity log, broadcast notification system
- Dark mode toggle and CSV export

---

## 🛠️ Tech Stack

| Layer             | Technology         | Version | Role                                            |
| :---------------- | :----------------- | :------ | :---------------------------------------------- |
| **Web Frontend**  | React              | 19.2.6  | SPA with role-based routing                     |
| **Mobile App**    | Expo/React Native  | 52.0.x  | Native customer application                     |
| **Build**         | Vite               | 8.0.12  | Dev server + production bundling                |
| **Styling**       | Tailwind CSS       | 4.3.1   | Utility-first responsive UI                     |
| **Backend**       | Express.js         | 5.2.1   | REST API for all microservices                  |
| **Language**      | TypeScript         | 6.x     | Type safety across frontend & backend           |
| **Database**      | MongoDB Atlas      | —       | Document store with 2dsphere geospatial indexes |
| **ODM**           | Mongoose           | 9.7.x   | Schema modeling and aggregation pipelines       |
| **Message Queue** | RabbitMQ           | 3.x     | Async payment confirmation & rider dispatch     |
| **Real-Time**     | Socket.io          | 4.8.3   | JWT-authenticated WebSocket rooms               |
| **Auth**          | Google OAuth + JWT | —       | Identity provider + stateless sessions          |
| **Payments**      | Razorpay + Stripe  | —       | INR modal + international card redirect         |
| **Media**         | Cloudinary         | 2.10.0  | Image upload and CDN delivery                   |
| **Maps**          | Leaflet            | 1.9.4   | Address picker + live delivery routing          |
| **Charts**        | Recharts           | 3.9.0   | Admin and seller analytics                      |
| **Deployment**    | Docker + Vercel    | —       | Containerized services; SPA on Vercel           |

---

## 🏗️ Project Structure

```
feasto/
│
├── 📁 frontend/                          # React + Vite SPA (Vercel-deployed)
│   ├── 📁 src/
│   │   ├── 📁 pages/
│   │   │   ├── Home.tsx                  # Restaurant discovery (geo-sorted)
│   │   │   ├── RestaurantPage.tsx        # Menu & add-to-cart
│   │   │   ├── Cart.tsx                  # Cart review
│   │   │   ├── Checkout.tsx              # Address, promo, payment
│   │   │   ├── OrderPage.tsx             # Live order tracking map
│   │   │   ├── Restaurant.tsx            # Seller dashboard
│   │   │   ├── RiderDashboard.tsx        # Rider delivery UI
│   │   │   └── Admin.tsx                 # Platform admin panel
│   │   ├── 📁 components/
│   │   │   ├── RestaurantCard.tsx        # Discovery card with distance badge
│   │   │   ├── OrderCard.tsx             # Order list item
│   │   │   ├── UserOrderMap.tsx          # Customer live tracking map
│   │   │   ├── RiderOrderMap.tsx         # Rider navigation map
│   │   │   └── AdminRevenueChart.tsx     # Platform revenue Recharts
│   │   ├── 📁 context/
│   │   │   ├── AppContext.tsx            # Auth, cart, location — global state
│   │   │   └── SocketContext.tsx         # Socket.io connection manager
│   │   └── main.tsx                      # Service URL config & providers
│   └── vercel.json                       # SPA rewrite rules
│
├── 📁 mobile/                            # Expo React Native App
│   ├── 📁 app/                           # Expo Router file-based routing
│   │   ├── 📁 (tabs)/                    # Bottom tab navigation (Home, Cart, Orders, Profile)
│   │   ├── restaurant/[id].tsx           # Restaurant menu & ordering
│   │   ├── order/[id].tsx                # Live order tracking with maps & sockets
│   │   └── checkout.tsx                  # Payment & checkout flow
│   ├── 📁 components/                    # Reusable UI components & skeletons
│   ├── 📁 hooks/                         # Custom hooks (Sockets, Biometrics, Location)
│   ├── 📁 lib/                           # API clients, analytics, and types
│   └── app.json                          # Expo configuration
│
└── 📁 services/
    ├── 📁 auth/                          # Port 8000 — Google OAuth, JWT, roles
    │   └── src/
    │       ├── controllers/auth.controller.ts
    │       ├── model/User.ts
    │       └── middlewares/isAuth.ts
    │
    ├── 📁 restaurant/                    # Port 8002 — Core domain service
    │   └── src/
    │       ├── controllers/              # restaurant, cart, order, review, promo
    │       ├── models/                   # Order, Restaurant, Cart, Address, etc.
    │       └── config/
    │           ├── payment.consumer.ts   # RabbitMQ: payment_success → order placed
    │           └── order.publisher.ts    # RabbitMQ: order ready → riders
    │
    ├── 📁 utils/                         # Port 8003 — Payments & Cloudinary
    │   └── src/
    │       ├── controllers/payment.controller.ts
    │       └── config/verifyRazorpay.ts
    │
    ├── 📁 realtime/                      # Port 8004 — Socket.io hub
    │   └── src/
    │       ├── socket.ts                 # JWT-authenticated rooms
    │       └── routes/internal.routes.ts # Service-to-service emit API
    │
    ├── 📁 rider/                         # Port 8005 — Rider profiles & dispatch
    │   └── src/
    │       ├── model/Rider.ts            # 2dsphere geospatial index
    │       └── config/orderReady.consumer.ts
    │
    └── 📁 admin/                         # Port 8006 — Cross-DB admin queries
        └── src/
            ├── controllers/admin.ts      # Analytics, verification, notifications
            └── util/collection.ts        # Direct MongoDB collection access
```

---

## 🚀 Getting Started

### Prerequisites

| Tool    | Minimum Version |
| :------ | :-------------- |
| Node.js | 18.0.0          |
| npm     | 9.0.0           |
| Docker  | Any recent      |
| MongoDB | Local or Atlas  |

You will also need accounts / credentials for:

- **Google Cloud Console** — OAuth 2.0 client credentials
- **Razorpay** — test key ID and secret
- **Stripe** — test secret key
- **Cloudinary** — cloud name, API key, API secret

---

### 1. Clone the Repository

```bash
git clone https://github.com/Itssanthoshhere/Feasto.git
cd Feasto
```

### 2. Start RabbitMQ (Docker)

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

RabbitMQ management UI will be available at [http://localhost:15672](http://localhost:15672) (admin / admin123).

### 3. Install Dependencies

```bash
cd services/auth       && npm install && cd ../..
cd services/restaurant && npm install && cd ../..
cd services/utils      && npm install && cd ../..
cd services/realtime   && npm install && cd ../..
cd services/rider      && npm install && cd ../..
cd services/admin      && npm install && cd ../..
cd frontend            && npm install && cd ..
```

### 4. Configure Environment Variables

Create `.env` files in each service directory. See [Environment Variables](#-environment-variables) below.

### 5. Start Services

Run each in a separate terminal:

```bash
cd services/auth       && npm run dev   # :8000
cd services/restaurant && npm run dev   # :8002
cd services/utils      && npm run dev   # :8003
cd services/realtime   && npm run dev   # :8004
cd services/rider      && npm run dev   # :8005
cd services/admin      && npm run dev   # :8006
cd frontend            && npm run dev   # :5173
cd mobile              && npx expo start # Expo Go / Simulator
```

Open [http://localhost:5173](http://localhost:5173) for web, or scan the QR code for mobile.

---

## 🔧 Environment Variables

### Auth Service — `services/auth/.env`

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/feasto
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Restaurant Service — `services/restaurant/.env`

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

### Utils Service — `services/utils/.env`

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

### Realtime Service — `services/realtime/.env`

```env
PORT=8004
JWT_SECRET=your_jwt_secret
INTERNAL_SERVICE_KEY=your_shared_internal_key
```

### Rider Service — `services/rider/.env`

```env
PORT=8005
MONGO_URI=mongodb://localhost:27017/feasto
JWT_SECRET=your_jwt_secret
UTILS_SERVICE=http://localhost:8003
RESTAURANT_SERVICE=http://localhost:8002
REALTIME_SERVICE=http://localhost:8004
INTERNAL_SERVICE_KEY=your_shared_internal_key
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
ORDER_READY_QUEUE=order_ready_queue
```

### Admin Service — `services/admin/.env`

```env
PORT=8006
MONGO_URI=mongodb://localhost:27017/feasto
JWT_SECRET=your_jwt_secret
```

### Frontend — `frontend/.env`

```env
VITE_AUTH_SERVICE_URL=http://localhost:8000
VITE_RESTAURANT_SERVICE_URL=http://localhost:8002
VITE_UTILS_SERVICE_URL=http://localhost:8003
VITE_REALTIME_SERVICE_URL=http://localhost:8004
VITE_RIDER_SERVICE_URL=http://localhost:8005
VITE_ADMIN_SERVICE_URL=http://localhost:8006
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

> **Important:** `JWT_SECRET` must be identical across all services that issue or verify tokens. Similarly, `INTERNAL_SERVICE_KEY` must match across any service that calls another service's internal endpoints.

---

## 🎯 Key Design Decisions

### Order Lifecycle (`order.controller.ts`)

The Restaurant Service owns the central order state machine. On order creation it:

1. Validates cart contents, address ownership, restaurant open status, and the single-restaurant cart constraint
2. Computes Haversine delivery distance, delivery fee (free above ₹250), platform fee (₹7), promo discounts, and ETA
3. Creates a `pending` order with a **15-minute TTL** — MongoDB automatically deletes unpaid orders via a TTL index
4. After payment confirmation (via RabbitMQ), transitions the order state and emits Socket.io events on every subsequent status change

### Payment Decoupling (RabbitMQ)

Rather than having the payment service directly update order state (synchronous coupling), the payment verification is decoupled:

1. Frontend calls Utils Service → Razorpay/Stripe signature verification
2. Utils publishes `PAYMENT_SUCCESS` to RabbitMQ
3. Restaurant Service consumer atomically marks the order as paid, clears the cart, and notifies the restaurant

This prevents race conditions and makes the payment service independently deployable.

### Geospatial Rider Dispatch

`Rider.ts` stores coordinates with a `2dsphere` index. When an order is ready, the Rider Service queries:

```js
Rider.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 500, // meters
    },
  },
  isOnline: true,
  currentOrder: null,
});
```

All matching riders receive a real-time Socket.io notification. First to accept wins the order.

### Internal Service Communication

Services communicate via a shared `INTERNAL_SERVICE_KEY` header. The Realtime Service exposes a `/api/v1/internal/emit` endpoint that only other backend services can call, keeping WebSocket logic centralized and out of domain services.

---

## 📡 API & Service Communication

### Service Ports (Default)

| Service     | Port  | Responsibility                         |
| :---------- | :---- | :------------------------------------- |
| Frontend    | 5173  | React SPA                              |
| Auth        | 8000  | Google OAuth, JWT issuance             |
| Restaurant  | 8002  | Orders, cart, menu, reviews, promos    |
| Utils       | 8003  | Payments (Razorpay/Stripe), Cloudinary |
| Realtime    | 8004  | Socket.io hub, internal emit API       |
| Rider       | 8005  | Rider profiles, dispatch, geospatial   |
| Admin       | 8006  | Platform analytics, verification       |
| RabbitMQ UI | 15672 | Queue monitoring dashboard             |

### Socket.io Events

| Event                  | Direction           | Description                   |
| :--------------------- | :------------------ | :---------------------------- |
| `order:new`            | Server → Restaurant | New paid order arrived        |
| `order:update`         | Server → Customer   | Order status changed          |
| `order:available`      | Server → Rider      | Nearby order ready for pickup |
| `order:rider_assigned` | Server → Customer   | Rider accepted the order      |

---

## 📡 Service Ports

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Auth :8000  │     │ Admin :8006 │
│ (Web/Mobile)│     └──────────────┘     └─────────────┘
│             │     ┌──────────────┐     ┌─────────────┐
│             │────▶│ Restaurant   │────▶│  Realtime   │
│             │     │    :8002     │     │    :8004    │
│             │     └──────┬───────┘     └─────────────┘
│             │            │  RabbitMQ
│             │     ┌──────▼───────┐     ┌─────────────┐
│             │────▶│  Utils :8003 │     │ Rider :8005 │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                      MongoDB Atlas
```

---

## 🌐 Live Demo

| Resource            | URL                                                                                    |
| :------------------ | :------------------------------------------------------------------------------------- |
| Production Frontend | [https://getfeasto.vercel.app](https://getfeasto.vercel.app/)                          |
| Source Code         | [https://github.com/Itssanthoshhere/Feasto](https://github.com/Itssanthoshhere/Feasto) |

> The live deployment hosts the React frontend on Vercel. For full end-to-end functionality (auth, ordering, payments, real-time tracking), the backend microservices need to be running — either locally or deployed to your own infrastructure.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: describe the change'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📜 License & Attribution

This project is built for **educational and portfolio purposes**.

Developed by **[V S Santhosh](https://github.com/Itssanthoshhere)** — [@Itssanthoshhere](https://github.com/Itssanthoshhere)

Portfolio: [santhosh-vs-portfolio.vercel.app](https://santhosh-vs-portfolio.vercel.app)

---

<div align="center">

⭐ **If Feasto helped you understand microservices architecture for food delivery, give it a star!**

</div>
