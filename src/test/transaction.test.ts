import { buildTest } from '../helper';
import { FastifyInstance } from 'fastify'
import { getDataSource } from '../database';
import { User } from '../entity/User';
import { Account } from '../entity/Account';
import { Category } from '../entity/Category';
import { Currency } from '../entity/Currency';
import { createReadStream } from 'fs'
import path from 'path'

describe('Transaction Routes', () => {
  let app: FastifyInstance
  let testUser: User
  let testAccount: Account
  let testCategory: Category
  let testCurrency: Currency

  beforeAll(async () => {
    app = await buildTest()
    const dataSource = await getDataSource()
    
    // Create test data
    testUser = await dataSource.getRepository(User).save({
      username: 'testuser',
      password: 'password123'
    })

    testAccount = await dataSource.getRepository(Account).save({
      name: 'Test Account',
      user: testUser
    })

    testCategory = await dataSource.getRepository(Category).save({
      category_name: 'Test Category'
    })

    testCurrency = await dataSource.getRepository(Currency).save({
      currency_code: 'USD'
    })
  })

  afterAll(async () => {
    await app.close()
  })

  it('should create new transaction', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/transactions/create',
      payload: {
        transaction_name: 'Test Transaction',
        amount: 100,
        payment_type: 'expense',
        description: 'Test description',
        account_id: testAccount.id,
        currency_id: testCurrency.id,
        category_id: testCategory.id,
        transaction_slip: createReadStream(path.join(__dirname, '../../../test/fixtures/test-image.jpg'))
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    expect(response.statusCode).toBe(201)
    expect(JSON.parse(response.payload)).toHaveProperty('message')
  })

  it('should get transactions with pagination', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/transactions/all/${testUser.id}?page=1&limit=10`
    })

    expect(response.statusCode).toBe(200)
    const payload = JSON.parse(response.payload)
    expect(payload).toHaveProperty('data')
    expect(payload).toHaveProperty('meta')
  })

  it('should validate required fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/transactions/create',
      payload: {
        // Missing required fields
      }
    })

    expect(response.statusCode).toBe(400)
  })
})