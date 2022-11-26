const express = require("express");
const router = express.Router();
const { getFollows } = require("../../utility/endpoints/follow");
const { twitter } = require("../../../config.json");
const sql = require("../../database/db");

router.get("/following", async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization || authorization !== twitter.API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const queryType = Object.keys(req.query)[0];
  if (queryType !== "username") {
    return res.json({
      success: false,
      message: "Invalid query type",
    });
  }

  const { username } = req.query;
  const findUserInDB = await sql.query(
    `SELECT * FROM users WHERE robloxid = '${username}'`
  );

  if (findUserInDB.rows.length === 0) {
    return res.json({
      success: false,
      message: "User not in database",
    });
  }

  const isFollowing = await getFollows(findUserInDB.rows[0].uid);

  for (const { username: isPlayCrate } of isFollowing) {
    if (isPlayCrate === "play_crate") {
      return res.json({
        success: true,
        message: "User is following",
        isFollowing: true,
      });
    } else {
      return res.json({
        success: true,
        message: "User is not following",
        isFollowing: false,
      });
    }
  }
});

module.exports = router;
