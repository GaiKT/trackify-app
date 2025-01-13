import { build } from '../app'
import { AppDataSource } from '../utils/database'
import { User } from '../entity/User'
import { FastifyInstance } from 'fastify'
import supertest from 'supertest'
import bcrypt from 'bcrypt'

describe('Auth Routes', () => {
  let app: FastifyInstance
  let userRepository: any

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    userRepository = AppDataSource.getRepository(User)
  })

  beforeEach(async () => {
    app = build({ logger: false })
    await app.ready()
    await userRepository.clear()
  })

  afterEach(async () => {
    await app.close()
  })

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  })

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await supertest(app.server)
        .post('/auth/register')
        .send({ username: 'testuser', password: 'password' })
        .expect(200)

      expect(response.body).toEqual({ message: 'User registered successfully' })
    })

    it('should not register a user with the same username', async () => {
      const user = new User()
      user.username = 'test'
      user.password = bcrypt.hashSync('password', 10)
      await userRepository.save(user)

      const response = await supertest(app.server)
        .post('/auth/register')
        .send({ username: 'test', password: 'password' })
        .expect(400)

      expect(response.body.message).toBe('Username already exists')
    })
  })

    describe('POST /auth/login', () => {
        it('should login a user', async () => {
        const user = new User()
        user.username = 'test'
        user.password = bcrypt.hashSync('password', 10)
        await userRepository.save(user)

        const token = app.jwt.sign({ id: user.id })
        
        const response = await supertest(app.server)
            .post('/auth/login')
            .send({ username: 'test', password: 'password' })
            .expect(200)
        console.log(response.body)
        expect(response.body).toEqual({message : 'Login successful' , token : token})})

        it('should not login a user with invalid credentials', async () => {
        const user = new User()
        user.username = 'test'
        user.password = bcrypt.hashSync('password', 10)
        await userRepository.save(user)

        const response = await supertest(app.server)
            .post('/auth/login')
            .send({ username: 'test', password: 'wrongpassword' })
            .expect(401)
        expect(response.body.message).toBe('Invalid credentials')
        })

        it('should not login a user that does not exist', async () => {
        const response = await supertest(app.server)
            .post('/auth/login')
            .send({ username: 'test', password: 'password' })
            .expect(401)
        expect(response.body.message).toBe('Invalid credentials')
        })
    
    })
})