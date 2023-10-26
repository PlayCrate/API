const { join } = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const Routes = join(__dirname, 'Routes');
const App = express();

App.use(cors(), express.json());
App.listen(bot.Config.server.port, () => {
    console.log(`Server is running on port ${bot.Config.server.port}`);
});

(async () => {
    for (const file of fs.readdirSync(Routes)) {
        const subFolder = join(Routes, file);
        const subFolderFiles = fs.readdirSync(subFolder);

        for (const subFile of subFolderFiles) {
            if (!subFile.endsWith('.js')) continue;
            const Route = require(join(subFolder, subFile));
            App.use(Route);
        }
    }
})();
