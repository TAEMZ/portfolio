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

    // Save draft to Postgres DB
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });
    await client.connect();

    // Check if repo already exists in DB
    const checkRes = await client.query('SELECT * FROM projects WHERE github_repo = $1', [repoData.fullName]);
    
    if (checkRes.rows.length > 0) {
      const existingProject = checkRes.rows[0];
      // Update repo_pushed_at timestamp, but do NOT modify details or status
      await client.query('UPDATE projects SET repo_pushed_at = NOW() WHERE id = $1', [existingProject.id]);
      await client.end();

      console.log(`Project already exists for ${repoData.fullName}. Leaving title and description untouched.`);
      return res.status(200).json({
        success: true,
        message: 'Project already exists in database. Title and description left untouched.',
        project: existingProject
      });
    }

    // Groq call #1: The Judge
    const judgePrompt = [
      {
        role: 'system',
        content: `You are an expert AI evaluator for software engineering portfolios. Analyze the provided GitHub repository details to determine if it is a real, high-quality coding project built by the user that belongs on a professional resume.

Answer in JSON format with three fields:
- "is_project" (boolean): true if it represents a genuine coding project/portfolio entry, false otherwise.
- "confidence" (number 0-1): your confidence score.
- "reason" (string): a clear, brief explanation of your decision.

CRITERIA FOR REJECTION (is_project = false):
1. Boilerplate or Setup Repos: Clean configurations, empty templates, create-react-app init folders, blank repositories.
2. Minor Course/Tutorial Exercises: Standard classroom assignments (e.g., standard "To-Do app", basic calculator, hello world, simple CRUD tutorial with no custom business logic).
3. Configuration and Dotfiles: Personal system configurations, dotfiles, scripts folders, notes or documentation-only repos.
4. Forks or Direct Clones: Codebases that are forks of other repositories or have zero user modifications.
5. Incomplete/Scratchpads: Random code snippets, playgrounds, or sandbox experiments that have no structured README.

CRITERIA FOR ACCEPTANCE (is_project = true):
1. Practical Utility: An app, CLI tool, library, SDK, package, games, or algorithms that solve a real problem or serve a utility.
2. Architecture Complexity: Demonstrates custom application logic, database integration, external API integrations, real-time channels, auth, or custom utilities.
3. Originality: The repository describes features, mechanics, and design crafted by the developer rather than standard template features.`,
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
      await client.end();
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
        content: `You are an elite software resume writer. Write a highly professional resume project entry. Return a JSON object with:
- "title" (string): Concise, clean project name (remove prefixes like "my-", suffix like "App", or raw folder formatting).
- "tech" (string): Key languages, frameworks, or database technologies used, delimited by " · " (e.g., "React · TypeScript · PostgreSQL"). Prioritize the most significant, complex tech (max 3-4 items) and avoid listing generic utilities like "Git" or "HTML".
- "description" (string): Exactly 1-2 professional, highly technical resume sentences. 

GUIDELINES FOR DESCRIPTION:
1. Start with strong action verbs (e.g., "Engineers", "Implements", "Develops", "Architects", "Automates").
2. Focus on architecture, features, and technical mechanics (e.g., "uses AES-256 encryption", "features WebSockets for real-time video/voice play", "runs a server-authoritative clock").
3. Quantify performance, security focus, or developer utility where possible.
4. Eliminate marketing fluff, buzzwords (e.g., "revolutionary", "seamless", "ultimate"), and placeholder phrases. Keep it direct and resume-ready.`,
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
    const resultRow = insertRes.rows[0];
    
    await client.end();
    console.log(`Created new project draft in database for ${repoData.fullName}`);

    return res.status(200).json({
      success: true,
      message: 'Draft project successfully added in portfolio database.',
      project: resultRow
    });

  } catch (error) {
    console.error('Webhook sync failed:', error);
    return res.status(500).json({ error: error.message });
  }
};
