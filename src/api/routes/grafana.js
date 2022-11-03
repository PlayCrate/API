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

const gameRating = new prom.Gauge({
  name: "games_current_rating",
  help: "Current Games Rating",
});

for (const metrics of [
  gamesCurrentUser,
  gamesCurrentVisits,
  gamesCurrentFavorites,
  gameRating,
]) {
  register.registerMetric(metrics);
}

register.setDefaultLabels({
  app: "roblox",
});

prom.collectDefaultMetrics({ register });

setInterval(async () => {
  const { playing, visits, favoritedCount } = await gameInfo(1730143810);
  const { fixedRatings } = await gameVotesInfo(1730143810);
  gamesCurrentUser.set(playing);
  gamesCurrentVisits.set(visits);
  gamesCurrentFavorites.set(favoritedCount);
  gameRating.set(fixedRatings);
}, 10000);

router.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

module.exports = router;
