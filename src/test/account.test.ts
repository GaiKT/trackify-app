import { buildTest } from '../helper';
import { AppDataSource } from '../utils/database';
import { Account } from '../entity/Account';
import { User } from '../entity/User';
import 'reflect-metadata';

describe('Account Routes', () => {
    const app = buildTest();
    let accountRepository: any;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }
        accountRepository = AppDataSource.getRepository(Account);
      });
    
      beforeEach(async () => {
        await accountRepository.clear();
      });
    
      afterAll(async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }
      });

    it('should create a new account', async () => {
        const user = new User();
        user.username = 'testuser';
        user.password = 'password';
        user.firstname = 'Test';
        user.lastname = 'User';
        await AppDataSource.getRepository(User).save(user);

        const response = await app.inject({
            method: 'POST',
            url: '/account/create',
            payload: {
                name: 'Test Account',
                accountNumber: '1234567890',
                user_id: user.id,
                balance: 1000,
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toBe('Account created successfully');
    });

    it('should get all accounts for a user', async () => {  

        const testUser = new User();
        testUser.username = 'testuser';
        testUser.password = 'password';
        testUser.firstname = 'Test';
        testUser.lastname = 'User';
        await AppDataSource.getRepository(User).save(testUser);

        const testAccount = new Account();
        testAccount.name = 'Test Account';
        testAccount.accountNumber = '1234567890';
        testAccount.balance = 1000;
        testAccount.user_id = testUser;
        await AppDataSource.getRepository(Account).save(testAccount);

        const testAccount2 = new Account();
        testAccount2.name = 'Test Account 2';
        testAccount2.accountNumber = '0987654321';
        testAccount2.balance = 2000;
        testAccount2.user_id = testUser;
        await AppDataSource.getRepository(Account).save(testAccount2);

        const response = await app.inject({
            method: 'GET',
            url: '/account/all-account/' + testUser.id,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().length).toBeGreaterThan(0);
    });

    it('should get an account by id', async () => {

        const testUser = new User();
        testUser.username = 'testuser';
        testUser.password = 'password';
        testUser.firstname = 'Test';
        testUser.lastname = 'User';
        await AppDataSource.getRepository(User).save(testUser);

        const testAccount = new Account();
        testAccount.name = 'Test Account';
        testAccount.accountNumber = '1234567890';
        testAccount.balance = 1000;
        testAccount.user_id = testUser;
        await AppDataSource.getRepository(Account).save(testAccount);

        const response = await app.inject({
            method: 'GET',
            url: `/account/${testAccount.id}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().name).toBe('Test Account');
    });

    it('should update an account', async () => {
        const testUser = new User();
        testUser.username = 'testuser';
        testUser.password = 'password';
        testUser.firstname = 'Test';
        testUser.lastname = 'User';
        await AppDataSource.getRepository(User).save(testUser);

        const testAccount = new Account();
        testAccount.name = 'Test Account';
        testAccount.accountNumber = '1234567890';
        testAccount.balance = 1000;
        testAccount.user_id = testUser;
        await AppDataSource.getRepository(Account).save(testAccount);
        
        const response = await app.inject({
            method: 'PUT',
            url: `/account/update/${testAccount.id}`,
            payload: {
                name: 'Updated Account',
                accountNumber: '0987654321',
                balance: 2000,
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toBe('Account updated successfully');
    });

    it('should delete an account', async () => {
        const testUser = new User();
        testUser.username = 'testuser';
        testUser.password = 'password';
        testUser.firstname = 'Test';
        testUser.lastname = 'User';
        await AppDataSource.getRepository(User).save(testUser);

        const testAccount = new Account();
        testAccount.name = 'Test Account';
        testAccount.accountNumber = '1234567890';
        testAccount.balance = 1000;
        testAccount.user_id = testUser;
        await AppDataSource.getRepository(Account).save(testAccount);

        const response = await app.inject({
            method: 'DELETE',
            url: `/account/delete/${testAccount.id}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toBe('Account deleted successfully');
    });
});
