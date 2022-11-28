const express = require('express');
const router = express.Router();
const { getTwitter } = require('../../utility/twitter');
const { twitter } = require('../../../config.json');

router.post('/twitter', async (req, res) => {
    const { authorization } = req.headers;
    if (!authorization || authorization !== twitter.API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }

    const bodyType = Object.keys(req.body)[0];
    if (!bodyType || (bodyType !== 'roblox_id' && bodyType !== 'game')) {
        return res.json({
            success: false,
            message: 'Bad Body Request',
        });
    }

    const { roblox_id, game, twitter_account } = req.body;
    if (!roblox_id || !game || !twitter_account) {
        return res.json({
            success: false,
            message: 'Bad Request, Roblox name, game or twitter account not provided',
        });
    }

    const queryType = Object.keys(req.query)[0];
    if (queryType !== 'username') {
        return res.json({
            success: false,
            message: 'Invalid query type',
        });
    }

    const { username } = req.query;
    if (!username || !/^[A-Z_\d]{2,30}$/i.test(username)) {
        return res.json({
            success: false,
            message: 'malformed username parameter',
        });
    }

    const { success, message } = await getTwitter(username, roblox_id, game, twitter_account);
    try {
        if (success) {
            return res.status(200).json({
                success: true,
                message,
            });
        } else {
            return res.json({
                success: false,
                message,
            });
        }
    } catch (err) {
        return res.json({
            success: false,
            message: 'Internal server error',
        });
    }
});

module.exports = router;
