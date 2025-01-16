import { FastifyInstance } from "fastify";
import { getDataSource } from "../database";
import { Currency } from "../entity/Currency";

export default async function (fastify: FastifyInstance) {
    const AppDataSource = await getDataSource();
    const currencyRepository = AppDataSource.getRepository(Currency);

    interface ICurrency {
        currency_name: string;
        currency_code: string;
    }

    interface IParams {
        id: string;
    }

    interface PaginationQuery {
        page?: number;
        limit?: number;
        search?: string;
    }

    // Create currency
    fastify.post('/create',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { currency_name, currency_code } = request.body as ICurrency;

        try {
            const currency = new Currency();
            currency.currency_name = currency_name;
            
            currency.currency_code = currency_code;
            await currencyRepository.save(currency);

            reply.code(200).send({ 
                message: 'Currency created successfully' 
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

    // Get all currencies
    fastify.get<{ Querystring: PaginationQuery }>('/all',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
        
        const { page = 1, limit = 10, search = '' } = request.query;
        const skip = (page - 1) * limit;

        try {
            const queryBuilder = currencyRepository
            .createQueryBuilder('currency');

            if (search) {
                queryBuilder.where(
                    'currency.currency_name ILIKE :search OR currency.currency_code ILIKE :search',
                    { search: `%${search}%` }
                );
            }

            const [currencies, total] = await queryBuilder
            .orderBy('currency.currency_name', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

            reply.code(200).send({ 
                data: currencies,
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            });

        } catch (error) {
            console.log(error);
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

    // Get currency by id
    fastify.get('/get/:id',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as IParams;

        try {
            const currency = await currencyRepository.findOne({where: {id}});

            if (!currency) {
                return reply.code(404).send({ message: 'Currency not found' });
            }

            reply.code(200).send({ 
                data: currency
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

    // Update currency
    fastify.put('/update/:id',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as IParams;
        const { currency_name, currency_code } = request.body as ICurrency;

        const currency = await currencyRepository.findOne({ where: { id } });

        if (!currency) {
            reply.code(404).send({ message: 'Currency not found' });
            return;
        }

        currency.currency_name = currency_name;
        currency.currency_code = currency_code;

        try {
            await currencyRepository.save(currency);

            reply.code(200).send({ 
                message: 'Currency updated successfully' 
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

    // Delete currency
    fastify.delete('/delete/:id',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as IParams;

        const currency = await currencyRepository.findOne({ where: { id } });

        if (!currency) {
            reply.code(404).send({ message: 'Currency not found' });
            return;
        }

        try {
            await currencyRepository.remove(currency);

            reply.code(200).send({ 
                message: 'Currency deleted successfully' 
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

}