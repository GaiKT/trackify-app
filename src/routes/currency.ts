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
    fastify.get('/all',{ preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            const currencies = await currencyRepository.find();

            reply.code(200).send({ 
                data: currencies
            });
        } catch (error) {
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