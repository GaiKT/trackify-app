import { buildTest } from '../helper';
import { AppDataSource } from '../utils/database';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';
import 'reflect-metadata';

describe('Auth Routes', () => {
  const app = buildTest();
  let userRepository: any;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    userRepository = AppDataSource.getRepository(User);
  });

  beforeEach(async () => {
    await userRepository.clear();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('should register a new user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username: 'test',
        password: 'password',
        firstname: 'Test',
        lastname: 'User',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toBe('User registered successfully');
  });

  it('should not register a user with the same username', async () => {
    const user = new User();
    user.username = 'test';
    user.password = bcrypt.hashSync('password', 10);
    user.firstname = 'Test';
    user.lastname = 'User';
    await userRepository.save(user);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username: 'test',
        password: 'password12',
        firstname: 'Test',
        lastname: 'User',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toBe('Username already exists');
  });

  // describe('POST /auth/login', () => {
  //       it('should login a user', async () => {
  //       const user = new User()
  //       user.username = 'test'
  //       user.password = bcrypt.hashSync('password', 10)
  //       await userRepository.save(user)

  //       const token = app.jwt.sign({ id: user.id })
        
  //       const response = await supertest(app.server)
  //           .post('/auth/login')
  //           .send({ username: 'test', password: 'password' })
  //           .expect(200)
  //       console.log(response.body)
  //       expect(response.body).toEqual({message : 'Login successful' , token : token})})

  //       it('should not login a user with invalid credentials', async () => {
  //       const user = new User()
  //       user.username = 'test'
  //       user.password = bcrypt.hashSync('password', 10)
  //       await userRepository.save(user)

  //       const response = await supertest(app.server)
  //           .post('/auth/login')
  //           .send({ username: 'test', password: 'wrongpassword' })
  //           .expect(401)
  //       expect(response.body.message).toBe('Invalid credentials')
  //       })

  //       it('should not login a user that does not exist', async () => {
  //       const response = await supertest(app.server)
  //           .post('/auth/login')
  //           .send({ username: 'test', password: 'password' })
  //           .expect(401)
  //       expect(response.body.message).toBe('Invalid credentials')
  //       })
    
  // })
});