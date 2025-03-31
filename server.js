const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const apiRoutes = require('./api');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('./'));

// Parse JSON request body
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Serve index.html for all non-API routes (SPA style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
