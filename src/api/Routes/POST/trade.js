const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

router.post('/trade', middleWare, async (req, res) => {
    const { roblox_id, recipient_id, items } = req.body;
    if (!roblox_id || !recipient_id || !items) {
        return res.json({ success: false, error: 'Missing parameters' });
    }

    if (roblox_id === recipient_id) {
        return res.json({ success: false, error: 'You cannot trade with yourself' });
    }

    if (items.length === 0) {
        return res.json({ success: false, error: 'You cannot trade nothing' });
    }

    try {
        await sql.query(`INSERT INTO trades (roblox_id, recipient_id, items) VALUES ($1, $2, $3)`, [
            roblox_id,
            recipient_id,
            JSON.stringify(items),
        ]);
        return res.json({ success: true, message: 'Trade successful' });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, error: 'An error occured' });
    }
});

module.exports = router;
