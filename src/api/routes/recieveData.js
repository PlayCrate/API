const express = require('express');
const router = express.Router();
const { twitter } = require('../../../config.json');
const sql = require('../../database/db');

router.post('/robux', async (req, res) => {
    const { authorization } = req.headers;
    if (!authorization || authorization !== twitter.API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }

    const { robux_spent, robloxid } = req.body;
    if (!robux_spent || !robloxid) {
        return res.json({
            success: false,
            message: 'Missing required fields',
        });
    }

    await sql.query(`INSERT INTO robux (robloxid, robux_spent) VALUES ($1, $2)`, [robloxid, robux_spent]);
    return res.status(200).json({
        success: true,
        message: 'Successfully added robux spent',
    });
});

module.exports = router;
