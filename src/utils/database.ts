import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Account } from '../entity/Account';
import dotenv from 'dotenv';
import 'reflect-metadata';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User, Account],
    subscribers: [],
    migrations: [],
});