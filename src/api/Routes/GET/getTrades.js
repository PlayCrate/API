const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

router.get('/trade-history/:robloxID', middleWare, async (req, res) => {
    const { robloxID } = req.params;
    if (!robloxID) {
        return res.json({ success: false, error: 'Missing parameters' });
    }

    const getTrades = await sql.query(`SELECT * FROM trades WHERE roblox_id = $1`, [robloxID]);
    if (getTrades.rows.length === 0) {
        return res.json({ success: false, error: 'No trades found' });
    }

    const tradesMap = getTrades.rows.map(({ roblox_id, recipient_id, items, trade_date }) => {
        return {
            roblox_id: roblox_id,
            recipient_id: recipient_id,
            items: items,
            trade_date: trade_date,
        };
    });

    return res.json({ success: true, trades: tradesMap });
});

module.exports = router;
