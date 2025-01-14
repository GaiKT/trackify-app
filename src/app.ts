'use strict'
import 'reflect-metadata'
import fastify from 'fastify'
import authPlugin from './plugin/auth'
import authRoutes from './routes/auth'
import accountRoutes from './routes/account'
import categoryRoutes from './routes/category'
import currencyRoutes from './routes/currency'
import transactionRoutes from './routes/transaction'

export default function App(opts = {}) {
    const server = fastify(opts);

    // Register plugins and routes
    server.register(authPlugin);
    
    server.register(authRoutes, { prefix: '/auth' });
    server.register(accountRoutes, { prefix: '/account' });
    server.register(categoryRoutes, { prefix: '/category'});
    server.register(currencyRoutes, { prefix: '/currency'});
    server.register(transactionRoutes, { prefix: '/transaction'});

    server.get('/', async (request, reply) => {
        reply.send('Hello world'); 
    });

    return server;
}