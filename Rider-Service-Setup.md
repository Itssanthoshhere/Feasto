# Rider Service Setup Guide

This guide outlines the steps to initialize and configure the new Rider microservice to be fully consistent with existing services (like `auth` and `realtime`).

## 1. Project Initialization

Navigate to the `services/rider` directory and initialize a new Node.js project.

```bash
cd services/rider
npm init -y
```

## 2. Dependencies Installation

Install the required production and development dependencies.

### Core Dependencies

```bash
npm i express dotenv jsonwebtoken mongoose cors axios multer datauri
```

### Development Dependencies

```bash
npm i -D typescript concurrently @types/express @types/dotenv @types/jsonwebtoken @types/mongoose @types/cors @types/multer @types/node
```

## 3. Package.json Configuration

To match the ESM (ECMAScript Modules) setup of `auth` and `realtime`, you must add `"type": "module"` and use `node --watch` instead of `nodemon` for development. Update your `package.json` so it looks like this:

```json
{
  "name": "rider",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "concurrently \"tsc --watch\" \"node --watch dist/index.js\""
  }
}
```

## 4. TypeScript Configuration

Initialize a `tsconfig.json` file and use the exact same configuration as the other services to ensure ESM compatibility.

```bash
npx tsc --init
```

Update your `tsconfig.json` to this:

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "es2020",
    "lib": ["ES2020"],
    "types": ["node"],
    "sourceMap": false,
    "declaration": false,
    "declarationMap": false,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 5. Proposed Folder Structure

Create a `src` directory with the standard microservice structure:

```text
services/rider/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

## Next Steps

1. **Database Connection**: Set up Mongoose connection in `src/config/db.ts` (make sure to append `.js` in imports due to `"type": "module"`).
2. **Express Server**: Initialize Express in `src/index.ts`.
3. **Authentication**: Implement JWT verification middleware in `src/middlewares/` to protect rider routes.
4. **File Uploads**: Configure Multer in memory-storage mode and use `datauri` to format files before uploading them.
