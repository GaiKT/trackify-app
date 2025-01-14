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
        transaction_slip_url: string;
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
        const { transaction_name ,amount, description, account_id, currency_id, category_id , payment_type , transaction_slip_url } = request.body as ITransaction;

        if (!transaction_name || !amount || !description || !account_id || !currency_id || !category_id || !payment_type || !transaction_slip_url) {
            return reply.code(400).send({ message: 'All fields are required' });
        }

        try {
            // find account
            const account = await accountRepository.findOne({ where : { id : account_id } });

            if (!account) {
                reply.code(404).send({ 
                    message: 'Account not found' 
                });
                return;
            }

            // find currency
            const currency = await currencyRepository.findOne({ where : { id : currency_id } });

            if (!currency) {
                reply.code(404).send({ 
                    message: 'Currency not found' 
                });
                return;
            }

            // find category
            const category = await categoryRepository.findOne({ where : { id : category_id } });

            if (!category) {
                reply.code(404).send({ 
                    message: 'Category not found' 
                });
                return;
            }

            if( payment_type === 'income'){
                account.balance += amount;
            }else{
                if( account.balance < amount ){
                    return reply.code(400).send({ 
                        message: 'Insufficient funds' 
                    });
                }else{
                    account.balance -= amount;
                }
            }

        
            const transaction = new Transaction();
            transaction.transaction_name = transaction_name;
            transaction.amount = amount;
            transaction.payment_type = payment_type as PaymentType;
            transaction.description = description;
            transaction.transaction_slip_url = transaction_slip_url;
            transaction.account = account;
            transaction.currency = currency;
            transaction.category = category;
            await transactionRepository.save(transaction);

            reply.code(200).send({ 
                message: 'Transaction created successfully' 
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

    // Get all transactions with user id
    fastify.get('/all/:id', async (request, reply) => {
        const { id } = request.params as any;

        if (!id) {
            return reply.code(400).send({ message: 'User id is required' });
        }

        try {
            const user = await userRepository.findOne({ 
                where: { id },
                relations: {
                    account: {
                        transactions: {
                            currency: true,
                            category: true,
                        }
                    }
                }
            });

            if (!user) {
                return reply.code(404).send({ message: 'User not found' });
            }

            const transactions = user.account.flatMap(account => account.transactions);

            return reply.code(200).send(transactions);
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