# Feasto Utils Service — Initial Setup

## Initialize Node.js Project

```bash
npm init -y
```

---

## Install TypeScript Globally

```bash
npm i -g typescript
```

---

## Generate TypeScript Configuration

```bash
npx tsc --init
```

---

## Install Production Dependencies

### Express & Core Packages

```bash
npm i express dotenv cloudinary cors razorpay amqplib axios stripe
```

**Packages Installed**

- Express — Web framework
- Dotenv — Environment variable management
- Cloudinary — Cloud-based image and media storage
- CORS — Cross-Origin Resource Sharing
- Razorpay — Payment Gateway Integration
- Stripe — Payment Gateway Integration (International)
- amqplib — RabbitMQ client for message queue communication
- Axios — HTTP client for inter-service communication

---

## Install Development Dependencies

```bash
npm i -D @types/express @types/dotenv @types/cors @types/amqplib @types/axios typescript
```

### Optional Razorpay Types

```bash
npm i -D @types/razorpay
```

> Note: Some Razorpay versions include built-in TypeScript support. If installation fails, this package can be skipped.

---

## Configure Scripts

Add the following scripts inside `package.json`:

```json
"scripts": {
  "dev": "tsc --watch",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### Recommended (Better DX)

Install:

```bash
npm i -D ts-node-dev
```

Update scripts:

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

---

## Create Source Directory

```bash
mkdir src
touch src/index.ts
```

---

## Build Project

```bash
npm run build
```

This compiles TypeScript into JavaScript.

Output:

```text
dist/
```

---

## Start Development Server

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file:

```env
PORT=8003

# Cloudinary

CLOUD_NAME=

CLOUD_API_KEY=

CLOUD_SECRET_KEY=

# Razorpay

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

# Internal Service Communication

INTERNAL_SERVICE_KEY=
```

---

## Run Application

### Development Mode

```bash
npm run dev
```

### Production Mode

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

---

## Current Tech Stack

- Node.js 26
- TypeScript
- Express.js
- Cloudinary
- Razorpay
- Stripe
- amqplib (RabbitMQ)
- Axios
- CORS
- Dotenv
- ts-node-dev
- Concurrently

---

## Architecture Responsibilities

### Media Services

- Restaurant Image Uploads
- Menu Item Image Uploads
- User Avatar Uploads
- Cloudinary Asset Management
- Centralized File Storage

### Payment Services

- Razorpay Order Creation
- Stripe Checkout Sessions
- Payment Verification
- Payment Signature Validation
- Webhook Processing
- Refund Support
- Payment Status Updates

### Message Queue Services

- RabbitMQ Connection Management
- Event Publishing & Consuming
- Inter-Service Async Communication

### Shared Utilities

- Internal Service Communication
- Common Utility Functions
- Shared Infrastructure Logic
- Centralized Asset Handling

---

## Verify Installation

```bash
node -v
npm -v
tsc -v
```

Expected:

```bash
Node.js v26.x.x
npm 11.x.x
TypeScript 6.x.x
```

---

## Install Everything Together

```bash
npm i express dotenv cloudinary cors razorpay amqplib axios stripe

npm i -D @types/express @types/dotenv @types/cors @types/amqplib @types/axios typescript ts-node-dev
```

Optional:

```bash
npm i -D @types/razorpay
```

---

This setup serves as the foundation for the **Feasto Utils Service**, responsible for Cloudinary media uploads, Razorpay and Stripe payment processing, RabbitMQ message queue communication, shared infrastructure utilities, internal service communication, and reusable platform-wide functionality across all Feasto microservices.
