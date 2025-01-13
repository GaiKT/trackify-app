import { FastifyInstance } from 'fastify';
import { Account } from '../entity/Account';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../utils/database';

export default async function (fastify: FastifyInstance) {
    const accountRepository = AppDataSource.getRepository(Account);

    interface IAccount {
        name: string;
        accountNumber: string;
        user_id: string;
        balance: number;
    }
    
    interface IParams {
        id: string;
    }

    // Create account
    fastify.post('/create', async (request, reply) => {
        const { name, accountNumber, user_id, balance } = request.body as IAccount;

        const hashAccountNumber = await bcrypt.hash(accountNumber, 10);

        const findUser = await AppDataSource.getRepository(User).findOne({ where: { id: user_id } });

        if (!findUser) {
            return reply.code(404).send({ message: 'User not found' });
        }

        try {
            // Check if account number already exists
            const existingAccount = await accountRepository.findOne({ where: { accountNumber: hashAccountNumber } });

            if (existingAccount) {
                return reply.code(400).send({ message: 'Account number already exists' });
            }

            const account = new Account();
            account.name = name;
            account.accountNumber = hashAccountNumber;
            account.balance = balance;
            account.user_id = findUser;

            await accountRepository.save(account);

            reply.code(200).send({ 
                message: 'Account created successfully' 
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

    // Get all accounts
    fastify.get('/all-account/:id', async (request, reply) => {
        const { id } = request.params as IParams;
        const account = await accountRepository.find({
            where: { user_id : {
                id : id
            } },
            relations: {
                user_id: true,
            },
        });

        if (!account) {
            reply.code(404).send({ message: 'Account not found' });
            return;
        }

        reply.code(200).send(account);
    });

    // Get account by id
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params as IParams;
        const account = await accountRepository.findOne({ where: { id }, relations: ['user_id'] });

        if (!account) {
            reply.code(404).send({ message: 'Account not found' });
            return;
        }

        reply.code(200).send(account);
    });
    
    // Update account
    fastify.put('/update/:id', async (request, reply) => {
        const { id } = request.params as IParams;
        const { name, accountNumber, balance } = request.body as IAccount;
        
        const account = await accountRepository.findOne({ where: { id } });

        if (!account) {
            reply.code(404).send({ message: 'Account not found' });
            return;
        }

        account.name = name;
        account.accountNumber = accountNumber;
        account.balance = balance;

        await accountRepository.save(account);
        reply.code(200).send({ message: 'Account updated successfully' });
    });

    // Delete account
    fastify.delete('/delete/:id', async (request, reply) => {
        const { id } = request.params as IParams;
        const account = await accountRepository.findOne({ where: { id } });

        if (!account) {
            reply.code(404).send({ message: 'Account not found' });
            return;
        }

        await accountRepository.delete({ id });
        reply.code(200).send({ message: 'Account deleted successfully' });
    });
}