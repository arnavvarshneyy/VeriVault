// Test endpoint to check environment variables
const express = require('express');
const app = express();

app.get('/test-env', (req, res) => {
  res.json({
    PINATA_JWT: process.env.PINATA_JWT ? 'SET' : 'NOT SET',
    RPC_URL: process.env.RPC_URL ? 'SET' : 'NOT SET',
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS ? 'SET' : 'NOT SET',
    IPFS_GATEWAY: process.env.IPFS_GATEWAY || 'DEFAULT'
  });
});

module.exports = app;
