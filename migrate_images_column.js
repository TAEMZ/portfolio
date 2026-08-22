const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL
    });

    try {
        await client.connect();
        console.log("Connected to Neon DB.");

        // Add images column to projects if it doesn't exist
        await client.query(`
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::TEXT[];
        `);
        console.log("Added 'images' column to projects table successfully.");

        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'projects'");
        console.log("Projects table columns:", res.rows.map(r => `${r.column_name} (${r.data_type})`));
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await client.end();
    }
}

migrate();
