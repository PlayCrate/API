const express = require('express');
const router = express.Router();
const sql = require('../../database/db');
const { middleWare } = require('../middleWare');

router.get('/check/:game', middleWare, async (req, res) => {
    const { player } = req.query;
    const { game } = req.params;
    if (!/^[A-Z_\d]{2,30}$/i.test(player)) {
        return res.json({
            success: false,
            message: 'malformed username parameter',
        });
    }

    if (player) {
        const findUserInDB = await sql.query(
            `SELECT * FROM users WHERE robloxid = '${player}' AND game_id = '${game}'`
        );
        if (findUserInDB.rows.length === 0) {
            return res.json({
                success: false,
                message: 'User not in database',
            });
        }

        const {
            username: robloxInput,
            twitter_id,
            robloxid,
            follow_date,
            game_id,
            twitter_account,
        } = findUserInDB.rows[0];

        return res.json({
            success: true,
            data: {
                user_input_name: robloxInput,
                twitter_id: twitter_id,
                roblox_id: robloxid,
                follow_date: follow_date,
                roblox_game_id: game_id,
                following_twitter_account: twitter_account,
            },
        });
    } else if (!player && game) {
        const totalUsers = await sql.query(`SELECT * FROM users WHERE game_id = '${game}'`);
        if (totalUsers.rows.length === 0) {
            return res.json({
                success: false,
                message: 'No users in database',
            });
        }

        const formatted = totalUsers.rows.map((user) => {
            const { username, twitter_id, robloxid, follow_date, game_id, twitter_account } = user;
            return {
                user_input_name: username,
                twitter_id: twitter_id,
                roblox_id: robloxid,
                follow_date: follow_date,
                roblox_game_id: game_id,
                following_twitter_account: twitter_account,
            };
        });

        return res.json({
            success: true,
            data: formatted,
        });
    }
});

module.exports = router;
