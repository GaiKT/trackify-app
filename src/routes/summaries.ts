import { FastifyInstance } from "fastify";
import { getDataSource } from "../database";
import { Transaction } from "../entity/Transaction";

interface Summary {
  totalIncome: number;
  totalExpense: number;
  transactions: Transaction[];
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export default async function (fastify: FastifyInstance) {
  const AppDataSource = await getDataSource();
  const transactionRepository = AppDataSource.getRepository(Transaction);

  // Daily Summary
  fastify.get('/daily/:userId/:date', async (request, reply) => {
    const { userId, date } = request.params as { userId: string, date: string };
    const startDate = new Date(date);
    startDate.setHours(0,0,0,0);
    const endDate = new Date(date);
    endDate.setHours(23,59,59,999);

    return await getSummary(userId, { startDate, endDate });
  });

  // Monthly Summary
  fastify.get('/monthly/:userId/:year/:month', async (request, reply) => {
    const { userId, year, month } = request.params as { userId: string, year: string, month: string };
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    return await getSummary(userId, { startDate, endDate });
  });

  // Yearly Summary
  fastify.get('/yearly/:userId/:year', async (request, reply) => {
    const { userId, year } = request.params as { userId: string, year: string };
    const startDate = new Date(parseInt(year), 0, 1);
    const endDate = new Date(parseInt(year), 11, 31);

    return await getSummary(userId, { startDate, endDate });
  });

  // Custom Range Summary
  fastify.get('/range/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { startDate, endDate } = request.query as { startDate: string, endDate: string };

    return await getSummary(userId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  });

  async function getSummary(userId: string, dateRange: DateRange): Promise<Summary> {
    const transactions = await transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .where('account.user_id = :userId', { userId })
      .andWhere('transaction.created_at BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      .getMany();

    const summary: Summary = {
      totalIncome: transactions
        .filter(t => t.payment_type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalExpense: transactions
        .filter(t => t.payment_type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      transactions: transactions,
    };
    
    return summary;
  }
}