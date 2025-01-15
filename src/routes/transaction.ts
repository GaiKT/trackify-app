import { FastifyInstance } from "fastify";
import { getDataSource } from "../database";
import { Transaction } from "../entity/Transaction";
import { Account } from "../entity/Account";
import { Currency } from "../entity/Currency";
import { Category } from "../entity/Category";
import { PaymentType } from "../entity/Transaction";
import { User } from "../entity/User";


export default async function (fastify: FastifyInstance) {
    const AppDataSource = await getDataSource();
    const transactionRepository = AppDataSource.getRepository(Transaction);
    const accountRepository = AppDataSource.getRepository(Account);
    const currencyRepository = AppDataSource.getRepository(Currency);
    const categoryRepository = AppDataSource.getRepository(Category);
    const userRepository = AppDataSource.getRepository(User);

    interface ITransaction {
        transaction_name: string;
        amount: number;
        transaction_slip_url?: string;
        payment_type: string;
        description: string;
        account_id: string;
        currency_id: string;
        category_id: string;
    }

    interface IParams {
        id: string;
    }



    // Create transaction
    fastify.post('/create', async (request, reply) => {
        try {
            const { transaction_name, amount, description, account_id, currency_id, category_id, payment_type ,transaction_slip_url } = request.body as ITransaction;
            
            // Validation
            if (!transaction_name || !amount || !description || !account_id || !currency_id || !category_id || !payment_type) {
                return reply.code(400).send({ message: 'All fields are required' });
            }
    
            const transaction = new Transaction();
            transaction.transaction_name = transaction_name;
            transaction.amount = amount;
            transaction.payment_type = payment_type as PaymentType;
            transaction.description = description;
            transaction.transaction_slip_url = transaction_slip_url;

    
            const [account, currency, category] = await Promise.all([
                accountRepository.findOne({ where: { id: account_id } }),
                currencyRepository.findOne({ where: { id: currency_id } }),
                categoryRepository.findOne({ where: { id: category_id } })
            ]);
    
            if (!account || !currency || !category) {
                return reply.code(404).send({ 
                    message: 'Account, Currency or Category not found' 
                });
            }

            // amount calculate
            if(transaction.payment_type == PaymentType.EXPENSE){
                account.balance -= amount;
                await accountRepository.save(account);
            }else{
                account.balance += amount;
                await accountRepository.save(account);
            }
    
            transaction.account = account;
            transaction.currency = currency;
            transaction.category = category;
    
            await transactionRepository.save(transaction);
            
            reply.code(201).send({ 
                message: 'Transaction created successfully'
            });
        } catch (error) {
            console.error('Transaction creation error:', error);
            reply.code(500).send({ 
                message: 'Error creating transaction',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    interface PaginationQuery {
        page?: number;
        limit?: number;
        id: string;
    }

    // Get all transactions with user id
    fastify.get<{ Querystring: PaginationQuery; Params: { id: string } }>('/all/:id', async (request, reply) => {
        const { page = 1, limit = 10 } = request.query;
        const { id } = request.params;
    
        const skip = (page - 1) * limit;
    
        if (!id) {
            return reply.code(400).send({ message: 'User id is required' });
        }
    
        try {
            const user = await userRepository.findOne({
                where: { id },
                select: {
                    id: true,
                    username: true,
                    account: {
                        id: true,
                        name: true,
                        transactions: {
                            id: true,
                            transaction_name: true,
                            amount: true,
                            payment_type: true,
                            description: true,
                            transaction_slip_url: true,
                            created_at: true,
                            currency: {
                                currency_code: true,
                            },
                            category: {
                                category_name: true,
                            },
                        },
                    },
                },
                relations: {
                    account: {
                        transactions: {
                            currency: true,
                            category: true,
                            account: true,
                        },
                    },
                },
            });
    
            if (!user) {
                return reply.code(404).send({ message: 'User not found' });
            }
    
            const transactions = user.account.flatMap((account) => account.transactions);
    
            const paginatedTransactions = transactions.slice(skip, skip + limit);
    
            return reply.code(200).send({
                transactions: paginatedTransactions,
                totalItems: transactions.length,
                totalPages: Math.ceil(transactions.length / limit),
                currentPage: page,
            });
        } catch (error) {
            reply.code(500).send({ message: 'Internal server error: ' + error});
        }
    });
    

    // Get transaction by id
    fastify.get('/get/:id', async (request, reply) => {
        const { id } = request.params as IParams;

        try {
            const transaction = await transactionRepository.findOne({ 
                where: { id } , 
                relations: {
                    account: true,
                    currency: true,
                    category: true
                } 
            });    

            if (!transaction) {
                return reply.code(404).send({ message: 'Transaction not found' });
            }

            reply.code(200).send(transaction);
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

    // Delete transaction
    fastify.delete('/delete/:id', async (request, reply) => {
        const { id } = request.params as IParams;

        const transaction = await transactionRepository.findOne({ where: { id } });

        if (!transaction) {
            reply.code(404).send({ message: 'Transaction not found' });
            return;
        }

        try {
            await transactionRepository.remove(transaction);

            reply.code(200).send({ 
                message: 'Transaction deleted successfully' 
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });
}