const express = require('express');
const router = express.Router();
const sql = require('../../database/db');
const { middleWare } = require('../middleWare');

router.delete('/delete/:game/player/:player', middleWare, async (req, res) => {
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
