import dotenv from 'dotenv';
import path from 'path';

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

server.register(routes, { prefix: '/api' });

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
