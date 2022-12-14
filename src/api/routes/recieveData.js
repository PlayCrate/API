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

    const { robux_spent, robloxid, purchase_type } = req.body;
    if (!robux_spent || !robloxid || !purchase_type) {
        return res.json({
            success: false,
            message: 'Missing required fields',
        });
    }

    if (purchase_type !== 'product' && purchase_type !== 'gamepass') {
        return res.json({
            success: false,
            message: 'Invalid purchase type',
        });
    }

    await sql.query(`INSERT INTO robux (robloxid, robux_spent, purchase_type) VALUES ($1, $2, $3)`, [
        robloxid,
        robux_spent,
        purchase_type,
    ]);
    return res.status(200).json({
        success: true,
        message: 'Successfully added robux spent',
    });
});

module.exports = router;
