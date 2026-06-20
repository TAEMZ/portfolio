const { Client } = require('pg');

module.exports = async function handler(req, res) {
    const { table } = req.query;
    
    if (!['projects', 'experience', 'skills'].includes(table)) {
        return res.status(400).json({ error: 'Invalid table' });
    }

    const client = new Client({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        await client.connect();
        const result = await client.query(`SELECT * FROM ${table} ORDER BY created_at ${table === 'skills' ? 'ASC' : 'DESC'}`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.end();
    }
};
