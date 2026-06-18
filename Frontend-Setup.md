# Feasto Frontend — Initial Setup

## Create Vite React Application

```bash
npm create vite@latest ./
```

### Select Configuration

```text
Framework: React
Variant: TypeScript
Install Dependencies: Yes
```

---

## Start Development Server

```bash
npm run dev
```

Vite Development Server:

```text
Local: http://localhost:5173
```

---

## Install Tailwind CSS v4

### Tailwind CSS + Vite Plugin

```bash
npm i tailwindcss @tailwindcss/vite
```

---

## Install Core Frontend Dependencies

### React Router DOM

```bash
npm i react-router-dom
```

Used for:

- Client-side routing
- Protected routes
- Nested routing
- Navigation management

---

### Axios

```bash
npm i axios
```

Used for:

- API requests
- Backend communication
- Authentication requests
- Microservice communication

---

### React Hot Toast

```bash
npm i react-hot-toast
```

Used for:

- Success notifications
- Error alerts
- Authentication feedback
- Global toast messages

---

## Configure Tailwind CSS

### vite.config.ts

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

---

### src/index.css

```css
@import "tailwindcss";
```

---

## Configure React Router

Install:

```bash
npm i react-router-dom
```

---

## Environment Variables

Create:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Run Application

### Development

```bash
npm run dev
```

---

### Production Build

```bash
npm run build
```

---

### Preview Production Build

```bash
npm run preview
```

---

## Current Frontend Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS v4
- React Router DOM
- Axios
- React Hot Toast

---

## Verify Installation

```bash
npm run dev
```

Expected Output:

```text
VITE v8.x.x ready

➜ Local: http://localhost:5173
```

This setup serves as the frontend foundation for Feasto and will support authentication, role-based dashboards, restaurant management, food ordering, delivery tracking, and payment workflows.
