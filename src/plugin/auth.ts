import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string }
    user: {
      id: string
      username: string
    }
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  })

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid token'
      })
    }
  })
})