const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({
  path: path.join(__dirname, '..', '.env')
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 4000),

  ssl: {
    ca: fs.readFileSync(
      path.join(__dirname, '..', 'certs', 'ca.pem')
    )
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

let databaseReady = false;

const checkDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();

    databaseReady = true;

    console.log('[Database] Successfully connected to TiDB Cloud');

    connection.release();
  } catch (error) {
    databaseReady = false;

    console.error('[Database] Connection failed:', error.message);
  }
};

checkDatabaseConnection();

pool.isDatabaseAvailable = () => databaseReady;

module.exports = pool;