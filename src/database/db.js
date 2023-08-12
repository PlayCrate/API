const { Pool } = require('pg');

const sql = new Pool({
    ...bot.Config.postgres,
});

sql.connect(async () => {
    console.log(`Connected to PostgreSQL database.`);

    try {
        await sql.query(
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY, 
                username TEXT NOT NULL, 
                twitter_id TEXT NOT NULL, 
                robloxID TEXT NOT NULL, 
                follow_date TIMESTAMP NOT NULL DEFAULT NOW(), 
                game_id TEXT NOT NULL, 
                twitter_account TEXT NOT NULL
            )`
        );

        await sql.query(`CREATE TABLE IF NOT EXISTS robux (
                id SERIAL PRIMARY KEY,
                robloxid TEXT NOT NULL,
                robux_spent INTEGER NOT NULL,
                spent_date TIMESTAMP NOT NULL DEFAULT NOW()
            )`);
        await sql.query('ALTER TABLE robux ADD COLUMN IF NOT EXISTS purchase_type VARCHAR(255)');

        await sql.query(`CREATE TABLE IF NOT EXISTS trades(
                id SERIAL PRIMARY KEY,
                roblox_id TEXT NOT NULL,
                recipient_id TEXT NOT NULL,
                items JSONB NOT NULL,
                trade_date TIMESTAMP NOT NULL DEFAULT NOW()
            )`);

        await sql.query(`CREATE TABLE IF NOT EXISTS twitter_ids (
                id SERIAL PRIMARY KEY,
                twitter_id TEXT NOT NULL
            )`);

        await sql.query(`CREATE TABLE IF NOT EXISTS codes (
                id SERIAL PRIMARY KEY,
                code TEXT NOT NULL,
                used BOOLEAN NOT NULL DEFAULT FALSE,
                rewards TEXT NOT NULL,
                used_by TEXT NOT NULL,
                used_date TIMESTAMP NOT NULL DEFAULT NOW()
            )`);

        await sql.query(`CREATE TABLE IF NOT EXISTS bans (
                id SERIAL PRIMARY KEY,
                roblox_id VARCHAR(255) NOT NULL,
                item VARCHAR(255) NOT NULL,
                amount INTEGER NOT NULL,
                banned_date TIMESTAMP NOT NULL DEFAULT NOW()
        )`);

        await sql.query(`ALTER TABLE bans ADD COLUMN IF NOT EXISTS roblox_username VARCHAR(255)`);

        await sql.query(`CREATE TABLE IF NOT EXISTS mailbox (
                id SERIAL PRIMARY KEY,
                robloxName VARCHAR(255) NOT NULL,
                robloxId VARCHAR(255) NOT NULL,
                petIdt INTEGER NOT NULL,
                petPlace INTEGER NOT NULL,
                petXp INTEGER NOT NULL,
                petName VARCHAR(255) NOT NULL,
                petId VARCHAR(255) NOT NULL,
                petUID VARCHAR(255) NOT NULL,
                petLevel INTEGER NOT NULL,
                petSerial INTEGER,
                petPower VARCHAR(255),
                petSentDate INTEGER NOT NULL,
                petSentMessage VARCHAR(255) NOT NULL,
                petSenderId VARCHAR(255) NOT NULL,
                petShiny BOOLEAN,
                petSenderName VARCHAR(255) NOT NULL,
                displayName VARCHAR(255) NOT NULL,
                targetId VARCHAR(255) NOT NULL
        )`);

        await sql.query(`ALTER TABLE mailbox ADD COLUMN IF NOT EXISTS petSigned VARCHAR(255)`);
        await sql.query(`ALTER TABLE mailbox ADD COLUMN IF NOT EXISTS petTs INTEGER`);
        await sql.query(`ALTER TABLE mailbox ADD COLUMN IF NOT EXISTS petHatchedByName VARCHAR(255)`);
        await sql.query(`ALTER TABLE mailbox ADD COLUMN IF NOT EXISTS petHatchedById VARCHAR(255)`);
        await sql.query(`ALTER TABLE mailbox ADD COLUMN IF NOT EXISTS petNickname VARCHAR(255)`);

        await sql.query(`CREATE TABLE IF NOT EXISTS pets_count (
                id SERIAL PRIMARY KEY,
                petId VARCHAR(255) NOT NULL,
                petCount INTEGER NOT NULL,
                petShiny BOOLEAN NOT NULL
        )`);

        await sql.query(`CREATE TABLE IF NOT EXISTS pets_serial (
            id SERIAL PRIMARY KEY,
            pet_id VARCHAR(255) NOT NULL,
            serial INTEGER NOT NULL,
            UNIQUE (pet_id, serial)
        )`);

        await sql.query(`CREATE TABLE IF NOT EXISTS discord_verify (
            id SERIAL PRIMARY KEY,
            discord_id VARCHAR(255) NOT NULL,
            discord_name VARCHAR(255) NOT NULL,
            code VARCHAR(255) NOT NULL,
            used BOOLEAN NOT NULL DEFAULT FALSE,
            used_date TIMESTAMP NOT NULL DEFAULT NOW()
        )`);
    } catch (err) {
        throw new Error(`Failed to create tables: ${err}`);
    }
});

module.exports = sql;
