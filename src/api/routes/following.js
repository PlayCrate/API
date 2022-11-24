const express = require("express");
const router = express.Router();
const { getTwitter } = require("../../utility/twitter");

router.get("/twitter", async (req, res) => {
  const queryType = Object.keys(req.query)[0];
  if (queryType !== "username") {
    return res.status(400).json({
      success: false,
      message: "Invalid query type",
    });
  }

  const { username } = req.query;
  if (!username || !/^[A-Z_\d]{2,30}$/i.test(username)) {
    return res.status(400).json({
      success: false,
      message: "malformed username parameter",
    });
  }

  const { success, message } = await getTwitter(username);
  try {
    if (success) {
      return res.status(200).json({
        success: true,
        message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
