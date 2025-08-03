import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset: string;
}

// Get database configuration from environment variables
export const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inventory-sale-ai',
  charset: process.env.DB_CHARSET || 'utf8mb4'
};

// Create database connection pool
export const createConnectionPool = () => {
  return mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const pool = createConnectionPool();
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Get database connection
export const getConnection = async () => {
  const pool = createConnectionPool();
  return await pool.getConnection();
};

// Execute query with parameters
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  const pool = createConnectionPool();
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

// Execute multiple queries in transaction
export const executeTransaction = async (queries: Array<{ query: string; params: any[] }>): Promise<any[]> => {
  const pool = createConnectionPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const results = [];
    
    for (const { query, params } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}; 