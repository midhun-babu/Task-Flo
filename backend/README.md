# Task-Flo Backend

Production-ready REST API backend for the Task-Flo Task Management System.

## Features
- **Authentication**: JWT-based (Access & Refresh tokens), secure password hashing.
- **Authorization**: Role-based (admin, manager, employee) and object-level authorization (employees only access their own tasks).
- **Tasks**: Create, read, update, cancel, status management.
- **Security**: Rate limiting, helmet headers, input validation (Joi), NoSQL injection protection.
- **Documentation**: Swagger/OpenAPI available at `/api-docs`.

## Technology Stack
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcrypt
- Joi (Validation)
- ES Modules

## Installation
```bash
npm install
```

## Environment Variables
Create a `.env` file based on `.env.example`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task-flo
JWT_ACCESS_SECRET=supersecret1
JWT_REFRESH_SECRET=supersecret2
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
BCRYPT_SALT_ROUNDS=12
```

## Running the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Testing
```bash
npm test
```

## API Documentation
Once the server is running, visit:
`http://localhost:5000/api-docs`

## Security Overview
- Centralized error handler prevents stack trace leaks.
- Role-based middleware ensures endpoint access control.
- Service layer strictly enforces object ownership (e.g., `assignedTo`).
- Rate limiting to prevent brute-force attacks on auth routes.
