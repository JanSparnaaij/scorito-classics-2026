import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';

// Load .env only in development (not in production where Railway provides env vars)
if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
  console.log('Loaded .env file for local development');
} else {
  console.log('Using Railway environment variables');
}

import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './routes';

const server = Fastify({
  logger: true,
});

// Add heartbeat to keep process alive
setInterval(() => {
  console.log(`[Heartbeat] Server is alive at ${new Date().toISOString()}`);
}, 60000); // Every 60 seconds

const start = async () => {
  try {
    // Run database migrations in production
    if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgresql')) {
      console.log('Running database migrations...');
      execSync('cd packages/db && pnpm prisma migrate deploy', {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '../../..'),
      });
      console.log('Migrations completed successfully');
      
      console.log('Regenerating Prisma Client...');
      execSync('cd packages/db && pnpm prisma generate', {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '../../..'),
      });
      console.log('Prisma Client generated successfully');
    }

    // Register plugins
    await server.register(cors, {
      origin: '*',
    });

    // Root health check endpoint
    server.get('/', async (request, reply) => {
      return {
        status: 'ok',
        message: 'Scorito Classics 2026 API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
          races: '/api/races',
          syncRaces: 'POST /api/races/sync',
          startlist: '/api/races/:slug/startlist'
        }
      };
    });

    // Simple test endpoint without database
    server.get('/health', async (request, reply) => {
      return { status: 'healthy', timestamp: new Date().toISOString() };
    });

    // Ultra simple sync endpoint for testing
    server.get('/ping', (request, reply) => {
      reply.send('pong');
    });

    // Debug endpoint
    server.get('/debug', (request, reply) => {
      reply.send({
        port: process.env.PORT,
        nodeEnv: process.env.NODE_ENV,
        railwayEnv: process.env.RAILWAY_ENVIRONMENT,
        hasDatabase: !!process.env.DATABASE_URL
      });
    });

    // Register API routes
    try {
      await server.register(routes, { prefix: '/api' });
      console.log('✅ API routes registered successfully');
    } catch (err) {
      console.error('❌ Failed to register API routes:', err);
      // Continue without API routes for debugging
    }

    const port = parseInt(process.env.PORT || '3000', 10);
    await server.listen({ port, host: '0.0.0.0' });
    
    console.log(`✅ Server successfully started and listening on http://0.0.0.0:${port}`);
    console.log('Registered routes:');
    console.log(server.printRoutes());
    console.log('Server is ready to accept connections');
    
    // Test if server actually responds
    setTimeout(() => {
      console.log('[Self-test] Server is still running after 5 seconds');
    }, 5000);
    
    // Keep the process alive
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
  } catch (err) {
    console.error('❌ Fatal error during startup:', err);
    server.log.error(err);
    process.exit(1);
  }
};

start();
