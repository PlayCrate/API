global.bot = {};
bot.Config = require('../config.json');

require('./api/server');
const { FetchAllFollowers } = require('./utility/endpoints/fetchFollowers');

(async function () {
    console.log(`Executing Roblox API...`);

    if (bot.Config.type !== 'DEV') {
        setInterval(async () => {
            await FetchAllFollowers();
        }, 1000 * 60 * 1);
    }
})();
