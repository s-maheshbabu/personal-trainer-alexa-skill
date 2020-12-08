const eventtypes = require("constants/EventTypes").eventtypes;

module.exports = (channelName, originalUrl, videoImageUrl) => {
    const sendEmailEvent = {
        type: "SendEvent",
        arguments: [
            eventtypes.SendEmail,
            channelName,
            originalUrl,
            videoImageUrl,
        ]
    };

    return {
        channelName: channelName,
        originalUrl: originalUrl,
        sendEmailEvent: sendEmailEvent,
        videoImageUrl: videoImageUrl,
    };
};