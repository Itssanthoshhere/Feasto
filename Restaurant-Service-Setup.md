# Feasto Restaurant Service — Initial Setup

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
npm i express dotenv mongoose datauri multer axios jsonwebtoken
```

**Packages Installed**

- Express — Web framework
- Dotenv — Environment variable management
- Mongoose — MongoDB ODM
- DataURI — Convert files to Data URI format
- Multer — File upload middleware
- Axios — HTTP client
- JSON Web Token — Authentication & authorization

---

## Install Development Dependencies

```bash
npm i -D @types/express @types/dotenv @types/mongoose @types/multer @types/axios concurrently typescript
```

### JWT Types

```bash
npm i -D @types/jsonwebtoken
```

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
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "concurrently \"tsc --watch\" \"node --watch dist/index.js\""
},
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
PORT=8002

MONGO_URI=

JWT_SECRET=
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
- MongoDB
- Mongoose
- JWT Authentication
- Axios
- Multer
- DataURI
- Dotenv
- ts-node-dev
- Concurrently

---

## Planned Features

- Restaurant Registration
- Restaurant Management
- Menu Management
- Food Item CRUD Operations
- Restaurant Image Uploads
- Cloud Storage Integration
- JWT Protected Routes
- Restaurant Ownership Verification

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

This setup serves as the foundation for the Feasto Restaurant Service and will handle restaurant onboarding, menu management, image uploads, and restaurant-related business logic within the Feasto microservice ecosystem.
