# Feasto Realtime Service — Initial Setup

## Initialize Node.js Project

```bash
npm init -y
```

---

## Install Production Dependencies

### Express, Socket.IO & Core Packages

```bash
npm i cors socket.io express dotenv jsonwebtoken
```

**Packages Installed**

- CORS — Cross-Origin Resource Sharing
- Socket.IO — Real-time bidirectional event-based communication
- Express — Web framework
- Dotenv — Environment variable management
- JSONWebToken — JWT authentication for socket connections

---

## Install Development Dependencies

```bash
npm i -D @types/cors @types/socket.io @types/express @types/dotenv @types/jsonwebtoken
```

### Build & Running Tools

```bash
npm i -D concurrently typescript
```

---

## Configure Scripts

Add the following scripts inside `package.json`:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "concurrently \"tsc --watch\" \"node --watch dist/index.js\""
}
```

Make sure to set the module type to ES Modules if needed:

```json
"type": "module"
```

---

## Create Source Directory

```bash
mkdir src
touch src/index.ts
touch src/socket.ts
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
PORT=8004
ALLOWED_ORIGINS=http://localhost:5173

JWT_SECRET=your_jwt_secret_here
INTERNAL_SERVICE_KEY=your_internal_key_here

FRONTEND_URL=http://localhost:5173
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

- Node.js
- TypeScript
- Express.js
- Socket.IO
- JSONWebToken
- CORS
- Dotenv
- Concurrently

---

## Architecture Responsibilities

### Realtime Services

- Socket.IO Connection Management
- JWT Authentication for Sockets
- User & Restaurant Room Management
- Bidirectional Real-time Events
- Internal API endpoints for cross-service event emission

---

## Install Everything Together

```bash
npm i cors socket.io express dotenv jsonwebtoken

npm i -D @types/cors @types/socket.io @types/express @types/dotenv @types/jsonwebtoken concurrently typescript
```

---

This setup serves as the foundation for the **Feasto Realtime Service**, responsible for real-time bidirectional communication between clients (such as restaurants and users) using Socket.IO. It manages authenticated socket rooms and allows other microservices to trigger instant updates across the platform.
