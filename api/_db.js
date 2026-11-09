const { Pool } = require('pg');

let pool;

function getPool() {
    if (!pool) {
        if (!process.env.POSTGRES_URL) {
            throw new Error('POSTGRES_URL environment variable is not configured.');
        }
        pool = new Pool({
            connectionString: process.env.POSTGRES_URL,
            max: 5,
        });
    }
    return pool;
}

module.exports = { getPool };

