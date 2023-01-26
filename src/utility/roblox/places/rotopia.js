const prom = require('prom-client');

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

module.exports = { gamesCurrentUser, gamesCurrentVisits, gamesCurrentFavorites, gameRating };
