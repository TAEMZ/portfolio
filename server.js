const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const getDataHandler = require('./api/get-data');
const adminHandler = require('./api/admin');
const authHandler = require('./api/auth');
const githubSyncHandler = require('./api/github-sync');

const app = express();
const PORT = process.env.SERVER_PORT || 3006;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.get('/api/get-data', getDataHandler);
app.post('/api/admin', adminHandler);
app.put('/api/admin', adminHandler);
app.delete('/api/admin', adminHandler);
app.get('/api/auth', authHandler);
app.post('/api/auth', authHandler);
app.post('/api/github-sync', githubSyncHandler);

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
