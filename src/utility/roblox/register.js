const prom = require('prom-client');
const register = new prom.Registry();

const {
    gamesCurrentUser,
    gamesCurrentVisits,
    gamesCurrentFavorites,
    gameRating,
} = require('../roblox/places/island_life');

const {
    gamesCurrentUser: rotopiaUsers,
    gamesCurrentVisits: rotopiaVisits,
    gamesCurrentFavorites: rotopiaFav,
    gameRating: rotopiaRating,
} = require('../roblox/places/rotopia');

const {
    gamesCurrentUser: eatingUsers,
    gamesCurrentVisits: eatingVisits,
    gamesCurrentFavorites: eatingFav,
    gameRating: eatingRating,
} = require('../roblox/places/eating_sim');

for (const metrics of [
    gamesCurrentUser,
    gamesCurrentVisits,
    gamesCurrentFavorites,
    gameRating,
    rotopiaUsers,
    rotopiaVisits,
    rotopiaFav,
    rotopiaRating,
    eatingUsers,
    eatingVisits,
    eatingFav,
    eatingRating,
]) {
    register.registerMetric(metrics);
}

register.setDefaultLabels({
    app: 'roblox',
});

module.exports = { register };
