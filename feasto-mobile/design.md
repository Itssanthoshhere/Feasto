# Feasto Mobile App — Design Specification

> **Source of truth:** All copy, color values, component patterns, data shapes, and status terminology in this document are pulled directly from the live web codebase at `/frontend/src/`. Nothing is invented or placeholder.

---

## Purpose

Feasto is a real-time full-stack food delivery ecosystem. The mobile app replicates the customer-facing web experience — restaurant discovery, ordering, live tracking, and payment — in a native mobile shell backed by the same microservices.

---

## Critical Files Reference

| File                                    | Role                                                    |
| --------------------------------------- | ------------------------------------------------------- |
| `frontend/src/types.ts`                 | Canonical data contracts for all entities               |
| `frontend/src/config/orderConstants.ts` | Order status enum, flow, and UI metadata                |
| `frontend/src/main.tsx`                 | Service URLs and Google OAuth client ID                 |
| `frontend/src/index.css`                | Font family, animation tokens                           |
| `frontend/src/pages/Login.tsx`          | Exact login copy and auth flow                          |
| `frontend/src/pages/Home.tsx`           | Hero copy, search logic, category list, ETA calculation |
| `frontend/src/pages/Checkout.tsx`       | Payment summary labels, promo logic, button states      |
| `frontend/src/pages/Orders.tsx`         | Order card structure, status rendering                  |

---

## Brand Tokens (from `index.css` + component classes)

| Token                 | Value                                             | Source                                   |
| --------------------- | ------------------------------------------------- | ---------------------------------------- |
| Primary               | `#FF5A1F`                                         | Used across all CTAs, chips, focus rings |
| Primary hover         | `#e8521c`                                         | Hover state on buttons                   |
| Primary dark          | `#e14b14`                                         | Active/pressed state                     |
| Background            | `#F8FAFC` (`slate-50`)                            | Page backgrounds                         |
| Surface               | `#FFFFFF`                                         | Cards, modals                            |
| Text primary          | `#1E293B` (`slate-900`)                           | Headings                                 |
| Text secondary        | `#64748B` (`slate-500`)                           | Subtext, labels                          |
| Text muted            | `#94A3B8` (`slate-400`)                           | Placeholders, timestamps                 |
| Border                | `#F1F5F9` (`slate-100`)                           | Card borders                             |
| Success               | `#059669` (`emerald-600`)                         | FREE delivery, discount                  |
| Error                 | `#EF4444` (`red-500`)                             | Promo errors                             |
| Font family           | `Outfit` (wght 300–900)                           | Google Fonts, loaded in `index.css`      |
| Border radius cards   | `1.5rem` (`rounded-3xl`)                          | Restaurant cards, checkout panels        |
| Border radius buttons | `1rem` (`rounded-2xl`)                            | Primary CTAs                             |
| Border radius chips   | `9999px` (`rounded-full`)                         | Category chips, badges                   |
| Animation             | `fade-in-up` — 0.8s cubic-bezier(0.16, 1, 0.3, 1) | Page entry                               |
| Card shadow           | `0 4px 20px rgb(0,0,0,0.03)`                      | All white cards                          |

---

## Backend Services

From `main.tsx`:

| Variable                      | Default          | Purpose                                   |
| ----------------------------- | ---------------- | ----------------------------------------- |
| `VITE_AUTH_SERVICE_URL`       | `localhost:8000` | Google OAuth login                        |
| `VITE_RESTAURANT_SERVICE_URL` | `localhost:8002` | Restaurants, menu, cart, orders, promos   |
| `VITE_UTILS_SERVICE_URL`      | `localhost:8003` | Payments (Razorpay + Stripe), file upload |
| `VITE_REALTIME_SERVICE_URL`   | `localhost:8004` | Socket.IO live events                     |
| `VITE_RIDER_SERVICE_URL`      | `localhost:8005` | Rider profile, dispatch                   |
| `VITE_ADMIN_SERVICE_URL`      | `localhost:8006` | Admin panel data                          |

---

## Data Shapes (from `types.ts`)

### User

```
_id, name, email, image, role
```

### IRestaurant

```
_id, name, description, image, phone
isOpen: boolean
isVerified: boolean
rating: number, totalReviews: number
autoLocation: { coordinates: [lng, lat], formattedAddress }
kitchenLoad: "normal" | "busy" | "very_busy"
```

### IMenuItem

```
_id, name, description, image, price
isAvailable: boolean
```

