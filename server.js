const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const getDataHandler = require('./api/get-data');
const adminHandler = require('./api/admin');
const authHandler = require('./api/auth');

const app = express();
const PORT = 3006;

app.use(express.json());

app.get('/api/get-data', getDataHandler);
app.post('/api/admin', adminHandler);
app.put('/api/admin', adminHandler);
app.delete('/api/admin', adminHandler);
app.post('/api/auth', authHandler);

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
