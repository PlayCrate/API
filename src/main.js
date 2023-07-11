const cron = require('node-cron');
global.bot = {};
bot.Config = require('../config.json');

const sql = require('./database/db');

(async function () {
    require('./api/server');
    console.log(`Executing Roblox API...`);

    cron.schedule('*/10 * * * * *', async () => {
        const currentDate = Math.floor(Date.now() / 1000);
        const twoWeeksAgo = currentDate - 14 * 24 * 60 * 60;
        const selectQuery = `SELECT * FROM mailbox WHERE petSentDate < '${twoWeeksAgo}' AND petSentDate != 0 AND petSentMessage != 'This item has expired and has been returned to your mailbox.'`;

        try {
            const result = await sql.query(selectQuery);
            const expiredPets = result.rows;

            for (const pet of expiredPets) {
                const asd = await sql.query(
                    `UPDATE mailbox 
                    SET robloxid = $1, petsentmessage = $2, robloxname = $3, targetid = $4, petsenderid = $5, displayname = $6, petsendername = $7, petsentdate = 0 
                    WHERE robloxid = $8 AND petsentdate != 0`,
                    [
                        pet.petsenderid,
                        `This pet has expired and not been claimed by ${pet.robloxname}, therefore it has been returned to you.`,
                        pet.petsendername,
                        pet.petsenderid,
                        pet.robloxid,
                        pet.robloxname,
                        pet.robloxname,
                        pet.robloxid,
                    ]
                );

                if (asd.rowCount === 0) {
                    console.log(`No expired pets found.`);
                    return;
                }

                console.log(`Expired pet returned to ${pet.petsendername} (${pet.petsenderid})`);
            }
        } catch (err) {
            console.log(err);
        }
    });
})();
