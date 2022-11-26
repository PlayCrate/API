require("./api/server");
const sql = require("./database/db");

async function execute() {
  console.log(`Executing Roblox API...`);
  try {
    await sql.query(
      `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT NOT NULL, uid TEXT NOT NULL, robloxID TEXT NOT NULL )`
    );
  } catch (err) {
    console.log(err);
  }
}
execute();
