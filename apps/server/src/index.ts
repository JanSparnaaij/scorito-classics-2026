import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';

// Load .env from the monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './routes';

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: '*', // Allow all origins for simplicity in this example
});

// Root health check endpoint
server.get('/', async (request, reply) => {
  try {
    return {
      status: 'ok',
      message: 'Scorito Classics 2026 API',
      endpoints: {
        races: '/api/races',
        syncRaces: 'POST /api/races/sync',
        startlist: '/api/races/:slug/startlist'
      }
    };
  } catch (error) {
    server.log.error(error);
    reply.code(500);
    return { error: 'Internal server error', details: error };
  }
});

server.register(routes, { prefix: '/api' });

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

    const port = parseInt(process.env.PORT || '3000', 10);
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Server successfully started and listening on http://0.0.0.0:${port}`);
    
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
