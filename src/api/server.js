const { join } = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cluster = require('cluster');

if (cluster.isMaster) {
    const numCPUs = require('os').cpus();

    console.log(`Master process started with PID ${process.pid} and ${numCPUs} CPUs`);

    for (let i = 0; i < numCPUs.length; i++) {
        cluster.fork();
    }

    cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is online`);
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    const Routes = join(__dirname, 'Routes');
    const App = express();

    App.use(cors(), express.json(), morgan('dev'));
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
}
