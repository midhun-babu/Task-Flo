import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { apiLimiter } from './middlewares/rateLimitMiddleware.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { notFound } from './middlewares/notFoundMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { setupSwagger } from './docs/swagger.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // required to pass refresh token in cookies
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// JSON Body Parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Basic rate limiter for all API routes (auth has specific limiter in routes)
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Swagger Documentation
setupSwagger(app);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// 404 handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
