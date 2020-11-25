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
 * Fetches a playable video. This is a placeholder for now. In its final form,
 * the method should take query parameters and find a suitable video.
 */
const getPlayableVideo = async () => {
    let info = await ytdl.getInfo(videos[0].video.yturl);
    let highQualityAudioVideoStream = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highestvideo' });

    return {
        channelName: info.videoDetails.author.name,
        title: info.videoDetails.title,
        url: highQualityAudioVideoStream.url,
    }
}

/**
 * Searches through the workout repository to find a video matching the given requirements and returns
 * an array of video URLs. If not matches are found, returns an empty array.
 * @param {*} exerciseType yoga, stretching etc.
 * @param {*} duration the maximum duration of the workout in minutes. Can be empty.
 * @param {*} muscleGroups an array of focus muscle groups for the workout. Can be empty.
 * @param {*} exerciseLevel easy, medium or difficult. Can be empty.
 */
const search = async (exerciseType: string, duration: number, muscleGroups: string[], exerciseLevel: string): Promise<string[]> => {
    if (!exerciseType) throw new Error('Exercise Type is a required argument.');
    if (muscleGroups && (!Array.isArray(muscleGroups) || muscleGroups.length == 0)) throw new Error(`Invalid muscle groups input: ${muscleGroups}`);

    const filteredWorkouts = await db
        .filter(function (candidateWorkout) {
            let isMatch = candidateWorkout.exerciseTypes.includes(exerciseType);
            if (duration) isMatch &= +(candidateWorkout.video.duration <= duration);
            if (muscleGroups) isMatch &= +(muscleGroups.every(muscleGroup => candidateWorkout.muscleGroups.includes(muscleGroup)));
            if (exerciseLevel) isMatch &= candidateWorkout.exerciseLevels.includes(exerciseLevel);
            return isMatch;
        })
        .value();

    return filteredWorkouts.map(filteredWorkout => filteredWorkout.video.yturl);
}

module.exports = {
    getPlayableVideo: getPlayableVideo,
};