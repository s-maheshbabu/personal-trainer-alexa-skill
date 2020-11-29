const Alexa = require('ask-sdk-core');
const exitSkillDocument = require("response/display/ExitSkillView/document.json");

const { APL_DOCUMENT_TYPE, APL_DOCUMENT_VERSION } = require("constants/APL");

module.exports = CancelAndStopAndNoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective({
        type: APL_DOCUMENT_TYPE,
        version: APL_DOCUMENT_VERSION,
        document: exitSkillDocument,
      })
      .getResponse();
  }
};
