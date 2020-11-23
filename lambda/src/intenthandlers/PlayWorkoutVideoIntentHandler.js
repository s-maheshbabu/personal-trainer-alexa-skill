const Alexa = require('ask-sdk-core');

const { APL_DOCUMENT_TYPE, APL_DOCUMENT_VERSION, VIDEO_PLAYER_COMPONENT_ID, VIDEO_PLAYER_VIEW_TOKEN } = require("constants/APL");

const ytdl = require('ytdl-core');

const doc = require("response/display/WorkoutVideoView/document.json");
const workoutVideosDataSource = require("response/display/WorkoutVideoView/datasources/default");

const videos = [
  "https://www.youtube.com/watch?v=-5ztdzyQkSQ",
  "https://www.youtube.com/watch?v=Mvo2snJGhtM",
  "https://www.youtube.com/watch?v=CBWQGb4LyAM",
  "https://www.youtube.com/watch?v=tbbZBtdd20U",
  "https://www.youtube.com/watch?v=fyzveWI25aI",
  "https://www.youtube.com/watch?v=QNAOIXhNRJs",
];

module.exports = PlayWorkoutVideoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayWorkoutVideoIntent';
  },
  async handle(handlerInput) {
    let info = await ytdl.getInfo(videos[Math.floor(Math.random() * videos.length)]);
    let highQualityAudioVideoStream = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highestvideo' });
    console.log('URL to be played', highQualityAudioVideoStream.url);

    const speakOutput = 'Here is a workout video for you.';
    const aplDirective = {
      type: APL_DOCUMENT_TYPE,
      token: VIDEO_PLAYER_VIEW_TOKEN,
      version: APL_DOCUMENT_VERSION,
      document: doc,
      datasources: {
        workoutVideosDataSource: workoutVideosDataSource(highQualityAudioVideoStream.url, VIDEO_PLAYER_COMPONENT_ID)
      },
    };

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective(aplDirective)
      .getResponse();
  }
};
