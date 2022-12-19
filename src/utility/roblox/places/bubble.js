const prom = require('prom-client');
const { gameInfo, gameVotesInfo } = require('../../roblox/games');
const { server } = require('../../../../config.json');
const sql = require('../../../database/db');

const gamesCurrentUser = new prom.Gauge({
    name: 'bubble_games_current_users',
    help: 'Current Games Users',
});

const gamesCurrentVisits = new prom.Gauge({
    name: 'bubble_games_current_visits',
    help: 'Current Games Visits',
});

const gamesCurrentFavorites = new prom.Gauge({
    name: 'bubble_games_current_favorites',
    help: 'Current Games Favorites',
});

const gameRating = new prom.Gauge({
    name: 'bubble_games_current_rating',
    help: 'Current Games Rating',
});

const productRobux = new prom.Gauge({
    name: 'bubble_product_robux',
    help: 'Robux Spent on Product',
});

const gamepassRobux = new prom.Gauge({
    name: 'bubble_gamepass_robux',
    help: 'Robux Spent on Gamepass',
});

async function returnSQL(type) {
    const { rows } = await sql.query(`SELECT * FROM ROBUX WHERE purchase_type = '${type}';`);
    let robuxSpent = 0;
    for (const { robux_spent } of rows) {
        robuxSpent += robux_spent;
    }

    return robuxSpent;
}

setInterval(async () => {
    const { playing, visits, favoritedCount } = await gameInfo(4158951932);
    const { fixedRatings } = await gameVotesInfo(4158951932);
    gamesCurrentUser.set(playing);
    gamesCurrentVisits.set(visits);
    gamesCurrentFavorites.set(favoritedCount);
    gameRating.set(Number(fixedRatings));

    productRobux.set(await returnSQL('product'));
    gamepassRobux.set(await returnSQL('gamepass'));
}, server.refresh_time);

module.exports = {
    gamesCurrentUser,
    gamesCurrentVisits,
    gamesCurrentFavorites,
    gameRating,
    productRobux,
    gamepassRobux,
};
