const { getUser } = require('./users');
const { getFollows } = require('./follow');
const sql = require('../../database/db');

async function getTwitter(username, robloxID, Game, twitter) {
    const data = await getUser(username);
    if (!data) {
        return {
            success: false,
            message: 'Invalid username',
        };
    }

    const sqlTable = await sql.query(
        `SELECT * FROM users WHERE twitter_id = $1 AND game_id = $2 AND twitter_account = $3`,
        [data?.id, Game, twitter.toLowerCase()]
    );

    if (sqlTable.rows.length !== 0) {
        return {
            success: false,
            message: `${username} is already in the database.`,
        };
    }

    const followings = await getFollows(data?.id);

    if (!followings) {
        return {
            success: false,
            message: `${username} is not following anyone.`,
        };
    }

    for (const { username: account } of followings) {
        console.log(account);
        if (account.toLowerCase() === twitter) {
            await sql.query(
                `INSERT INTO users (username, twitter_id, robloxid, game_id, twitter_account) VALUES ($1, $2, $3, $4, $5)`,
                [data.username, data.id, robloxID, Game, twitter.toLowerCase()]
            );
            return {
                success: true,
                message: `${data.username} is following, adding to database`,
            };
        }
    }

    return {
        success: false,
        message: `${data.username} is not following ${twitter}`,
    };
}

module.exports = { getTwitter };
