const fetch = require('node-fetch');
const { twitter } = require('../../../config.json');

async function getUser(username) {
    const { data } = await fetch(
        `https://api.twitter.com/2/users/by/username/${username}?user.fields=created_at,location,description`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${twitter.bearer_token}`,
            },
        }
    ).then((res) => res.json());
    return data;
}

module.exports = { getUser };
