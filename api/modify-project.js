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
      temperature: 0.3,
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

  const { id, instruction, message } = req.body;
  const userMessage = instruction || message;

  if (!id || !userMessage) {
    return res.status(400).json({ error: 'Missing id or message in request body.' });
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();

    // 1. Fetch current project
    const selectRes = await client.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (selectRes.rows.length === 0) {
      await client.end();
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = selectRes.rows[0];

    // 2. Parse and update chat history
    let chatHistory = [];
    if (project.chat_history) {
      chatHistory = typeof project.chat_history === 'string' 
        ? JSON.parse(project.chat_history) 
        : project.chat_history;
    }
    
    // Add user's new message to the history
    chatHistory.push({ role: 'user', content: userMessage });

    // 3. Build messages array for Groq with system instructions
    const systemPrompt = {
      role: 'system',
      content: `You are an expert resume and portfolio editor. The user is reviewing a project draft in their CMS.
Your goal is to help them refine the project title, tech stack, and description through a conversational chat thread.

Current Draft Details:
- Title: ${project.name}
- Tech Stack: ${project.stack}
- Description: ${project.description}

You must respond with a JSON object containing:
- "title" (string): The updated or refined project name.
- "tech" (string): The updated or refined tech stack (delimited by " · ", e.g. "React · TypeScript · Node.js").
- "description" (string): The updated or refined 1-2 sentence description.
- "reply" (string): A brief, helpful reply to the user explaining your changes in a friendly, conversational manner.

Keep the tone professional, results-oriented, and concise. Do not add any extra commentary outside of the JSON schema.`
    };

    const messagesForGroq = [systemPrompt, ...chatHistory];

    console.log(`Calling Groq to chat for project ${id} with message: "${userMessage}"`);
    const modifiedDetails = await callGroq(messagesForGroq);

    // 4. Append assistant's response to history
    chatHistory.push({ role: 'assistant', content: modifiedDetails.reply });

    // 5. Update Postgres row with new details and history
    const updateQuery = `
      UPDATE projects 
      SET name = $1, stack = $2, description = $3, chat_history = $4, created_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const updateRes = await client.query(updateQuery, [
      modifiedDetails.title,
      modifiedDetails.tech,
      modifiedDetails.description,
      JSON.stringify(chatHistory),
      id
    ]);

    await client.end();

    return res.status(200).json({
      success: true,
      message: 'Project updated and chat message added.',
      project: updateRes.rows[0]
    });

  } catch (error) {
    console.error('Failed to modify project:', error);
    return res.status(500).json({ error: error.message });
  }
};
