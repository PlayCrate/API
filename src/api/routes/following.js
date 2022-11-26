const express = require("express");
const router = express.Router();
const { getTwitter } = require("../../utility/twitter");
const { twitter } = require("../../../config.json");
const sql = require("../../database/db");

router.post("/twitter", async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization || authorization !== twitter.API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const bodyType = Object.keys(req.body)[0];
  if (!bodyType || bodyType !== "username") {
    return res.json({
      success: false,
      message: "Bad Body Request",
    });
  }

  const { username: robloxName } = req.body;
  if (!robloxName) {
    return res.json({
      success: false,
      message: "Bad Body Request",
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
  if (!username || !/^[A-Z_\d]{2,30}$/i.test(username)) {
    return res.json({
      success: false,
      message: "malformed username parameter",
    });
  }

  const { success, message } = await getTwitter(username, robloxName);
  try {
    if (success) {
      return res.status(200).json({
        success: true,
        message,
      });
    } else {
      return res.json({
        success: false,
        message,
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
