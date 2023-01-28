const express = require('express');
const router = express.Router();
const { middleWare } = require('../middleWare');
const sql = require('../../database/db');

router.post('/code', middleWare, async (req, res) => {
    const { inputCode, robloxId } = req.body;
    if (!inputCode || !robloxId) return res.status(400).json({ success: false, error: 'Missing required fields.' });
    const findCode = await sql.query(`SELECT * FROM codes WHERE code = $1`, [inputCode]);
    if (findCode.rows.length < 1) return res.status(404).json({ success: false, error: 'Invalid Code.' });

    const { used, used_by, used_date, rewards } = findCode.rows[0];
    if (used) return res.status(400).json({ success: false, error: `Code already used.`, used_by, used_date });

    try {
        await sql.query(`UPDATE codes SET used = true, used_by = $1, used_date = $2 WHERE code = $3`, [
            robloxId,
            new Date(),
            inputCode,
        ]);
        return res.status(200).json({ success: true, message: 'Code redeemed.', rewardId: rewards });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Internal Server Error.' });
    }
});

module.exports = router;
