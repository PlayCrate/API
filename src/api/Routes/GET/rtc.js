const express = require('express');
const router = express.Router();
const Redis = require('ioredis');
const redis = new Redis({});

router.get('/rtc', async (req, res) => {
    const playing = await redis.get('play_crate_playing');
    const visits = await redis.get('play_crate_visits');
    const fans = await redis.get('play_crate_group_count');

    return res.json({
        play_crate_fans: fans,
        play_crate_playing: playing,
        play_crate_visits: visits,
    });
});

module.exports = router;
