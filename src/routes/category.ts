import { FastifyInstance } from "fastify";
import { getDataSource } from "../database";
import { Category } from "../entity/Category";

export default async function (fastify: FastifyInstance) {
    const AppDataSource = await getDataSource();
    const categoryRepository = AppDataSource.getRepository(Category);

    interface ICategory {
        category_name: string;
    }

    interface IParams {
        id: string;
    }

    interface PaginationQuery {
        page?: number;
        limit?: number;
        search?: string;
    }

    // Create category
    fastify.post('/create', { preValidation: [fastify.authenticate] },async (request, reply) => {
        const { category_name } = request.body as ICategory;

        try {
            const category = new Category();
            category.category_name = category_name;
            await categoryRepository.save(category);

            reply.code(200).send({ 
                message: 'Category created successfully' 
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });
    
    fastify.get<{ Querystring: PaginationQuery }>(
        '/all',
        { preValidation: [fastify.authenticate] },
        async (request, reply) => {
            const { page = 1, limit = 10, search = '' } = request.query;
            const skip = (page - 1) * limit;
    
            try {
                const queryBuilder = categoryRepository
                    .createQueryBuilder('category');
    
                if (search) {
                    queryBuilder.where(
                        'category.category_name ILIKE :search',
                        { search: `%${search}%` }
                    );
                }
    
                const [categories, total] = await queryBuilder
                    .orderBy('category.category_name', 'ASC')
                    .skip(skip)
                    .take(limit)
                    .getManyAndCount();
    
                reply.code(200).send({
                    data: categories,
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page
                });
            } catch (error) {
                console.error('Category fetch error:', error);
                reply.code(500).send({
                    message: 'Failed to fetch categories',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    );
    // Get category by id
    fastify.get('/get/:id', { preValidation: [fastify.authenticate] },async (request, reply) => {
        const { id } = request.params as IParams;

        try {
            const category = await categoryRepository.findOne({where: {id}});

            if (!category) {
                return reply.code(404).send({ message: 'Category not found' });
            }

            reply.code(200).send({ 
                data: category
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    });

    // Update category
    fastify.put('/update/:id', { preValidation: [fastify.authenticate] },async (request, reply) => {
        const { id } = request.params as IParams;
        const { category_name } = request.body as ICategory;

        try {
            const category = await categoryRepository.findOne({ where: { id } });

            if (!category) {
                return reply.code(404).send({ message: 'Category not found' });
            }

            category.category_name = category_name;

            await categoryRepository.save(category);

            reply.code(200).send({ 
                message: 'Category updated successfully'
            });
        } catch (error) {
            reply.code(500).send({ 
                message: 'Internal server error: ' + error
            });
        }
    })
}