const eventtypes = require("constants/EventTypes").eventtypes;

module.exports = (channelName, originalUrl, playableUrl, videoImageUrl, videoPlayerId, videoTitle) => {
    const workoutEndedEvent = {
        type: "SendEvent",
        arguments: [
            eventtypes.WorkoutEnded,
            channelName,
            originalUrl,
            videoImageUrl,
        ]
    };

    return {
        channelName: channelName,
        originalUrl: originalUrl,
        playableUrl: playableUrl,
        videoImageUrl: videoImageUrl,
        videoPlayerId: videoPlayerId,
        videoTitle: videoTitle,
        workoutEndedEvent: workoutEndedEvent,
    };
};