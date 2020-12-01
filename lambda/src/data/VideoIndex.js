const Alexa = require('ask-sdk-core');
const ytdl = require('ytdl-core');

const videos = (() => {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'test')
        return require('../../test/data/workouts-test-data');

    return require('data/workouts-data');
})();

const low = require('lowdb');
const Memory = require('lowdb/adapters/Memory');
const db = low(new Memory());
db.defaults(videos).write();

/**
 * Fetches a playable video stream and some metadata matching the given parameters.
 * If no playable video is found, returns null.
 */
const getPlayableVideo = async (exerciseType, duration, muscleGroups, exerciseLevel) => {
    const videoUrls = await search(exerciseType, duration, muscleGroups, exerciseLevel);
    if (videoUrls.length === 0) return null;

    const info = await ytdl.getInfo(videoUrls[0]);
    const videoImageUrl = info.videoDetails.thumbnail.thumbnails[2].url;

    const highQualityAudioVideoStream = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highestvideo' });

    return {
        channelName: Alexa.escapeXmlCharacters(info.videoDetails.author.name),
        originalUrl: videoUrls[0],
        title: Alexa.escapeXmlCharacters(info.videoDetails.title),
        url: highQualityAudioVideoStream.url,
        videoImageUrl: videoImageUrl,
    }
}

/**
 * Searches through the workout repository to find a video matching the given requirements and returns
 * an array of video URLs. If no matches are found, returns an empty array.
 * @param {*} exerciseType yoga, stretching etc.
 * @param {*} duration the maximum duration of the workout in minutes. Can be empty.
 * @param {*} muscleGroups an array of focus muscle groups for the workout. Can be empty.
 * @param {*} exerciseLevel easy, medium or difficult. Can be empty.
 */
const search = async (exerciseType, duration, muscleGroups, exerciseLevel) => {
    if (!exerciseType) throw new Error('Exercise Type is a required argument.');
    if (muscleGroups && (!Array.isArray(muscleGroups) || muscleGroups.length == 0)) throw new Error(`Invalid muscle groups input: ${muscleGroups}`);

    const filteredWorkouts = await db
        .filter(function (candidateWorkout) {
            let isMatch = candidateWorkout.exerciseTypes.includes(exerciseType);
            if (duration) isMatch &= candidateWorkout.video.duration <= duration;
            if (muscleGroups) isMatch &= muscleGroups.every(muscleGroup => candidateWorkout.muscleGroups.includes(muscleGroup));
            if (exerciseLevel) isMatch &= candidateWorkout.exerciseLevels.includes(exerciseLevel);
            return isMatch;
        })
        .value();

    return filteredWorkouts.map(filteredWorkout => filteredWorkout.video.yturl);
}

module.exports = {
    getPlayableVideo: getPlayableVideo,
};