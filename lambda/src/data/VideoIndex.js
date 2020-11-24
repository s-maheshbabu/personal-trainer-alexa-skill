const ytdl = require('ytdl-core');

const videos = [
    "https://www.youtube.com/watch?v=-5ztdzyQkSQ",
    "https://www.youtube.com/watch?v=Mvo2snJGhtM",
    "https://www.youtube.com/watch?v=CBWQGb4LyAM",
    "https://www.youtube.com/watch?v=tbbZBtdd20U",
    "https://www.youtube.com/watch?v=fyzveWI25aI",
    "https://www.youtube.com/watch?v=QNAOIXhNRJs",
];

/**
 * Fetches a video that can be played. This is a placeholder for now. In its final form,
 * the method should take query parameters and find a suitable video.
 */
const getPlayableVideo = async () => {
    let info = await ytdl.getInfo(videos[0]);
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