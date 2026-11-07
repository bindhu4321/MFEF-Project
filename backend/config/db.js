const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'small_business_finance',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  dateStrings: true // Return date as YYYY-MM-DD instead of JavaScript Date UTC shift
});

let databaseReady = false;

const checkDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    databaseReady = true;
    console.log(`[Database] Successfully connected to MySQL database: ${process.env.DB_NAME || 'small_business_finance'}`);
    connection.release();
  } catch (error) {
    databaseReady = false;
    console.warn('[Database] MySQL unavailable. Falling back to demo mode for login and dashboard flows.');
  }
};

checkDatabaseConnection();
pool.isDatabaseAvailable = () => databaseReady;

module.exports = pool;

