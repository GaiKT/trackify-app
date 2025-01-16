import { FastifyInstance } from "fastify";
import { getDataSource } from "../database";
import { Transaction } from "../entity/Transaction";
import { Account } from "../entity/Account";
import { Currency } from "../entity/Currency";
import { Category } from "../entity/Category";
import { PaymentType } from "../entity/Transaction";
import { BadWordFilter } from "../utils/badwordFilter";

export default async function (fastify: FastifyInstance) {
    const AppDataSource = await getDataSource();
    const transactionRepository = AppDataSource.getRepository(Transaction);
    const accountRepository = AppDataSource.getRepository(Account);
    const currencyRepository = AppDataSource.getRepository(Currency);
    const categoryRepository = AppDataSource.getRepository(Category);

    const wordFilter = new BadWordFilter();

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
    fastify.post('/create',
        { preValidation: [fastify.authenticate] }, 
        async (request, reply) => {
        try {
            const { transaction_name, amount, description, account_id, currency_id, category_id, payment_type ,transaction_slip_url } = request.body as ITransaction;
            let transactionNameCleaned = wordFilter.clean(transaction_name);
            let descriptionCleaned = wordFilter.clean(description);

            console.log(transactionNameCleaned , descriptionCleaned);

            // Validation
            if (!transaction_name || !amount || !description || !account_id || !currency_id || !category_id || !payment_type) {
                return reply.code(400).send({ message: 'All fields are required' });
            }
    
            const transaction = new Transaction();
            transaction.transaction_name = transactionNameCleaned;
            transaction.amount = amount;
            transaction.payment_type = payment_type as PaymentType;
            transaction.description = descriptionCleaned;
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

            // amount checking
            if(transaction.amount <= account.balance ){
                return reply.code(400).send({ 
                    message: "Insufficient balance"
                });

            }

            // Update account balance
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
        search?: string;
        id: string;
    }

    // Get all transactions with user id
    fastify.get<{ Querystring: PaginationQuery; Params: { id: string } }>(
        '/all/:id',
        { preValidation: [fastify.authenticate] },
        async (request, reply) => {
          const { page = 1, limit = 10, search = '' } = request.query;
          const { id } = request.params;
          const skip = (page - 1) * limit;
      
          try {
            const queryBuilder = transactionRepository
              .createQueryBuilder('transaction')
              .leftJoinAndSelect('transaction.account', 'account')
              .leftJoinAndSelect('transaction.currency', 'currency')
              .leftJoinAndSelect('transaction.category', 'category')
              .where('account.user_id = :userId', { userId: id });
      
            if (search) {
              queryBuilder.andWhere(
                '(transaction.transaction_name ILIKE :search OR ' +
                'transaction.description ILIKE :search OR ' +
                'account.name ILIKE :search OR ' +
                'currency.currency_code ILIKE :search OR ' +
                'category.category_name ILIKE :search)',
                { search: `%${search}%` }
              );
            }
      
            const [transactions, total] = await queryBuilder
              .orderBy('transaction.created_at', 'DESC')
              .skip(skip)
              .take(limit)
              .getManyAndCount();
      
            return reply.code(200).send({
              transactions,
              totalItems: total,
              totalPages: Math.ceil(total / limit),
              currentPage: page,
            });
          } catch (error) {
            console.error('Transaction fetch error:', error);
            reply.code(500).send({ 
              message: 'Failed to fetch transactions',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      );
    

    // Get transaction by id
    fastify.get('/get/:id',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
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

    // Update transaction only slip
    fastify.put('/update/:id',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as IParams;
        const { transaction_slip_url } = request.body as ITransaction;

        const transaction = await transactionRepository.findOne({ where: { id } });

        if (!transaction) {
            reply.code(404).send({ message: 'Transaction not found' });
            return;
        }

        try {
            transaction.transaction_slip_url = transaction_slip_url;
            await transactionRepository.save(transaction);

            reply.code(200).send({ 
                message: 'Transaction slip updated successfully' 
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });


    // Delete transaction
    fastify.delete('/delete/:id',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
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