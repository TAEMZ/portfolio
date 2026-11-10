const { getPool } = require('./_db');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { table } = req.query;

    if (!['projects', 'experience', 'skills'].includes(table)) {
        return res.status(400).json({ error: 'Invalid table' });
    }

    try {
        const pool = getPool();
        res.setHeader('Cache-Control', 'no-store');
        const orderBy =
            table === 'projects'
                ? 'rank ASC NULLS LAST, created_at DESC, id DESC'
                : table === 'skills'
                ? 'created_at ASC'
                : 'created_at DESC';
        const result = await pool.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
