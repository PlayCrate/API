const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const graf = require('./routes/grafana');
const twitter = require('./routes/following');
const checkDB = require('./routes/checkDB');
const dropDB = require('./routes/dropDB');
const robux = require('./routes/recieveData');
const { server } = require('../../config.json');

app.use(morgan('dev'));
app.use(
    cors({
        origin: server.type === 'production' ? ['https://grafana.kattah.me', 'https://roblox.com'] : '*',
    }),
    express.json()
);
app.use([graf, twitter, checkDB, dropDB, robux]);

app.listen(server.port, () => {
    console.log(`Server is running on port ${server.port}`);
});
