const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const fetch = require('node-fetch');

router.post('/discord', middleWare, async (req, res) => {
    const { embeds, link, token } = req.body;
    if (!embeds || !link) return res.json({ success: false, message: 'Missing embeds or link' });

    try {
        const { status, statusText } = await fetch(link, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embeds],
            }),
        });

        return res.json({
            status: status,
            message: statusText,
        });
    } catch (err) {
        return res.json({
            success: false,
            message: 'Internal Server Error',
        });
    }
});

module.exports = router;
