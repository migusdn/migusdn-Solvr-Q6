import { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';

export const setupSecurityMiddleware = async (server: FastifyInstance) => {
  // CORS 설정
  await server.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // 보안 헤더 설정
  server.addHook('onSend', (request, reply, payload, done) => {
    reply.headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });
    done();
  });
};