const { Pool } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: {
    // Required for Azure PostgreSQL
    rejectUnauthorized: true
  },
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

// Store the connection pool globally to reuse it across requests
let pool = null;

/**
 * Get a database connection pool.
 *
 * This function implements connection pooling - instead of creating a new connection
 * for every database query, it reuses a single pool of connections. This is important because:
 *
 * 1. Performance: Creating new connections is slow and resource-intensive
 * 2. Scalability: Limits the number of concurrent connections to the database
 * 3. Cost: Azure PostgreSQL charges per connection, so reusing connections saves money
 *
 * The pool is created only once and reused for all subsequent requests.
 */
function getConnection() {
  if (!pool) {
    pool = new Pool(config);
    console.log('Connected to Azure PostgreSQL Database');
  }
  return pool;
}

/**
 * Create database tables if they don't exist.
 * This function is called during application startup to ensure the database schema is ready.
 */
async function createTablesIfNotExists() {
  const initPool = new Pool(config);
  
  try {
    // Create Movies table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS movies (
        id uuid PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        duration_minutes int NOT NULL,
        poster_url VARCHAR(500),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
    
    await initPool.query(createTableQuery);
    console.log('Database tables checked/created successfully');
    
    
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    await initPool.end();
  }
}



module.exports = {
  createTablesIfNotExists
};