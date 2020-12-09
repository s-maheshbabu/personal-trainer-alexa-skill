const Alexa = require('ask-sdk-core');

const { APL_DOCUMENT_TYPE, APL_DOCUMENT_VERSION, APL_INTERFACE, VIDEO_PLAYER_COMPONENT_ID, VIDEO_PLAYER_VIEW_TOKEN } = require("constants/APL");

const videoIndex = require('data/VideoIndex');

const getEmailAddress = require("utilities").getEmailAddress;
const Mailer = require("gateway/Mailer.js");
const scopes = require("constants/Scopes").scopes;

const doc = require("response/display/WorkoutVideoView/document.json");
const workoutVideoDataSource = require("response/display/WorkoutVideoView/datasources/default");

module.exports = PlayWorkoutVideoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayWorkoutVideoIntent';
  },
  async handle(handlerInput) {
    const { attributesManager, requestEnvelope } = handlerInput;

    const sessionAttributes = attributesManager.getSessionAttributes();
    const duration = sessionAttributes.Duration;
    const exerciseLevel = sessionAttributes.ExerciseLevel;
    // TODO: ExerciseType is a mandatory field and so assert on its presence.
    const exerciseType = sessionAttributes.ExerciseType;
    const muscleGroups = sessionAttributes.MuscleGroups;

    const playable = await videoIndex.getPlayableVideo(exerciseType, duration, muscleGroups, exerciseLevel);
    if (!playable) {
      console.log(`No playable videos were found for the given criteria: ${JSON.stringify(sessionAttributes)}`);
      return handlerInput.responseBuilder
        .speak(`I am sorry but I do not have any videos matching your preferences. Good bye.`)
        .withShouldEndSession(true)
        .getResponse();
    }

    console.log(`Video selected: ${JSON.stringify(playable)}`);

    if (!Alexa.getSupportedInterfaces(requestEnvelope).hasOwnProperty(APL_INTERFACE)) {
      const builder = handlerInput.responseBuilder
        .withShouldEndSession(true)
        .withSimpleCard(playable.title, playable.originalUrl);

      const emailAddress = await getEmailAddress(handlerInput);
      if (!emailAddress) builder.withAskForPermissionsConsentCard([scopes.EMAIL_SCOPE]);
      else await Mailer.sendEmail(emailAddress, playable.channelName, playable.originalUrl, playable.videoImageUrl);

      builder.speak(`I found ${playable.title} from ${playable.channelName} and ${emailAddress ? `emailed you a link` : `would love to email you a link to the video. I put a card in the Alexa app asking permission to access your email address so I can email your workout videos`}. By the way, try using the skill on Alexa devices with screen, like the Echo Show or Fire TV. I can play the video too on those devices.`);
      return builder.getResponse();
    }

    const speakOutput = `Here is ${playable.title} from ${playable.channelName}. Enjoy your workout.`;
    const aplDirective = {
      type: APL_DOCUMENT_TYPE,
      token: VIDEO_PLAYER_VIEW_TOKEN,
      version: APL_DOCUMENT_VERSION,
      document: doc,
      datasources: {
        workoutVideoDataSource: workoutVideoDataSource(playable.channelName, playable.originalUrl, playable.url, playable.videoImageUrl, VIDEO_PLAYER_COMPONENT_ID, playable.title)
      },
    };

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective(aplDirective)
      .getResponse();
  }
};
