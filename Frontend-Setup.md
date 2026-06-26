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

### Google OAuth

```bash
npm install @react-oauth/google@latest
```

Used for:

- Google Sign-In
- One Tap Authentication
- Social Login Integration
- User Onboarding

---

### React Icons

```bash
npm i react-icons
```

Used for:

- Google Authentication Icons
- Navigation Icons
- Dashboard Icons
- Social Media Icons
- UI Enhancements

Example:

```tsx
import { FcGoogle } from "react-icons/fc";
```

---

### Leaflet

```bash
npm i leaflet
```

Used for:

- Interactive Maps
- Live Order Tracking
- Delivery Partner Location
- Restaurant Location Display
- Customer Address Selection
- Route Visualization

---

### React Leaflet

```bash
npm i react-leaflet
```

Used for:

- React components for Leaflet
- Interactive map rendering
- Markers and popups
- Polylines and polygons
- Live location updates
- Delivery tracking UI

---

### Leaflet TypeScript Definitions

```bash
npm i -D @types/leaflet
```

Used for:

- TypeScript support for Leaflet
- Improved IntelliSense
- Type-safe map development
- Better developer experience

---

## Install All Frontend Dependencies Together

```bash
npm i tailwindcss @tailwindcss/vite react-router-dom axios react-hot-toast @react-oauth/google react-icons leaflet react-leaflet
```

Install TypeScript definitions:

```bash
npm i -D @types/leaflet
```

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

## Configure Google OAuth

### main.tsx

```tsx
import { GoogleOAuthProvider } from "@react-oauth/google";

<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>;
```

---

## Environment Variables

Create:

```env
VITE_API_URL=http://localhost:8000/api

VITE_GOOGLE_CLIENT_ID=
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
- Google OAuth
- React Icons
- Leaflet
- React Leaflet

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

This setup serves as the frontend foundation for Feasto and supports authentication, Google Sign-In, role-based dashboards, restaurant management, customer browsing, shopping cart, interactive maps, restaurant location display, live delivery tracking, rider navigation, route visualization, and payment workflows.
