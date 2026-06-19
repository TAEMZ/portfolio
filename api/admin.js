const { Client } = require('pg');
const { AnswerEdge } = require('@answeredge/sdk');

// Initialize AnswerEdge
AnswerEdge.init({
    apiKey: process.env.ANSWEREDGE_API_KEY,
    endpoint: "https://eight-brave-soviet-principle.trycloudflare.com",
});

module.exports = async function handler(req, res) {
    // Track this API request
    await AnswerEdge.trackNow({
        userAgent: req.headers['user-agent'],
        path: req.url,
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    });
    const { table, id } = req.query;
    const { method, body } = req;

    if (!['projects', 'experience', 'skills'].includes(table)) {
        return res.status(400).json({ error: 'Invalid table' });
    }

    const client = new Client({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        await client.connect();

        switch (method) {
            case 'POST': {
                const keys = Object.keys(body);
                const values = Object.values(body);
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
                const result = await client.query(query, values);
                return res.status(201).json(result.rows[0]);
            }

            case 'PUT': {
                if (!id) return res.status(400).json({ error: 'ID required' });
                const keys = Object.keys(body);
                const values = Object.values(body);
                const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
                const query = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
                const result = await client.query(query, [...values, id]);
                return res.status(200).json(result.rows[0]);
            }

            case 'DELETE': {
                if (!id) return res.status(400).json({ error: 'ID required' });
                await client.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
                return res.status(204).end();
            }

            default:
                res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.end();
    }
};
