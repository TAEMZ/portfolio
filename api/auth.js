const { Client } = require('pg');

module.exports = async function handler(req, res) {
    const { action } = req.query;
    const { value, email, password } = req.body;

    if (req.method !== 'POST') return res.status(405).end();

    const client = new Client({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        await client.connect();

        if (action === 'unlock') {
            const result = await client.query("SELECT value FROM secrets WHERE name = 'admin_access_code'");
            if (result.rows.length > 0 && result.rows[0].value === value) {
                return res.status(200).json({ success: true });
            }
            return res.status(401).json({ error: 'Incorrect access word' });
        }

        if (action === 'login') {
            const emailRes = await client.query("SELECT value FROM secrets WHERE name = 'admin_email'");
            const passRes = await client.query("SELECT value FROM secrets WHERE name = 'admin_password'");

            const dbEmail = emailRes.rows[0]?.value;
            const dbPass = passRes.rows[0]?.value;

            if (dbEmail === email && dbPass === password) {
                // In a real app, you'd set a cookie or JWT here.
                // For this portfolio, we'll return success and the frontend will manage state.
                return res.status(200).json({ success: true });
            }
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(400).json({ error: 'Invalid action' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.end();
    }
};
