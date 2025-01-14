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

        try {
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
        const { id } = request.params as IParams;

        if(!id){
            reply.code(400).send({ 
                message: 'User id is required' 
            });
            return;
        }

        // find user id
        const user = userRepository.findOne({ where : { id } });

        if (!user) {
            reply.code(404).send({ 
                message: 'User not found' 
            });
            return;
        }

        try {
            const allTransactions = await userRepository.findOne({ 
                where : { id },
                relations : {
                    account : {
                        transactions : {
                            category : true,
                            currency : true,
                        }
                    },
                } 
    
            });
    
            reply.code(200).send(allTransactions);
            
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

    // Get transaction by id
    fastify.get('/get/:id', async (request, reply) => {
        const { id } = request.params as IParams;

        try {
            const transaction = await transactionRepository.findOne({ where: { id } });

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

    // Update transaction
    fastify.put('/update/:id', async (request, reply) => {
        const { id } = request.params as IParams;
        const { transaction_name, amount, payment_type, description, account_id, currency_id, category_id , transaction_slip_url } = request.body as ITransaction;

        const transaction = await transactionRepository.findOne({ where: { id } });

        if (!transaction) {
            reply.code(404).send({ message: 'Transaction not found' });
            return;
        }

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

        transaction.transaction_name = transaction_name;
        transaction.amount = amount;
        transaction.payment_type = payment_type as PaymentType;
        transaction.description = description;
        transaction.transaction_slip_url = transaction_slip_url;
        transaction.account = account;
        transaction.currency = currency;
        transaction.category = category;

        try {
            await transactionRepository.save(transaction);

            reply.code(200).send({ 
                message: 'Transaction updated successfully' 
            });
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