### ICart

```
itemId → IMenuItem, restaurantId → IRestaurant
quantity: number
```

### IOrder

```
restaurantName, items[]: { name, price, quantity }
subtotal, deliveryFee, platformFee, discountAmount, promoCode, totalAmount
deliveryAddress: { formattedAddress, mobile, latitude, longitude }
paymentMethod: "razorpay" | "stripe"
paymentStatus: "pending" | "paid" | "failed"
riderName, riderPhone, riderPicture
status: see Order Statuses below
```

### IPromotion

```
code, discountType: "percent" | "flat", discountValue
minOrderValue, isActive, expiresAt
```

---

## Order Status System (from `orderConstants.ts`)

Full linear progression flow:

| Status            | Label            | Icon | Color   |
| ----------------- | ---------------- | ---- | ------- |
| `placed`          | Order Placed     | 📋   | Amber   |
| `accepted`        | Accepted         | ✅   | Emerald |
| `preparing`       | Preparing        | 👨‍🍳   | Blue    |
| `ready_for_rider` | Ready for Pickup | 📦   | Indigo  |
| `rider_assigned`  | Rider Assigned   | 🏍️   | Violet  |
| `picked_up`       | On the Way       | 🚀   | Purple  |
| `delivered`       | Delivered        | 🎉   | Green   |
| `cancelled`       | Cancelled        | ❌   | Red     |

**Active statuses** (show live tracking UI): `placed` → `picked_up`  
**Terminal statuses**: `delivered`, `cancelled`

---

## Screens

### 1. Login Screen

_Copy sourced from `Login.tsx` lines 64–108_

- Background: `/background.avif` with `bg-black/60 backdrop-blur-sm` overlay
- Logo: `logo.png` in `w-20 h-20 rounded-2xl bg-white` container, scaled 1.6×
- App name: **"feasto"** — `font-black italic lowercase text-white`
- Heading: **"The #1 restaurant management app"** — `text-white font-extrabold`
- Subtext: **"Experience fast & easy operations on Feasto"** — `text-slate-200`
- CTA: **"Continue with Google"** — white pill, Google icon (FcGoogle), `rounded-2xl`
  - Loading state: **"Authenticating..."**
- Legal copy: _"By continuing, you agree to our Terms of Service and Privacy Policy"_ — `text-slate-300`
- Entry animation: `animate-fade-in-up`

---

### 2. Home Screen

_Copy sourced from `Home.tsx` lines 122–131_

- Badge text: **"FEASTO EXCLUSIVE"** — orange pill, `uppercase tracking-[0.15em]`
- Heading `h1`: **"Discover Great Food Around You"**
- Subtext: **"Freshly prepared meals from nearby restaurants, delivered fast to your door."**
- Search placeholder: `"Search for restaurants, cuisines..."`
- Search button: **"Search"**
- Loading state: `"Finding restaurants near you..."` with `BiMapAlt` spinner

**Category chips** (exact order from `Home.tsx` CATEGORIES array):

> Indian · Pizza · Burger · Healthy · Asian · Dessert · Sushi

- Active chip: `bg-[#FF5A1F] text-white scale-105`
- Inactive chip: `bg-white border border-slate-200 text-slate-600`

**Restaurant card fields** (from `IRestaurant` + ETA calc):

- `image`, `name`, `isOpen` badge, `rating` ⭐, `totalReviews`, ETA string
- ETA formula: `kitchenLoad` → prepTime (15/30/45 min) + distance × 3 min
- Example: **"10–20 min"**, **"30–40 min"**, **"45–55 min"**
- No results: `"No restaurants found near you"` + `"Try a different search or check back later"`

---

### 3. Restaurant Detail Screen

_Copy sourced from `RestaurantPage.tsx`_

- Back button: BiArrowBack icon + **"Back"** text
- Promotions section header: **"Available Offers"** with `BiSolidOffer` icon
  - Discount display: `"20% OFF"` or `"₹50 OFF"`
  - Min order: `"On orders above ₹{minOrderValue}"`
  - Code chip: `tracking-widest font-bold` on slate background
- Menu section header: **"Menu"**
- Menu item count: `"{n} items available"` or `"1 item available"`
- Menu search placeholder: `"Search menu..."` · aria-label: `"Search menu items"`

---

### 4. Cart Screen

Cart is a derived state from `ICart[]` with `IMenuItem` and `IRestaurant` populated.  
Key computed values from `AppContext`:

