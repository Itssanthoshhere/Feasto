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
npm i express dotenv cloudinary cors concurrently
```

**Packages Installed**

- Express — Web framework
- Dotenv — Environment variable management
- Cloudinary — Cloud-based image and media storage
- CORS — Cross-Origin Resource Sharing
- Concurrently — Run multiple commands simultaneously

---

## Install Development Dependencies

```bash
npm i -D @types/express @types/dotenv @types/cors typescript
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

CLOUD_NAME=

CLOUD_API_KEY=

CLOUD_SECRET_KEY=
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
- CORS
- Dotenv
- ts-node-dev
- Concurrently

---

## Planned Features

- Image Upload Service
- Cloudinary Integration
- Restaurant Image Storage
- Food Item Image Storage
- User Avatar Uploads
- Media Management APIs
- Shared Utility Functions
- Centralized File Handling

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

This setup serves as the foundation for the Feasto Utils Service and will handle media uploads, Cloudinary integration, and shared utility operations across all Feasto microservices.
