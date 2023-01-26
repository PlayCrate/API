const prom = require('prom-client');
const { groupInfo } = require('../games');
const { server } = require('../../../../config.json');
const sql = require('../../../database/db');

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
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log(PlayCrate.memberCount);

    await sql.query(
        `INSERT INTO rtc_connection_second (play_crate_fans) SELECT $1 WHERE NOT EXISTS (SELECT * FROM rtc_connection_second);`,
        [PlayCrate.memberCount]
    );

    const MineCart = await groupInfo(5799338);
    MineCartGroupCount.set(MineCart.memberCount);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const Breaded = await groupInfo(3409253);
    BreadedGroupCount.set(Breaded.memberCount);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const Stormy = await groupInfo(5998745);
    StormyGroupCount.set(Stormy.memberCount);
}, server.refresh_time);

module.exports = {
    PlayCrateGroupCount,
    MineCartGroupCount,
    BreadedGroupCount,
    StormyGroupCount,
};
