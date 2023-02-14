const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const fetch = require('node-fetch');

router.post('/discord', middleWare, async (req, res) => {
    const { embeds, link } = req.body;

    try {
        const { status, statusText } = await fetch(link + '?wait=true', {
            method: 'POST',
            headers: {
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
