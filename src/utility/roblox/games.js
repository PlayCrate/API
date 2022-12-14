const fetch = require('node-fetch');

async function makeRequest(url) {
    const { data } = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Roblox/WinInet',
        },
    }).then((res) => res.json());
    if (data) return data;
}

exports.gameInfo = async (gameID) => {
    const gameInfo = await makeRequest(`https://games.roblox.com/v1/games?universeIds=${gameID}`);
    const { playing, visits, favoritedCount } = gameInfo[0];
    return { playing, visits, favoritedCount };
};

exports.gameVotesInfo = async (gameID) => {
    const votesInfo = await makeRequest(`https://games.roblox.com/v1/games/votes?universeIds=${gameID}`);
    const { upVotes, downVotes } = votesInfo[0];
    const ratings = upVotes + downVotes === 0 ? 0 : (upVotes / (upVotes + downVotes)) * 100;
    const fixedRatings = ratings.toFixed(2);
    return { upVotes, downVotes, fixedRatings };
};

exports.groupInfo = async (groupID) => {
    const groupInfo = await makeRequest(`https://groups.roblox.com/v1/groups/${groupID}`);
    return groupInfo;
};
