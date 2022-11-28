const express = require('express');
const router = express.Router();
const sql = require('../../database/db');
const { twitter } = require('../../../config.json');

router.delete('/delete/:game/player/:player', async (req, res) => {
    const { authorization } = req.headers;
    if (!authorization || authorization !== twitter.API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }
    const { game, player } = req.params;
    if (!player || !/^[A-Z_\d]{2,30}$/i.test(player)) {
        return res.json({
            success: false,
            message: 'malformed username parameter',
        });
    }

    const findUserInDB = await sql.query(`SELECT * FROM users WHERE robloxid = '${player}' AND game_id = '${game}'`);
    if (findUserInDB.rows.length === 0) {
        return res.json({
            success: false,
            message: 'User not in database',
        });
    }

    try {
        await sql.query(`DELETE FROM users WHERE robloxid = '${player}' AND game_id = '${game}'`);
        return res.json({
            success: true,
            message: 'User deleted',
        });
    } catch (err) {
        return res.json({
            success: false,
            message: 'Something went wrong',
        });
    }
});

module.exports = router;
