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
      origin: (origin, cb) => {
        // Allow all origins in development, specific origins in production
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          process.env.FRONTEND_URL,
          /\.vercel\.app$/,
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.some(allowed => {
          if (typeof allowed === 'string') return origin === allowed;
          if (allowed instanceof RegExp) return allowed.test(origin);
          return false;
        })) {
          cb(null, true);
        } else {
          cb(null, true); // Allow all for now
        }
      },
      credentials: true,
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

    // Auto-seed prices from YAML config
    const seedPrices = async () => {
      try {
        const fs = require('fs');
        const yaml = require('js-yaml');
        const prisma = require('db/client').default;
        
        const pricesFile = path.join(__dirname, '../../../config/prices.classics-2026.yaml');
        
        if (!fs.existsSync(pricesFile)) {
          console.log('⚠️  Prices file not found, skipping auto-seed');
          return;
        }

        const prices: any[] = yaml.load(fs.readFileSync(pricesFile, 'utf8')) as any[];
        
        let created = 0;
        let updated = 0;

        for (const priceEntry of prices) {
          const existingPrice = await prisma.price.findFirst({
            where: {
              riderId: priceEntry.riderId,
              source: priceEntry.source,
            },
          });

          if (existingPrice) {
            await prisma.price.update({
              where: { id: existingPrice.id },
              data: {
                amountEUR: priceEntry.amountEUR,
                capturedAt: new Date(),
              },
            });
            updated++;
          } else {
            await prisma.price.create({
              data: {
                riderId: priceEntry.riderId,
                source: priceEntry.source,
                amountEUR: priceEntry.amountEUR,
                capturedAt: new Date(),
              },
            });
            created++;
          }
        }
        
        console.log(`✅ Auto-seeded prices: ${created} created, ${updated} updated (total: ${prices.length})`);
      } catch (err) {
        console.error('⚠️  Auto-seed prices failed (non-fatal):', err);
      }
    };

    // Run auto-seed before listening
    await seedPrices();

    const port = parseInt(process.env.PORT || '3000', 10);
    console.log(`Attempting to listen on port: ${port} (from PORT env: ${process.env.PORT})`);
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
