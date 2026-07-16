const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const getDataHandler = require('./api/get-data');
const adminHandler = require('./api/admin');
const authHandler = require('./api/auth');
const syncRepoHandler = require('./api/sync-repo');
const modifyProjectHandler = require('./api/modify-project');
const downloadResumeHandler = require('./api/download-resume');

const app = express();
const PORT = 3006;

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/api/get-data', getDataHandler);
app.post('/api/admin', adminHandler);
app.put('/api/admin', adminHandler);
app.delete('/api/admin', adminHandler);
app.post('/api/auth', authHandler);
app.post('/api/sync-repo', syncRepoHandler);
app.post('/api/modify-project', modifyProjectHandler);
app.get('/api/download-resume', downloadResumeHandler);

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
