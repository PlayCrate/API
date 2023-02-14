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

async function Looper() {
    const groupIDs = ['13004189', '5799338', '3409253', '5998745'];
    const promises = groupIDs.map(async (id) => {
        const info = await groupInfo(id);
        return { id, info };
    });

    const result = await Promise.all(promises);
    for (const { id, info } of result) {
        switch (id) {
            case '13004189':
                PlayCrateGroupCount.set(info.memberCount);
                await redis.set('play_crate_group_count', info.memberCount);
                break;
            case '5799338':
                MineCartGroupCount.set(info.memberCount);
                break;
            case '3409253':
                BreadedGroupCount.set(info.memberCount);
                break;
            case '5998745':
                StormyGroupCount.set(info.memberCount);
                break;
            default:
                break;
        }
    }

    const universeID = ['4158951932', '701618141', '1730143810', '3478025530'];
    const promises2 = universeID.map(async (id) => {
        const info = await gameInfo(id);
        const votes = await gameVotesInfo(id);
        return { id, info, votes };
    });

    const result2 = await Promise.all(promises2);
    for (const { id, info, votes } of result2) {
        const { playing, visits, favoritedCount } = info;
        let { fixedRatings } = votes;
        fixedRatings = Number(fixedRatings);

        switch (id) {
            case '4158951932':
                bubbleUsers.set(playing);
                bubbleVisits.set(visits);
                bubbleFav.set(favoritedCount);
                bubbleRating.set(fixedRatings);

                await redis.set('play_crate_playing', playing);
                await redis.set('play_crate_visits', visits);
                productRobux.set(await returnSQL('product'));
                gamepassRobux.set(await returnSQL('gamepass'));
                break;
            case '701618141':
                eatingUsers.set(playing);
                eatingVisits.set(visits);
                eatingFav.set(favoritedCount);
                eatingRating.set(fixedRatings);
                break;
            case '1730143810':
                islandUser.set(playing);
                islandVisit.set(visits);
                islandFav.set(favoritedCount);
                islandRating.set(fixedRatings);
                break;
            case '3478025530':
                rotopiaUsers.set(playing);
                rotopiaVisits.set(visits);
                rotopiaFav.set(favoritedCount);
                rotopiaRating.set(fixedRatings);
                break;
            default:
                break;
        }
    }
}

(async () => {
    await Looper();

    setInterval(async () => {
        await Looper();
        console.log(`[Roblox API] Updated metrics!`);
    }, bot.Config.server.refresh_time);
})();

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
