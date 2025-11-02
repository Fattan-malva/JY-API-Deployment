const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
    requestTimeout: 60000, // Increased to 60 seconds for production
    cancelTimeout: 10000, // Increased to 10 seconds
    connectionTimeout: 60000 // Increased to 60 seconds
  },
  pool: {
    max: 10, // Max connections in pool
    min: 0,
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    acquireTimeoutMillis: 60000, // Wait up to 60s for connection
    createTimeoutMillis: 30000, // Wait up to 30s to create connection
    destroyTimeoutMillis: 5000, // Wait up to 5s to destroy connection
    reapIntervalMillis: 1000, // Check for idle connections every 1s
    createRetryIntervalMillis: 200, // Retry every 200ms
  },
};

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect();
  }
  return poolPromise;
}

module.exports = { sql, getPool };
