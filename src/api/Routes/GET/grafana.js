const express = require('express');
const router = express.Router();
const { register } = require('../../../utility/roblox/register');

router.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register?.contentType);
    res.end(await register?.metrics());
});

module.exports = router;
