import { FastifyInstance } from 'fastify';
import { User } from '../entity/User';
import bcrypt from 'bcrypt'
import { getDataSource } from '../database';

export default async function (fastify: FastifyInstance) {
  
  const AppDataSource = await getDataSource();
  const userRepository = AppDataSource.getRepository(User);

  interface IParams {
    id: string
  }

  fastify.post('/register', async (request, reply) => {
    const { username, password , firstname , lastname } = request.body as any

    try {
        // Check if user exists
        const existingUser = await userRepository.findOne({ 
            where: { username } 
        })

        if (existingUser) {
            return reply.code(400).send({ 
                message: 'Username already exists' 
            })
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = userRepository.create({
            username,
            password: hashedPassword,
            firstname : firstname,
            lastname : lastname
        })
        
        await userRepository.save(user)
        reply.code(200).send({ 
            message: 'User registered successfully' 
        })
    } catch (error) {
        reply.code(500).send({ 
            message: 'Internal server error' + error 
        })
    }
  })

  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body as any
    
    const user = await userRepository.findOne({ where: { username } })
    if (!user) {
      reply.code(401).send({ message: 'Invalid credentials' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      reply.code(401).send({ message: 'Invalid credentials' })
      return
    }

    const token = fastify.jwt.sign({ id : user.id },{ expiresIn: "200000"})
    reply.send({ 
        message: 'Login successful',
        token: token 
    })
  })

  fastify.delete('/users/:id',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as IParams
    const user = await userRepository.findOne({
      where: { id }
    })

    if (!user) {
      reply.code(404).send({ message: 'User not found' })
      return
    }

    await userRepository.remove(user)
    reply.send({ message: 'User deleted successfully' })
  })

}

