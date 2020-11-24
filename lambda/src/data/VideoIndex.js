const ytdl = require('ytdl-core');
const videos = require('data/video-data')

/**
 * Fetches a video that can be played. This is a placeholder for now. In its final form,
 * the method should take query parameters and find a suitable video.
 */
const getPlayableVideo = async () => {
    let info = await ytdl.getInfo(videos[0].video.yturl);
    let highQualityAudioVideoStream = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highestvideo' });

    return {
        channelName: info.author.name,
        title: info.videoDetails.title,
        url: highQualityAudioVideoStream.url,
    }
}

module.exports = {
    getPlayableVideo: getPlayableVideo,
};