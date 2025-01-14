import { buildTest } from '../helper';
import { AppDataSource } from '../database';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';

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

  it('should login a user', async () => {
    const user = new User();
    user.username = 'test';
    user.password = bcrypt.hashSync('password', 10);
    user.firstname = 'Test';
    user.lastname = 'User';
    await userRepository.save(user);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'test',
        password: 'password',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toBe('Login successful');
  });

  it('should not login a user with wrong password', async () => {
    const user = new User();
    user.username = 'test';
    user.password = bcrypt.hashSync('password', 10);
    user.firstname = 'Test';
    user.lastname = 'User';
    await userRepository.save(user);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'test',
        password: 'password12',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toBe('Invalid username or password');
  });

  it('should not login a user with wrong username', async () => {
    const user = new User();
    user.username = 'test';
    user.password = bcrypt.hashSync('password', 10);
    user.firstname = 'Test';
    user.lastname = 'User';
    await userRepository.save(user);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'test1',
        password: 'password',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toBe('Invalid username or password');
  });

});