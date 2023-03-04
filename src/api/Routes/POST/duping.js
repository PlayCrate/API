const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

router.post('/bans', middleWare, async (req, res) => {
    const payload = req.body;
    if (payload.length === 0) return res.status(400).json({ success: false, error: 'No data provided.' });

    const isAlreadyBanned = await sql.query('SELECT * FROM bans WHERE roblox_id = $1', [payload[0].roblox_id]);
    if (isAlreadyBanned.rowCount > 0) return res.status(400).json({ success: false, error: 'User is already banned.' });

    for (const { roblox_id, roblox_username, item, amount } of payload) {
        if (!roblox_id || !roblox_username || !item || !amount) {
            const missingParameter = !roblox_id
                ? 'roblox_id'
                : !roblox_username
                ? 'roblox_username'
                : !item
                ? 'item'
                : 'amount';
            return res.status(400).json({ success: false, error: `Missing parameter: ${missingParameter}` });
        }

        await sql.query('INSERT INTO bans (roblox_id, roblox_username, item, amount) VALUES ($1, $2, $3, $4)', [
            roblox_id,
            roblox_username,
            item,
            amount,
        ]);
    }

    return res
        .status(200)
        .json({ success: true, message: `Successfully banned user, Inserted ${payload.length} rows.` });
});

module.exports = router;
