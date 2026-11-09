const { getPool } = require('./_db');
const {
    safeEqualStrings,
    setUnlockCookie,
    setSessionCookie,
    clearAuthCookies,
    isUnlocked,
    isAdminAuthenticated,
} = require('./_auth');

module.exports = async function handler(req, res) {
    const { action } = req.query;

    if (req.method === 'GET' && action === 'session') {
        try {
            return res.status(200).json({
                authenticated: isAdminAuthenticated(req),
                unlocked: isUnlocked(req),
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end();
    }

    if (action === 'logout') {
        clearAuthCookies(req, res);
        return res.status(200).json({ success: true });
    }

    const { value, email, password } = req.body || {};

    try {
        const pool = getPool();

        if (action === 'unlock') {
            if (typeof value !== 'string' || !value) {
                return res.status(400).json({ error: 'Access word is required' });
            }
            const result = await pool.query("SELECT value FROM secrets WHERE name = 'admin_access_code'");
            const dbCode = result.rows[0]?.value;
            if (dbCode && safeEqualStrings(dbCode, value)) {
                setUnlockCookie(req, res);
                return res.status(200).json({ success: true });
            }
            return res.status(401).json({ error: 'Incorrect access word' });
        }

        if (action === 'login') {
            if (!isUnlocked(req)) {
                return res.status(401).json({ error: 'Security check required first' });
            }
            if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const emailRes = await pool.query("SELECT value FROM secrets WHERE name = 'admin_email'");
            const passRes = await pool.query("SELECT value FROM secrets WHERE name = 'admin_password'");

            const dbEmail = emailRes.rows[0]?.value;
            const dbPass = passRes.rows[0]?.value;

            if (dbEmail && dbPass && safeEqualStrings(dbEmail, email) && safeEqualStrings(dbPass, password)) {
                setSessionCookie(req, res);
                return res.status(200).json({ success: true });
            }
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
