const express = require("express");
const router = express.Router();
const prom = require("prom-client");
const register = new prom.Registry();
const { gameInfo, gameVotesInfo, groupInfo } = require("../../games");

const gamesCurrentUser = new prom.Gauge({
  name: "games_current_users",
  help: "Current Games Users",
});

const gamesCurrentVisits = new prom.Gauge({
  name: "games_current_visits",
  help: "Current Games Visits",
});

const gamesCurrentFavorites = new prom.Gauge({
  name: "games_current_favorites",
  help: "Current Games Favorites",
});

const gamesCurrentUpVotes = new prom.Gauge({
  name: "games_current_votes",
  help: "Current Games votes",
});

const gamesCurrentDownVotes = new prom.Gauge({
  name: "games_current_downvotes",
  help: "Current Games downvotes",
});

for (const metrics of [
  gamesCurrentUser,
  gamesCurrentVisits,
  gamesCurrentFavorites,
  gamesCurrentUpVotes,
  gamesCurrentDownVotes,
]) {
  register.registerMetric(metrics);
}

register.setDefaultLabels({
  app: "roblox",
});

prom.collectDefaultMetrics({ register });

setInterval(async () => {
  const { playing, visits, favoritedCount } = await gameInfo(1730143810);
  const { upVotes, downVotes } = await gameVotesInfo(1730143810);
  gamesCurrentUser.set(playing);
  gamesCurrentVisits.set(visits);
  gamesCurrentFavorites.set(favoritedCount);
  gamesCurrentUpVotes.set(upVotes);
  gamesCurrentDownVotes.set(downVotes);
}, 10000);

router.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

module.exports = router;
