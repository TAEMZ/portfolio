const { Client } = require('pg');

module.exports = async function handler(req, res) {
  try {
    const headers = {
      'User-Agent': 'portfolio-sync',
      'Accept': 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch all repositories owned by the user from GitHub
    const githubRes = await fetch(`https://api.github.com/user/repos?per_page=100&type=owner`, { headers });
    if (!githubRes.ok) {
      const errText = await githubRes.text();
      throw new Error(`GitHub API error (${githubRes.status}): ${errText}`);
    }
    const githubRepos = await githubRes.json();

    // 2. Fetch existing repositories from database
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });
    await client.connect();

    const dbRes = await client.query('SELECT github_repo FROM projects WHERE github_repo IS NOT NULL');
    await client.end();

    const dbRepoNames = new Set(dbRes.rows.map(row => row.github_repo.toLowerCase()));

    // 3. Find repos on GitHub that:
    //    - Are not forks
    //    - Do not already exist in the database
    //    - Have been active/pushed to within the last 3 days (to prevent importing old history and saving tokens)
    const thresholdTime = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

    const newRepos = githubRepos
      .filter(repo => {
        const isNotFork = !repo.fork;
        const notInDb = !dbRepoNames.has(repo.full_name.toLowerCase());
        const pushedRecently = new Date(repo.pushed_at) > thresholdTime;
        return isNotFork && notInDb && pushedRecently;
      })
      .map(repo => repo.html_url);

    return res.status(200).json({
      success: true,
      new_repos: newRepos
    });

  } catch (error) {
    console.error('Scan all repos failed:', error);
    return res.status(500).json({ error: error.message });
  }
};
