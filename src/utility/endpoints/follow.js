const fetch = require('node-fetch');
const { twitter } = require('../../../config.json');

async function getFollows(userID) {
    const { data } = await fetch(`https://api.twitter.com/2/users/${userID}/following`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${twitter.bearer_token}`,
        },
    }).then((res) => res.json());

    return data;
}

module.exports = { getFollows };
