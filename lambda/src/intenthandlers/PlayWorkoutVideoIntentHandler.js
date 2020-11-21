const Alexa = require('ask-sdk-core');

const ytdl = require('ytdl-core');

const doc = require("response/display/WorkoutVideoView/document.json");
const workoutVideosDataSource = require("response/display/WorkoutVideoView/datasources/default");

const videos = [
  "https://www.youtube.com/watch?v=-5ztdzyQkSQ",
  "https://www.youtube.com/watch?v=Mvo2snJGhtM",
];

module.exports = PlayWorkoutVideoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayWorkoutVideoIntent';
  },
  async handle(handlerInput) {

    let info = await ytdl.getInfo(videos[Math.random() < 0.5 ? 0 : 1]);
    let highQualityAudioVideoStream = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highestvideo' });
    console.log('URL to be played', highQualityAudioVideoStream.url);

    const speakOutput = 'Here is a workout video for you.';
    const aplDirective = {
      type: "Alexa.Presentation.APL.RenderDocument",
      version: "1.4",
      document: doc,
      datasources: {
        workoutVideosDataSource: workoutVideosDataSource(highQualityAudioVideoStream.url)
      },
    };

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective(aplDirective)
      .getResponse();
  }
};
