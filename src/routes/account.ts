import { FastifyInstance } from 'fastify';
import { Account } from '../entity/Account';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';
import { getDataSource } from '../database';

export default async function (fastify: FastifyInstance) {
    const AppDataSource = await getDataSource();
    const accountRepository = AppDataSource.getRepository(Account);
    const userRepository = AppDataSource.getRepository(User);

    interface IAccount {
        name: string;
        accountNumber: string;
        user_id: string;
        balance: number;
    }
    
    interface IParams {
        id: string;
    }

    interface PaginationQuery {
        page?: number;
        limit?: number;
        search?: string;
    }

    // Create account
    fastify.post('/create',{ preValidation: [fastify.authenticate] },  async (request, reply) => {
        const { name, accountNumber, user_id, balance } = request.body as IAccount;

        const hashAccountNumber = await bcrypt.hash(accountNumber, 10);

        const findUser = await userRepository.findOne({ where: { id: user_id } });

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
    
    // Get all accounts with pagination and search
    fastify.get<{ Querystring: PaginationQuery; Params: { id: string } }>(
        '/all-account/:id',
        { preValidation: [fastify.authenticate] }, 
        async (request, reply) => {
            const { id } = request.params;
            const { page = 1, limit = 10, search = '' } = request.query;
            const skip = (page - 1) * limit;
    
            try {
                const queryBuilder = accountRepository
                    .createQueryBuilder('account')
                    .leftJoinAndSelect('account.user_id', 'user')
                    .where('user.id = :userId', { userId: id });
    
                if (search) {
                    queryBuilder.andWhere(
                        'account.name ILIKE :search',
                        { search: `%${search}%` }
                    );
                }
    
                const [accounts, total] = await queryBuilder
                    .orderBy('account.created_at', 'DESC')
                    .skip(skip)
                    .take(limit)
                    .getManyAndCount();
    
                return reply.code(200).send({
                    accounts,
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page
                });
            } catch (error) {
                console.error('Account fetch error:', error);
                reply.code(500).send({
                    message: 'Failed to fetch accounts',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    );

    // Get account by id
    fastify.get('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as IParams;
        const account = await accountRepository.findOne({ where: { id }, relations: ['user_id'] });

        if (!account) {
            reply.code(404).send({ message: 'Account not found' });
            return;
        }

        reply.code(200).send(account);
    });
    
    // Update account
    fastify.put('/update/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
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
    fastify.delete('/delete/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
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