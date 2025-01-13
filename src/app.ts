'use strict'

import fastify from 'fastify'
import authPlugin from './plugin/auth'
import authRoutes from './routes/auth'

export function build(opts = {}) {
    const server = fastify(opts);

    // Register plugins and routes
    server.register(authPlugin);
    server.register(authRoutes , { prefix: '/auth' });

    server.get('/', async (request, reply) => {
        reply.send('Hello world'); 
    });

    return server;
}
