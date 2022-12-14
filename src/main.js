require('./api/server');
const sql = require('./database/db');

async function execute() {
    console.log(`Executing Roblox API...`);
    try {
        await sql.query(
            `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT NOT NULL, twitter_id TEXT NOT NULL, robloxID TEXT NOT NULL, follow_date TIMESTAMP NOT NULL DEFAULT NOW(), game_id TEXT NOT NULL, twitter_account TEXT NOT NULL)`
        );

        await sql.query(`CREATE TABLE IF NOT EXISTS robux (
            id SERIAL PRIMARY KEY,
            robloxid TEXT NOT NULL,
            robux_spent INTEGER NOT NULL,
            spent_date TIMESTAMP NOT NULL DEFAULT NOW()
        )`);
        await sql.query('ALTER TABLE robux ADD COLUMN IF NOT EXISTS purchase_type VARCHAR(255)');
    } catch (err) {
        console.log(err);
    }
}
execute();
