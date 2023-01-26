const got = require('got');

async function makeRequest(url) {
    const { body } = await got(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Roblox/WinInet',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!body) return;
    const parsed = JSON.parse(body);
    return parsed;
}

function Sleep() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
}

exports.gameInfo = async (gameID) => {
    await Sleep();
    const gameInfo = await makeRequest(`https://games.roblox.com/v1/games?universeIds=${gameID}`);
    const { playing, visits, favoritedCount } = gameInfo.data[0];
    return { playing, visits, favoritedCount };
};

exports.gameVotesInfo = async (gameID) => {
    await Sleep();
    const votesInfo = await makeRequest(`https://games.roblox.com/v1/games/votes?universeIds=${gameID}`);
    const { upVotes, downVotes } = votesInfo.data[0];
    const ratings = upVotes + downVotes === 0 ? 0 : (upVotes / (upVotes + downVotes)) * 100;
    const fixedRatings = ratings.toFixed(2);
    return { upVotes, downVotes, fixedRatings };
};

exports.groupInfo = async (groupID) => {
    await Sleep();
    const groupInfo = await makeRequest(`https://groups.roblox.com/v1/groups/${groupID}`);
    return {
        memberCount: groupInfo.memberCount,
    };
};
