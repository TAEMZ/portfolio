const { Client } = require('pg');

// Helper to call Groq API
async function callGroq(messages, responseFormatJson = true) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY in environment variables.');
  }

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.1,
  };

  if (responseFormatJson) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  if (responseFormatJson) {
    return JSON.parse(content);
  }
  return content;
}

// Fetch repo details from GitHub
async function getRepoData(repoUrlOrName) {
  let cleanPath = repoUrlOrName.replace(/https?:\/\/github\.com\//i, '').replace(/\/$/, '');
  const parts = cleanPath.split('/');
  if (parts.length < 2) {
    throw new Error(`Invalid repository identifier: ${repoUrlOrName}`);
  }
  const owner = parts[parts.length - 2];
  const repo = parts[parts.length - 1];

  const headers = {
    'User-Agent': 'portfolio-sync',
    'Accept': 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    throw new Error(`Failed to fetch repo ${owner}/${repo}: ${repoRes.statusText}`);
  }
  const repoData = await repoRes.json();

  // Fetch languages
  const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
  const languages = langRes.ok ? Object.keys(await langRes.json()).join(', ') : '';

  // Fetch README
  let readmeText = '';
  const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
  if (readmeRes.ok) {
    const readmeJson = await readmeRes.json();
    readmeText = Buffer.from(readmeJson.content, 'base64').toString('utf8');
  } else {
    const rawReadmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`);
    if (rawReadmeRes.ok) {
      readmeText = await rawReadmeRes.text();
    }
  }

  return {
    name: repoData.name,
    fullName: repoData.full_name,
    description: repoData.description || '',
    topics: (repoData.topics || []).join(', '),
    languages,
    readmeText: readmeText.substring(0, 4000),
    stars: repoData.stargazers_count,
    githubUrl: repoData.html_url,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const repoUrl = req.body.repo_url || 
                    req.body.github_url || 
                    (req.body.repository && req.body.repository.html_url) ||
                    (typeof req.body.repository === 'string' ? req.body.repository : null);

    if (!repoUrl) {
      return res.status(400).json({ error: 'Missing repository identifier in request body.' });
    }

    console.log(`Processing repo sync for: ${repoUrl}`);
    const repoData = await getRepoData(repoUrl);

    // Groq call #1: The Judge
    const judgePrompt = [
      {
        role: 'system',
        content: `You are an AI assistant for a software developer. Evaluate if the following GitHub repository represents a real coding project (e.g., library, web app, tool, CLI, algorithm) built by the user. 
Answer in JSON format with three fields:
- "is_project" (boolean): true if it is a real portfolio-worthy project, false otherwise.
- "confidence" (number 0-1): your confidence level.
- "reason" (string): brief explanation.

Reject: forks, tutorial exercises, dotfiles, note folders, blank setups, configuration repos, and minor modifications.`,
      },
      {
        role: 'user',
        content: `Repository Name: ${repoData.name}
Description: ${repoData.description}
Topics: ${repoData.topics}
Languages: ${repoData.languages}
README Snippet:
${repoData.readmeText}`,
      },
    ];

    const judgeResult = await callGroq(judgePrompt);

    if (!judgeResult.is_project) {
      return res.status(200).json({
        success: false,
        status: 'rejected',
        reason: judgeResult.reason
      });
    }

    // Groq call #2: The Writer
    const writerPrompt = [
      {
        role: 'system',
        content: `You are a professional resume/portfolio writer. Write a project entry. Return a JSON object with:
- "title" (string): Clean, concise project name.
- "tech" (string): Key technologies used, delimited by " · " (e.g. "React · Node.js · Postgres"). Keep it to the actual main technologies.
- "description" (string): 1-2 sentences of what the project does. Focus on functionality, impact, and technology. DO NOT use generic placeholders or marketing fluff.`,
      },
      {
        role: 'user',
        content: `Repository Name: ${repoData.name}
Description: ${repoData.description}
Languages: ${repoData.languages}
README Snippet:
${repoData.readmeText}`,
      },
    ];

    const projectDetails = await callGroq(writerPrompt);

    // Save draft to Postgres DB
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });
    await client.connect();

    // Check if repo already exists in DB to prevent duplicate rows
    const checkRes = await client.query('SELECT id FROM projects WHERE github_repo = $1', [repoData.fullName]);
    
    let resultRow;
    if (checkRes.rows.length > 0) {
      // Update existing draft
      const updateQuery = `
        UPDATE projects 
        SET name = $1, stack = $2, description = $3, github = $4, status = $5, ai_reason = $6, created_at = NOW()
        WHERE id = $7
        RETURNING *
      `;
      const updateRes = await client.query(updateQuery, [
        projectDetails.title,
        projectDetails.tech,
        projectDetails.description,
        repoData.githubUrl,
        'draft', // reset to draft for review
        judgeResult.reason,
        checkRes.rows[0].id
      ]);
      resultRow = updateRes.rows[0];
      console.log(`Updated existing project draft in database for ${repoData.fullName}`);
    } else {
      // Insert new draft
      const insertQuery = `
        INSERT INTO projects (name, stack, description, github, status, ai_reason, github_repo, featured, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `;
      const insertRes = await client.query(insertQuery, [
        projectDetails.title,
        projectDetails.tech,
        projectDetails.description,
        repoData.githubUrl,
        'draft',
        judgeResult.reason,
        repoData.fullName,
        false
      ]);
      resultRow = insertRes.rows[0];
      console.log(`Created new project draft in database for ${repoData.fullName}`);
    }
    
    await client.end();

    return res.status(200).json({
      success: true,
      message: 'Draft project successfully added/updated in portfolio database.',
      project: resultRow
    });

  } catch (error) {
    console.error('Webhook sync failed:', error);
    return res.status(500).json({ error: error.message });
  }
};
