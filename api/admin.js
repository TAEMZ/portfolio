const { getPool } = require('./_db');
const { requireAdminSession } = require('./_auth');

const ALLOWED_COLUMNS = {
    projects: ['name', 'stack', 'description', 'github', 'github_repo', 'demo', 'featured', 'images'],
    experience: ['title', 'tech', 'period', 'details'],
    skills: ['category', 'items'],
};

function pickAllowedFields(table, body) {
    const allowed = ALLOWED_COLUMNS[table] || [];
    const payload = body && typeof body === 'object' ? body : {};
    const keys = [];
    const values = [];

    for (const col of allowed) {
        if (Object.prototype.hasOwnProperty.call(payload, col) && payload[col] !== undefined) {
            keys.push(col);
            values.push(payload[col]);
        }
    }
    return { keys, values };
}

module.exports = async function handler(req, res) {
    if (!requireAdminSession(req, res)) {
        return;
    }

    const { table, id } = req.query;
    const { method, body } = req;

    if (!Object.prototype.hasOwnProperty.call(ALLOWED_COLUMNS, table)) {
        return res.status(400).json({ error: 'Invalid table' });
    }

    try {
        const pool = getPool();

        switch (method) {
            case 'POST': {
                const { keys, values } = pickAllowedFields(table, body);
                if (keys.length === 0) {
                    return res.status(400).json({ error: 'No valid fields provided' });
                }
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
                const result = await pool.query(query, values);
                return res.status(201).json(result.rows[0]);
            }

            case 'PUT': {
                if (!id) return res.status(400).json({ error: 'ID required' });
                const { keys, values } = pickAllowedFields(table, body);
                if (keys.length === 0) {
                    return res.status(400).json({ error: 'No valid fields provided' });
                }
                const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
                const query = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
                const result = await pool.query(query, [...values, id]);
                if (result.rowCount === 0) {
                    return res.status(404).json({ error: 'Record not found' });
                }
                return res.status(200).json(result.rows[0]);
            }

            case 'DELETE': {
                if (!id) return res.status(400).json({ error: 'ID required' });
                const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
                if (result.rowCount === 0) {
                    return res.status(404).json({ error: 'Record not found' });
                }
                return res.status(204).end();
            }

            default:
                res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
