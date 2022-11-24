const { getUser } = require("./endpoints/users");
const { getFollows } = require("./endpoints/follow");
const sql = require("../database/db");

async function getTwitter(username) {
  const data = await getUser(username);
  if (!data) {
    return {
      success: false,
      message: "Invalid username",
    };
  }

  const sqlTable = await sql.query(`SELECT * FROM users WHERE uid = $1`, [
    data?.id,
  ]);

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

  for (const { username: isPlayCrate } of followings) {
    if (isPlayCrate === "play_crate") {
      await sql.query(`INSERT INTO users (username, uid) VALUES ($1, $2)`, [
        data.username,
        data.id,
      ]);

      return {
        success: true,
        message: `${data.username} is following, adding to database`,
      };
    } else {
      return {
        success: false,
        message: `${data.username} is not following, not adding to database`,
      };
    }
  }
}

module.exports = { getTwitter };
