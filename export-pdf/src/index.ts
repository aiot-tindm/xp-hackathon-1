import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import exportRoutes from './routes/exportRoutes';
import { specs } from './config/swagger';
import { testConnection } from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Export Service API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// Test CORS endpoint
app.get('/api/test-cors', (_req: Request, res: Response) => {
  res.json({
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/export', exportRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    status: 'error'
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    status: 'error'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
  
  // Test database connection
  await testConnection();
  
  console.log(`📝 API Documentation:`);
  console.log(`   GET /api/health - Health check`);
  console.log(`   POST /api/export/direct - Direct export PDF file with charts`);
  console.log(`     Export Types:`);
  console.log(`       • best_seller - Hàng bán chạy`);
  console.log(`       • refund - Hàng bị refund nhiều`);
  console.log(`       • refund_reason - Lý do refund`);
  console.log(`       • revenue - Doanh số chung`);
  console.log(`       • slow_moving - Hàng ế`);
  console.log(`       • all - Tất cả biểu đồ (default)`);
});

export default app; 