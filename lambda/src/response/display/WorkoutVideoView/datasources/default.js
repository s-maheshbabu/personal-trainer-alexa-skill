module.exports = (channelName, originalUrl, playableUrl, videoImageUrl, videoPlayerId, videoTitle) => {
    return {
        channelName: channelName,
        originalUrl: originalUrl,
        playableUrl: playableUrl,
        videoImageUrl: videoImageUrl,
        videoPlayerId: videoPlayerId,
        videoTitle: videoTitle,
    };
};