const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const graf = require('./routes/grafana');
const twitter = require('./routes/following');
const checkDB = require('./routes/checkDB');
const dropDB = require('./routes/dropDB');
const robux = require('./routes/recieveData');
const discord = require('./routes/discord');
const trade = require('./routes/trade');
const tradeHistory = require('./routes/getTrades');
const rtc = require('./routes/rtc');

const setCode = require('./codes/setCode');
const getCode = require('./codes/getCode');
const { server } = require('../../config.json');

app.use(morgan('dev'));
app.use(
    cors({
        origin: server.type === 'production' ? ['https://grafana.kattah.me', 'https://roblox.com'] : '*',
    }),
    express.json()
);
app.use([graf, twitter, checkDB, dropDB, robux, discord, trade, tradeHistory, rtc, setCode, getCode]);

app.listen(server.port, () => {
    console.log(`Server is running on port ${server.port}`);
});
