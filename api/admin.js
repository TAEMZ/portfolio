const { getPool } = require('./_db');
const { requireAdminSession } = require('./_auth');

const ALLOWED_COLUMNS = {
    projects: ['name', 'stack', 'description', 'github', 'github_repo', 'demo', 'featured', 'images', 'rank'],
    experience: ['title', 'tech', 'period', 'details'],
    skills: ['category', 'items'],
};

function pickAllowedFields(table, body) {
    const allowed = ALLOWED_COLUMNS[table] || [];
    const payload = body && typeof body === 'object' ? body : {};
    const keys = [];
    const values = [];
    let hasRankField = false;
    let parsedRankValue = null;

    for (const col of allowed) {
        if (Object.prototype.hasOwnProperty.call(payload, col) && payload[col] !== undefined) {
            if (table === 'projects' && col === 'rank') {
                hasRankField = true;
                const raw = payload[col];
                if (raw === '' || raw === null) {
                    parsedRankValue = null;
                } else {
                    const parsed = Number(raw);
                    if (!Number.isInteger(parsed) || parsed < 1) {
                        return { error: 'Project rank must be a positive whole number (1 or higher), or left blank.' };
                    }
                    parsedRankValue = parsed;
                }
            } else {
                keys.push(col);
                values.push(payload[col]);
            }
        }
    }
    return { keys, values, hasRankField, parsedRankValue };
}

async function reorderProjects(client, targetId, targetRank) {
    const orderedRes = await client.query(
        'SELECT id FROM projects ORDER BY rank ASC NULLS LAST, created_at DESC, id DESC'
    );
    const ids = orderedRes.rows.map((r) => r.id);

    if (targetId !== null && targetId !== undefined) {
        const numericTargetId = Number(targetId);
        const filtered = ids.filter((pid) => pid !== numericTargetId);
        const insertIndex =
            targetRank === null || targetRank === undefined
                ? filtered.length
                : Math.max(0, Math.min(filtered.length, targetRank - 1));
        filtered.splice(insertIndex, 0, numericTargetId);

        const ranks = filtered.map((_, i) => i + 1);
        if (filtered.length > 0) {
            await client.query(
                `UPDATE projects AS p
                 SET rank = v.new_rank
                 FROM UNNEST($1::int[], $2::int[]) AS v(id, new_rank)
                 WHERE p.id = v.id`,
                [filtered, ranks]
            );
        }
        return;
    }

    const ranks = ids.map((_, i) => i + 1);
    if (ids.length > 0) {
        await client.query(
            `UPDATE projects AS p
             SET rank = v.new_rank
             FROM UNNEST($1::int[], $2::int[]) AS v(id, new_rank)
             WHERE p.id = v.id`,
            [ids, ranks]
        );
    }
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

        if (table === 'projects') {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                switch (method) {
                    case 'POST': {
                        const { keys, values, error, hasRankField, parsedRankValue } = pickAllowedFields(table, body);
                        if (error) {
                            await client.query('ROLLBACK');
                            return res.status(400).json({ error });
                        }
                        if (keys.length === 0) {
                            await client.query('ROLLBACK');
                            return res.status(400).json({ error: 'No valid fields provided' });
                        }

                        const countRes = await client.query('SELECT COALESCE(MAX(rank), 0) + 1 AS next_rank FROM projects');
                        const tailRank = Number(countRes.rows[0]?.next_rank) || 1;
                        const insertKeys = [...keys, 'rank'];
                        const insertValues = [...values, tailRank];
                        const placeholders = insertKeys.map((_, i) => `$${i + 1}`).join(', ');
                        const insertRes = await client.query(
                            `INSERT INTO projects (${insertKeys.join(', ')}) VALUES (${placeholders}) RETURNING id`,
                            insertValues
                        );
                        const insertedId = insertRes.rows[0].id;

                        await reorderProjects(
                            client,
                            insertedId,
                            hasRankField && parsedRankValue !== null ? parsedRankValue : null
                        );

                        const finalRes = await client.query('SELECT * FROM projects WHERE id = $1', [insertedId]);
                        await client.query('COMMIT');
                        return res.status(201).json(finalRes.rows[0]);
                    }

                    case 'PUT': {
                        if (!id) {
                            await client.query('ROLLBACK');
                            return res.status(400).json({ error: 'ID required' });
                        }
                        const { keys, values, error, hasRankField, parsedRankValue } = pickAllowedFields(table, body);
                        if (error) {
                            await client.query('ROLLBACK');
                            return res.status(400).json({ error });
                        }
                        if (keys.length === 0 && !hasRankField) {
                            await client.query('ROLLBACK');
                            return res.status(400).json({ error: 'No valid fields provided' });
                        }

                        if (keys.length > 0) {
                            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
                            const updRes = await client.query(
                                `UPDATE projects SET ${setClause} WHERE id = $${keys.length + 1} RETURNING id`,
                                [...values, id]
                            );
                            if (updRes.rowCount === 0) {
                                await client.query('ROLLBACK');
                                return res.status(404).json({ error: 'Record not found' });
                            }
                        } else {
                            const existsRes = await client.query('SELECT id FROM projects WHERE id = $1', [id]);
                            if (existsRes.rowCount === 0) {
                                await client.query('ROLLBACK');
                                return res.status(404).json({ error: 'Record not found' });
                            }
                        }

                        if (hasRankField) {
                            await reorderProjects(client, id, parsedRankValue);
                        }

                        const finalRes = await client.query('SELECT * FROM projects WHERE id = $1', [id]);
                        await client.query('COMMIT');
                        return res.status(200).json(finalRes.rows[0]);
                    }

                    case 'DELETE': {
                        if (!id) {
                            await client.query('ROLLBACK');
                            return res.status(400).json({ error: 'ID required' });
                        }
                        const delRes = await client.query('DELETE FROM projects WHERE id = $1', [id]);
                        if (delRes.rowCount === 0) {
                            await client.query('ROLLBACK');
                            return res.status(404).json({ error: 'Record not found' });
                        }
                        await reorderProjects(client, null, null);
                        await client.query('COMMIT');
                        return res.status(204).end();
                    }

                    default:
                        await client.query('ROLLBACK');
                        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
                        return res.status(405).end(`Method ${method} Not Allowed`);
                }
            } catch (err) {
                await client.query('ROLLBACK').catch(() => {});
                throw err;
            } finally {
                client.release();
            }
        }

        switch (method) {
            case 'POST': {
                const { keys, values, error } = pickAllowedFields(table, body);
                if (error) {
                    return res.status(400).json({ error });
                }
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
                const { keys, values, error } = pickAllowedFields(table, body);
                if (error) {
                    return res.status(400).json({ error });
                }
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
