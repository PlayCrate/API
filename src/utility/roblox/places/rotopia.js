const prom = require('prom-client');
const { gameInfo, gameVotesInfo } = require('../../roblox/games');
const { server } = require('../../../../config.json');

const gamesCurrentUser = new prom.Gauge({
    name: 'rotopia_games_current_users',
    help: 'Current Games Users',
});

const gamesCurrentVisits = new prom.Gauge({
    name: 'rotopia_games_current_visits',
    help: 'Current Games Visits',
});

const gamesCurrentFavorites = new prom.Gauge({
    name: 'rotopia_games_current_favorites',
    help: 'Current Games Favorites',
});

const gameRating = new prom.Gauge({
    name: 'rotopia_games_current_rating',
    help: 'Current Games Rating',
});

setInterval(async () => {
    const { playing, visits, favoritedCount } = await gameInfo(3478025530);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const { fixedRatings } = await gameVotesInfo(3478025530);
    gamesCurrentUser.set(playing);
    gamesCurrentVisits.set(visits);
    gamesCurrentFavorites.set(favoritedCount);
    gameRating.set(Number(fixedRatings));
}, server.refresh_time);

module.exports = { gamesCurrentUser, gamesCurrentVisits, gamesCurrentFavorites, gameRating };
