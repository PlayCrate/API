const { getUser } = require('./users');
const sql = require('../../database/db');

async function getTwitter(username, robloxID, Game, twitter) {
    const data = await getUser(username);
    if (!data) {
        return {
            success: false,
            message: 'Invalid username',
        };
    }

    const { id } = data;
    const findUserInCachedTable = await sql.query(`SELECT * FROM twitter_ids WHERE twitter_id = '${id}';`);
    if (findUserInCachedTable.rows.length === 0) {
        return {
            success: false,
            message: `${username} is not following.`,
        };
    }

    const findUserInDB = await sql.query(`SELECT * FROM users WHERE twitter_id = '${id}';`);
    if (findUserInDB.rows.length !== 0) {
        return {
            success: false,
            message: `${username} is already in the database.`,
        };
    }

    try {
        await sql.query(
            `INSERT INTO users (username, twitter_id, robloxid, game_id, twitter_account) VALUES ('${username}', '${id}', '${robloxID}', '${Game}', '${twitter.toLowerCase()}');`
        );
        console.log(`Added! ${username} is following, adding to database`);
        return {
            success: true,
            message: `${username} is following, adding to database`,
        };
    } catch (err) {
        return {
            success: false,
            message: err,
        };
    }
}

module.exports = { getTwitter };
