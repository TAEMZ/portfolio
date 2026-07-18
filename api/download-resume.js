const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function generateProjectXml(title, tech, desc) {
  // Escapes text for XML safety
  const escapeXml = (str) => (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const t = escapeXml(title);
  const techStack = escapeXml(tech);
  const d = escapeXml(desc);

  return `<w:p><w:pPr><w:spacing w:before="200" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Outfit" w:hAnsi="Outfit"/><w:b/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr><w:t>${t}</w:t></w:r></w:p>` +
         `<w:p><w:pPr><w:spacing w:before="40" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Outfit" w:hAnsi="Outfit"/><w:i/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${techStack}</w:t></w:r></w:p>` +
         `<w:p><w:pPr><w:spacing w:before="80" w:after="160" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Outfit" w:hAnsi="Outfit"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr><w:t>${d}</w:t></w:r></w:p>`;
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Fetch published projects from Postgres
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });
    await client.connect();
    
    const dbRes = await client.query("SELECT * FROM projects WHERE status = 'published' ORDER BY created_at ASC");
    const projects = dbRes.rows;
    await client.end();

    // 2. Load the base clean template
    const templatePath = path.resolve(__dirname, 'Aby_Kibru_Portfolio.docx');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }

    const content = fs.readFileSync(templatePath);
    
    const zip = new PizZip(content);
    let xmlContent = zip.file('word/document.xml').asText();

    // 3. Process each published project
    const cleanBaseName = (name) => {
      const parts = (name || '').split(/[–\-:|]/);
      let base = parts[0];
      base = base.replace(/\bnpm package\b/gi, '');
      base = base.replace(/\bweb app\b/gi, '');
      base = base.replace(/\bflutter app\b/gi, '');
      return base.trim();
    };

    const normalizeText = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedDocText = xmlContent.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const project of projects) {
      const baseName = cleanBaseName(project.name);
      const normalizedProjectName = normalizeText(baseName);
      if (normalizedDocText.includes(normalizedProjectName)) {
        // Project already exists in the baseline resume, skip duplication
        continue;
      }
      // Split the document XML into cell components
      const cells = xmlContent.split('</w:tc>');
      if (cells.length < 3) {
        throw new Error('Could not find the two columns in the resume template.');
      }
      
      const leftCellXml = cells[0];
      const rightCellXml = cells[1];
      
      // Count paragraphs in each cell
      const leftPCount = (leftCellXml.match(/<w:p\b/g) || []).length;
      const rightPCount = (rightCellXml.match(/<w:p\b/g) || []).length;
      
      const projectXml = generateProjectXml(project.name, project.stack, project.description);
      
      if (leftPCount <= rightPCount) {
        // Append to the left column cell
        cells[0] = leftCellXml + projectXml;
      } else {
        // Append to the right column cell
        cells[1] = rightCellXml + projectXml;
      }
      
      // Re-assemble the XML content
      xmlContent = cells.join('</w:tc>');
    }

    // 4. Write modified XML back into the zip
    zip.file('word/document.xml', xmlContent);
    const buffer = zip.generate({ type: 'nodebuffer' });

    // 5. Send file for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="Aby_Kibru_Portfolio.docx"');
    return res.status(200).send(buffer);

  } catch (error) {
    console.error('Failed to generate resume:', error);
    return res.status(500).json({ error: error.message });
  }
};
