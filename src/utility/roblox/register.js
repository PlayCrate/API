const prom = require('prom-client');
const register = new prom.Registry();
const Redis = require('ioredis');
const redis = new Redis({});
const sql = require('../../database/db');

async function returnSQL(type) {
    const { rows } = await sql.query(`SELECT * FROM ROBUX WHERE purchase_type = '${type}';`);
    let robuxSpent = 0;
    for (const { robux_spent } of rows) {
        robuxSpent += robux_spent;
    }

    return robuxSpent;
}

const {
    gamesCurrentUser: islandUser,
    gamesCurrentVisits: islandVisit,
    gamesCurrentFavorites: islandFav,
    gameRating: islandRating,
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

const {
    gamesCurrentUser: bubbleUsers,
    gamesCurrentVisits: bubbleVisits,
    gamesCurrentFavorites: bubbleFav,
    gameRating: bubbleRating,
    productRobux,
    gamepassRobux,
} = require('../roblox/places/bubble');

const {
    PlayCrateGroupCount,
    MineCartGroupCount,
    BreadedGroupCount,
    StormyGroupCount,
} = require('../roblox/groups/groupInfo');

const { groupInfo, gameInfo, gameVotesInfo } = require('./games');
const { server } = require('../../../config.json');

const groupIDs = ['13004189', '5799338', '3409253', '5998745'];
const universeID = ['4158951932', '701618141', '1730143810', '3478025530'];
async function request(groups, universes) {
    for (const id of groups) {
        const group = await groupInfo(id);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        switch (id) {
            case '13004189':
                PlayCrateGroupCount.set(group.memberCount);
                await redis.set('play_crate_group_count', group.memberCount);
                break;
            case '5799338':
                MineCartGroupCount.set(group.memberCount);
                break;
            case '3409253':
                BreadedGroupCount.set(group.memberCount);
                break;
            case '5998745':
                StormyGroupCount.set(group.memberCount);
                break;
            default:
                break;
        }
    }

    for (const id of universes) {
        const { playing, visits, favoritedCount } = await gameInfo(id);
        const { fixedRatings } = await gameVotesInfo(id);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        switch (id) {
            case '4158951932':
                bubbleUsers.set(playing);
                bubbleVisits.set(visits);
                bubbleFav.set(favoritedCount);
                bubbleRating.set(Number(fixedRatings));

                await redis.set('play_crate_playing', playing);
                await redis.set('play_crate_visits', visits);
                productRobux.set(await returnSQL('product'));
                gamepassRobux.set(await returnSQL('gamepass'));
                break;
            case '701618141':
                eatingUsers.set(playing);
                eatingVisits.set(visits);
                eatingFav.set(favoritedCount);
                eatingRating.set(Number(fixedRatings));
                break;
            case '1730143810':
                islandUser.set(playing);
                islandVisit.set(visits);
                islandFav.set(favoritedCount);
                islandRating.set(Number(fixedRatings));
                break;
            case '3478025530':
                rotopiaUsers.set(playing);
                rotopiaVisits.set(visits);
                rotopiaFav.set(favoritedCount);
                rotopiaRating.set(Number(fixedRatings));
                break;
            default:
                break;
        }
    }
}

request(groupIDs, universeID).then(() => {
    setInterval(() => {
        request(groupIDs, universeID);
    }, server.refresh_time);
});

for (const metrics of [
    islandFav,
    islandRating,
    islandUser,
    islandVisit,
    rotopiaUsers,
    rotopiaVisits,
    rotopiaFav,
    rotopiaRating,
    eatingUsers,
    eatingVisits,
    eatingFav,
    eatingRating,
    bubbleUsers,
    bubbleVisits,
    bubbleFav,
    bubbleRating,
    productRobux,
    gamepassRobux,
    PlayCrateGroupCount,
    MineCartGroupCount,
    BreadedGroupCount,
    StormyGroupCount,
]) {
    register.registerMetric(metrics);
}

register.setDefaultLabels({
    app: 'roblox',
});

module.exports = { register };
