const Alexa = require('ask-sdk-core');

module.exports = UnsupportedPlaybackControlsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOnIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOffIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOffIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOnIntent');
  },
  handle(handlerInput) {
    console.log(`Received a fallback intent: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    const speakOutput = `Sorry, I don't support that operation yet. Coming soon.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
