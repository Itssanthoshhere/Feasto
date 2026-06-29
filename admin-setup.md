# Feasto Admin Service — Initial Setup

## Initialize Node.js Project

```bash
npm init -y
```

---

## Install Production Dependencies

### Express & Core Packages

```bash
npm i express dotenv mongodb jsonwebtoken cors
```

**Packages Installed**

- Express — Web framework
- Dotenv — Environment variable management
- MongoDB — MongoDB native driver
- JSON Web Token — Authentication & authorization
- CORS — Cross-Origin Resource Sharing

---

## Install Development Dependencies

```bash
npm i -D @types/express @types/dotenv @types/mongodb @types/jsonwebtoken @types/cors concurrently typescript
```

**Packages Installed**

- @types/express — Type definitions for Express
- @types/dotenv — Type definitions for Dotenv
- @types/mongodb — Type definitions for MongoDB
- @types/jsonwebtoken — Type definitions for JSON Web Token
- @types/cors — Type definitions for CORS
- Concurrently — Run multiple commands concurrently
- TypeScript — TypeScript compiler
