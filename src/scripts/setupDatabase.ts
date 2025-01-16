import { Client } from 'pg';
import dotenv from 'dotenv';
import { AppDataSource } from '../database';

dotenv.config();

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    // Connect to postgres
    await client.connect();
    
    // Check if database exists
    const dbExists = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`
    );

    // Create database if not exists
    if (dbExists.rows.length === 0) {
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created.`);
    }

    // Initialize TypeORM connection
    await AppDataSource.initialize();
    console.log("Database connection initialized.");

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();