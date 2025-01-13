'use strict'

import fastify from 'fastify'
import authPlugin from './plugin/auth'
import authRoutes from './routes/auth'
import accountRoutes from './routes/account'

export default function App(opts = {}) {
    const server = fastify(opts);

    // Register plugins and routes
    server.register(authPlugin);
    
    server.register(authRoutes , { prefix: '/auth' });
    server.register(accountRoutes , { prefix: '/account' });

    server.get('/', async (request, reply) => {
        reply.send('Hello world'); 
    });

    return server;
}