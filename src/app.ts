'use strict'
import 'reflect-metadata'
import fastify from 'fastify'
import authPlugin from './plugin/auth'
import authRoutes from './routes/auth'
import accountRoutes from './routes/account'
import categoryRountes from './routes/category'
import currencyRountes from './routes/currency'
import transactionRoutes from './routes/transaction'

export default function App(opts = {}) {
    const server = fastify(opts);

    // Register plugins and routes
    server.register(authPlugin);
    
    server.register(authRoutes , { prefix: '/auth' });
    server.register(accountRoutes , { prefix: '/account' });
    server.register(categoryRountes , { prefix: '/category'});
    server.register(currencyRountes , { prefix: '/currency'});
    server.register(transactionRoutes , { prefix: '/transaction'});

    server.get('/', async (request, reply) => {
        reply.send('Hello world'); 
    });

    return server;
}