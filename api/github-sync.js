const { getPool } = require('./_db');
const { requireAdminSession } = require('./_auth');

async function ghGet(path, token) {
    const url = path.startsWith('http') ? path : `https://api.github.com${path}`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Portfolio-App',
            'Authorization': `token ${token}`,
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

async function getReadmeScreenshots(repo, token) {
    const screenshots = [];
    const defaultBranch = repo.default_branch || 'main';

    try {
        const readmeData = await ghGet(`/repos/${repo.full_name}/readme`, token);
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

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!requireAdminSession(req, res)) {
        return;
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'GITHUB_TOKEN is not configured on the server.' });
    }

    try {
        const pool = getPool();

        const dbProjectsRes = await pool.query("SELECT * FROM projects");
        const dbProjects = dbProjectsRes.rows;
        const repos = await ghGet('/user/repos?per_page=100&sort=updated', token);
        let updatedCount = 0;

        for (const dbProj of dbProjects) {
            let matchedRepo = null;
            if (dbProj.github) {
                const cleanUrl = dbProj.github.replace(/\/$/, '');
                matchedRepo = repos.find(r => r.html_url.toLowerCase() === cleanUrl.toLowerCase());
            }
            if (!matchedRepo && dbProj.github_repo) {
                matchedRepo = repos.find(r => r.full_name.toLowerCase() === dbProj.github_repo.toLowerCase());
            }
            if (!matchedRepo && dbProj.name) {
                const cleanProjName = dbProj.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                matchedRepo = repos.find(r => r.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanProjName || dbProj.name.toLowerCase().includes(r.name.toLowerCase()));
            }

            if (matchedRepo) {
                const screenshots = await getReadmeScreenshots(matchedRepo, token);
                await pool.query(`
                    UPDATE projects 
                    SET images = $1,
                        github_repo = COALESCE(github_repo, $2),
                        github = COALESCE(github, $3),
                        demo = COALESCE(demo, $4)
                    WHERE id = $5
                `, [screenshots, matchedRepo.full_name, matchedRepo.html_url, matchedRepo.homepage || null, dbProj.id]);
                updatedCount++;
            }
        }

        return res.status(200).json({ success: true, message: `Clean sync completed: ${updatedCount} projects updated strictly from README screenshots.` });
    } catch (err) {
        console.error("Sync error:", err);
        return res.status(500).json({ error: err.message || "Failed to sync GitHub projects" });
    }
};
