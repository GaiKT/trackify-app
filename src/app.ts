'use strict'
import 'reflect-metadata'
import Fastify from 'fastify'
import authPlugin from './plugin/auth'
import authRoutes from './routes/auth'
import accountRoutes from './routes/account'
import categoryRoutes from './routes/category'
import currencyRoutes from './routes/currency'
import transactionRoutes from './routes/transaction'
import summariesRouters from './routes/summaries'
import fastifyCors from '@fastify/cors'

export default function App(opts = {}) {
    const server = Fastify(opts);

    //register cors
    server.register(fastifyCors, {
        origin: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    });

    // Register plugins and routes
    server.register(authPlugin);
    
    server.register(authRoutes, { prefix: '/auth' });
    server.register(accountRoutes, { prefix: '/account' });
    server.register(categoryRoutes, { prefix: '/category'});
    server.register(currencyRoutes, { prefix: '/currency'});
    server.register(transactionRoutes, { prefix: '/transaction'});
    server.register(summariesRouters , { prefix: '/summaries' }), 

    server.get('/', async (request, reply) => {
        reply.send('Hello world'); 
    });

    return server;
}