const got = require('got');

async function makeRequest(url) {
    try {
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
    } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return makeRequest(url);
    }
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
