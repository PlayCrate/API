require('./api/server');
const sql = require('./database/db');

async function execute() {
    console.log(`Executing Roblox API...`);
    try {
        await sql.query(
            `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT NOT NULL, twitter_id TEXT NOT NULL, robloxID TEXT NOT NULL, follow_date TIMESTAMP NOT NULL DEFAULT NOW(), game_id TEXT NOT NULL, twitter_account TEXT NOT NULL)`
        );
    } catch (err) {
        console.log(err);
    }
}
execute();
