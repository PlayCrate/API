const fetch = require('node-fetch');
const { twitter } = require('../../../config.json');
const sql = require('../../database/db');

async function FetchAllFollowers() {
    const data = await fetch(
        `https://api.twitter.com/1.1/followers/ids.json?screen_name=play_crate&stringify_ids=true`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${twitter.bearer_token}`,
            },
        }
    ).then((res) => res.json());
    console.log('Fetched Users!');

    const idsArray = data.ids;
    for (let i = 0; i < idsArray.length; i++) {
        const id = idsArray[i];
        console.log(id);
        const check = await sql.query(`SELECT * FROM twitter_ids WHERE twitter_id = $1`, [id]);
        if (check.rows.length === 0) {
            await sql.query(`INSERT INTO twitter_ids (twitter_id) VALUES ($1)`, [id]);
        }
    }
}

module.exports = { FetchAllFollowers };
