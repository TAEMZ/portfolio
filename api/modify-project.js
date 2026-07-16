const { Client } = require('pg');

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY in environment variables.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id, instruction } = req.body;

  if (!id || !instruction) {
    return res.status(400).json({ error: 'Missing id or instruction in request body.' });
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();

    // Fetch the current project
    const selectRes = await client.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (selectRes.rows.length === 0) {
      await client.end();
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = selectRes.rows[0];

    // Call Groq to rewrite details
    const messages = [
      {
        role: 'system',
        content: `You are an expert resume and portfolio editor. Modify the project details based on the user's instructions. 
You must respond with a JSON object containing:
- "title" (string): The updated or refined project name.
- "tech" (string): The updated or refined technology stack (delimited by " · ", e.g. "React · TypeScript · Node.js").
- "description" (string): The updated or refined 1-2 sentence description.

Keep the tone professional, results-oriented, and concise. Do not add any extra commentary or wrap outside of the JSON schema.`
      },
      {
        role: 'user',
        content: `Current Project Details:
Title: ${project.name}
Tech Stack: ${project.stack}
Description: ${project.description}

User Editing Instruction: ${instruction}`
      }
    ];

    console.log(`Calling Groq to modify project ${id} with instruction: "${instruction}"`);
    const modifiedDetails = await callGroq(messages);

    // Save modified details back to Postgres as draft
    const updateQuery = `
      UPDATE projects 
      SET name = $1, stack = $2, description = $3, created_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const updateRes = await client.query(updateQuery, [
      modifiedDetails.title,
      modifiedDetails.tech,
      modifiedDetails.description,
      id
    ]);

    await client.end();

    return res.status(200).json({
      success: true,
      message: 'Project successfully updated by Groq.',
      project: updateRes.rows[0]
    });

  } catch (error) {
    console.error('Failed to modify project:', error);
    return res.status(500).json({ error: error.message });
  }
};
