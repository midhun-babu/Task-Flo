import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiLimiter } from './middlewares/rateLimitMiddleware.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { notFound } from './middlewares/notFoundMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { setupSwagger } from './docs/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // allow inline scripts/styles in dev
}));

// CORS configuration (kept for external API consumers)
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// JSON Body Parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Basic rate limiter for all API routes
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Swagger Documentation
setupSwagger(app);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(path.join(frontendPath, 'public')));
app.use(express.static(path.join(frontendPath, 'src')));
app.use(express.static(frontendPath));

// SPA fallback — serve index.html for any non-API route
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 handler (API routes only — unreachable in practice but kept for safety)
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
