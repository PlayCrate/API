const express = require('express');
const router = express.Router();
const { middleWare } = require('../middleWare');
const sql = require('../../database/db');

router.post('/robux', middleWare, async (req, res) => {
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
