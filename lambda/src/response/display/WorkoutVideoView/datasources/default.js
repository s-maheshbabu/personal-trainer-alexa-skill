module.exports = (channelName, originalUrl, playableUrl, videoPlayerId, videoTitle) => {
    return {
        channelName: channelName,
        originalUrl: originalUrl,
        playableUrl: playableUrl,
        videoPlayerId: videoPlayerId,
        videoTitle: videoTitle,
    };
};