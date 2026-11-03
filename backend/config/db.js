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

// Test connection on boot
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${process.env.DB_NAME}`);
    connection.release();
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
  }
})();

module.exports = pool;

