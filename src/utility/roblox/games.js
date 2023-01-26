const fetch = require('node-fetch');
const randUserAgent = require('rand-user-agent');
const agent = randUserAgent('desktop');

async function makeRequest(url) {
    const asd = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': agent,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
        },
    }).then((res) => res.json());

    if (!asd) return;
    return asd;
}

exports.gameInfo = async (gameID) => {
    const gameInfo = await makeRequest(`https://games.roblox.com/v1/games?universeIds=${gameID}`);
    const { playing, visits, favoritedCount } = gameInfo.data[0];
    return { playing, visits, favoritedCount };
};

exports.gameVotesInfo = async (gameID) => {
    const votesInfo = await makeRequest(`https://games.roblox.com/v1/games/votes?universeIds=${gameID}`);
    const { upVotes, downVotes } = votesInfo.data[0];
    const ratings = upVotes + downVotes === 0 ? 0 : (upVotes / (upVotes + downVotes)) * 100;
    const fixedRatings = ratings.toFixed(2);
    return { upVotes, downVotes, fixedRatings };
};

exports.groupInfo = async (groupID) => {
    const groupInfo = await makeRequest(`https://groups.roblox.com/v1/groups/${groupID}`);
    return {
        memberCount: groupInfo.memberCount,
    };
};
