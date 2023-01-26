const express = require('express');
const router = express.Router();
const sql = require('../../database/db');

router.get('/rtc', async (req, res) => {
    const xd = await sql.query(`SELECT * FROM rtc_connection_second`);
    const xd2 = await sql.query(`SELECT * FROM rtc_connection`);

    return res.json({
        play_crate_fans: xd.rows[0].play_crate_fans,
        play_crate_playing: xd2.rows[0].play_crate_playing,
        play_crate_visits: xd2.rows[0].play_crate_visits,
    });
});

module.exports = router;
