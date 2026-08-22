const { Client } = require('pg');
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function ghGet(path) {
    const url = path.startsWith('http') ? path : `https://api.github.com${path}`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Portfolio-App',
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`GitHub API error ${res.status} for ${url}`);
    return await res.json();
}

function getRawUrl(repoFullName, branch, filePath) {
    const cleanPath = filePath.replace(/^\.?\//, '');
    return `https://raw.githubusercontent.com/${repoFullName}/${branch}/${cleanPath}`;
}

function isJunkImage(url) {
    const lower = url.toLowerCase();
    return (
        lower.includes('shields.io') ||
        lower.includes('badge') ||
        lower.includes('placeholder') ||
        lower.includes('flutter') ||
        lower.includes('dart') ||
        lower.includes('logo') ||
        lower.includes('icon') ||
        lower.includes('favicon') ||
        lower.includes('avatar') ||
        lower.includes('star') ||
        lower.includes('license') ||
        lower.includes('travis') ||
        lower.includes('workflow') ||
        lower.includes('codecov')
    );
}

async function getReadmeScreenshots(repo) {
    const screenshots = [];
    const defaultBranch = repo.default_branch || 'main';

    try {
        const readmeData = await ghGet(`/repos/${repo.full_name}/readme`);
        if (readmeData && readmeData.content) {
            const rawReadme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            const imgRegex = /!\[.*?\]\((.*?)\)|<img.*?src=["'](.*?)["']/g;
            let match;
            while ((match = imgRegex.exec(rawReadme)) !== null) {
                let imgUrl = (match[1] || match[2] || '').trim();
                imgUrl = imgUrl.split(/\s+/)[0];

                if (imgUrl && !isJunkImage(imgUrl)) {
                    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
                        screenshots.push(imgUrl);
                    } else {
                        screenshots.push(getRawUrl(repo.full_name, defaultBranch, imgUrl));
                    }
                }
            }
        }
    } catch (e) {}

    return Array.from(new Set(screenshots));
}

async function syncProjects() {
    console.log("Starting strict README screenshot sync...");
    const client = new Client({ connectionString: process.env.POSTGRES_URL });
    await client.connect();

    try {
        const repos = await ghGet('/user/repos?per_page=100&sort=updated');
        const dbProjectsRes = await client.query("SELECT * FROM projects");
        const dbProjects = dbProjectsRes.rows;

        for (const proj of dbProjects) {
            let matchedRepo = null;
            if (proj.github) {
                const cleanUrl = proj.github.replace(/\/$/, '');
                matchedRepo = repos.find(r => r.html_url.toLowerCase() === cleanUrl.toLowerCase());
            }
            if (!matchedRepo && proj.github_repo) {
                matchedRepo = repos.find(r => r.full_name.toLowerCase() === proj.github_repo.toLowerCase());
            }
            if (!matchedRepo && proj.name) {
                const cleanName = proj.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                matchedRepo = repos.find(r => r.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanName);
            }

            let validScreenshots = [];
            if (matchedRepo) {
                validScreenshots = await getReadmeScreenshots(matchedRepo);
            }

            await client.query("UPDATE projects SET images = $1 WHERE id = $2", [validScreenshots, proj.id]);
        }

        console.log("Clean sync complete!");
    } catch (err) {
        console.error("Sync error:", err);
    } finally {
        await client.end();
    }
}

syncProjects();
