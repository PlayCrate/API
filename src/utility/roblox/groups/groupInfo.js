const prom = require('prom-client');

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

module.exports = {
    PlayCrateGroupCount,
    MineCartGroupCount,
    BreadedGroupCount,
    StormyGroupCount,
};
