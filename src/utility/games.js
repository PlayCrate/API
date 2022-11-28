const fetch = require('node-fetch');

exports.gameInfo = async (gameID) => {
    const { data: gameInfo } = await fetch(`https://games.roblox.com/v1/games?universeIds=${gameID}`, {
        method: 'GET',
    }).then((res) => res.json());
    const { playing, visits, favoritedCount } = gameInfo[0];
    return { playing, visits, favoritedCount };
};

exports.gameVotesInfo = async (gameID) => {
    const { data: votesInfo } = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${gameID}`, {
        method: 'GET',
    }).then((res) => res.json());
    const { upVotes, downVotes } = votesInfo[0];
    const ratings = upVotes + downVotes === 0 ? 0 : (upVotes / (upVotes + downVotes)) * 100;
    const fixedRatings = ratings.toFixed(2);
    return { upVotes, downVotes, fixedRatings };
};

exports.groupInfo = async (groupID) => {
    const groupInfo = await fetch(`https://groups.roblox.com/v1/groups/${groupID}`, {
        method: 'GET',
    }).then((res) => res.json());
    return groupInfo;
};