- `subTotal` — sum of `price × quantity`
- `quantity` — total item count

---

### 5. Checkout Screen

_Copy sourced from `Checkout.tsx`_

**Delivery Address section:**

- Section header: **"Delivery Address"**
- Subtext: **"Select where you want your order delivered"**
- Empty state: **"No saved addresses found"** / **"Please add an address to continue"**
- CTA: **"Add Address"** (`navigate("/address")`)
- Error state: **"Failed to load addresses"** + **"Retry"** button

**Payment Summary section:**

- Header: **"Payment Summary"**
- Line items (exact labels):
  - `Items ({quantity})` → `₹{subTotal}`
  - `Delivery Fee` → `FREE` (green) or `₹{deliveryFee}`
  - `Platform Fee` → `₹{platformFee}`
  - `Discount ({promoCode})` → `-₹{discountAmount}` (emerald)
  - Free delivery nudge: **"Add items worth ₹{250 - subTotal} to get free delivery 🚀"** (shown when subTotal < 250)
- Total row: **"Total"** → `₹{grandTotal}` — `font-extrabold`

**Promo code:**

- Input placeholder: `"Enter promo code"` (auto-uppercased)
- Apply button: **"Apply"** / loading spinner
- Applied state: `"{CODE} APPLIED"` + **"Remove"** link
- Error: shown in `text-red-500`

**Payment buttons (exact button labels):**

- `"Pay with Razorpay ₹{grandTotal}"` — bg `#FF5A1F` (orange)
  - Loading: `"Opening Payment..."` / `"Creating Order..."`
- `"Pay with Stripe ₹{grandTotal}"` — bg `#000000` (black)
  - Loading: `"Redirecting to Stripe..."` / `"Creating Order..."`
- Disabled state: `bg-slate-300 cursor-not-allowed`
- Address warning: **"Please select a delivery address to continue"** — amber
- Footer note: **"Secured payments. Your data is encrypted."** — BiShieldQuarter icon

---

### 6. Orders Screen

_Copy sourced from `Orders.tsx`_

**Tabs:**

- `"Active"` 🔴 · `"Completed"` 📦

**Active order card:**

- Mini progress bar (6 segments), filling orange per step index
- Status label from `STATUS_META[status].label` + icon
- Rider strip (when assigned): 🏍️ `{riderName}` · 📞 `{riderPhone}`

**Past order card:**

- Status badge: label from `STATUS_META`
- **"Reorder"** button — `bg-slate-100 hover:bg-[#FF5A1F] hover:text-white`

**Empty states:**

- Active tab: **"No active orders"** 🍽️ / _"When you place an order, it will show up here with live tracking."_
- Completed tab: **"No past orders yet"** 📦 / _"Your delivered and completed orders will appear here."_
- Active empty CTA: **"Browse Restaurants"**

**Timestamp format:** `"Just now"` / `"{n}m ago"` / `"{n}h ago"` / `"DD Mon"`

---

### 7. Order Detail / Tracking Screen

_Sourced from `OrderPage.tsx` + `UserOrderMap.tsx`_

- Map: Leaflet with live rider coordinates from Socket.IO
- Status stepper: all 7 statuses (see Order Status table)
- Rider info: name, phone, picture
- Order items list: `name × qty → ₹amount`
- Total: `₹{totalAmount}`

---

### 8. Profile / Account Screen

User object: `{ name, email, image, role }`  
Role values: `null` (customer) | `"seller"` | `"rider"` | `"admin"`

---

## General UI Rules (from component patterns)

| Rule                    | Value                                                         |
| ----------------------- | ------------------------------------------------------------- |
| Page entry animation    | `animate-fade-in-up` (0.8s cubic-bezier)                      |
| Button press            | `active:scale-[0.97]` or `active:scale-95`                    |
| Hover lift              | `hover:-translate-y-0.5`                                      |
| Skeleton loader         | `animate-pulse rounded-xl bg-gray-50 h-28`                    |
| Focus ring              | `focus:ring-4 focus:ring-[#FF5A1F]/10 focus:border-[#FF5A1F]` |
| Toast                   | `react-hot-toast` — success / error                           |
| Currency                | Indian Rupee `₹` (not `Rs.` or `INR`)                         |
| Delivery free threshold | `₹250` subtotal                                               |
| Platform fee            | Flat `₹7`                                                     |
| Bottom nav tabs         | Home · Orders · Cart (with count badge) · Account             |
