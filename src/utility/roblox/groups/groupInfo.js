const prom = require('prom-client');
const { groupInfo } = require('../games');
const { server } = require('../../../../config.json');
const sql = require('../../../database/db');
const Redis = require('ioredis');
const redis = new Redis({});

const PlayCrateGroupCount = new prom.Gauge({
    name: 'playcrate_group_count',
    help: 'PlayCrate Group Count',
});

const MineCartGroupCount = new prom.Gauge({
    name: 'minecart_group_count',
    help: 'Minecart Group Count',
});

const BreadedGroupCount = new prom.Gauge({
    name: 'breaded_group_count',
    help: 'Breaded Group Count',
});

const StormyGroupCount = new prom.Gauge({
    name: 'stormy_group_count',
    help: 'Stormy Group Count',
});

setInterval(async () => {
    const PlayCrate = await groupInfo(13004189);
    PlayCrateGroupCount.set(PlayCrate.memberCount);
    console.log(PlayCrate.memberCount);

    await redis.set('play_crate_group_count', PlayCrate.memberCount);

    const MineCart = await groupInfo(5799338);
    MineCartGroupCount.set(MineCart.memberCount);
    const Breaded = await groupInfo(3409253);
    BreadedGroupCount.set(Breaded.memberCount);
    const Stormy = await groupInfo(5998745);
    StormyGroupCount.set(Stormy.memberCount);
}, server.refresh_time);

module.exports = {
    PlayCrateGroupCount,
    MineCartGroupCount,
    BreadedGroupCount,
    StormyGroupCount,
};
