const Alexa = require('ask-sdk-core');

module.exports = FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    console.log(`Received a fallback intent: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    const speakOutput = `Sorry, I don't know about that. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
