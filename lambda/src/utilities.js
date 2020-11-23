const Alexa = require('ask-sdk-core');

/**
 * Helper method to find if a request is for a certain apiName.
 */
const isApiRequest = (handlerInput, apiName) => {
    try {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Dialog.API.Invoked'
            && handlerInput.requestEnvelope.request.apiRequest.name === apiName;
    } catch (e) {
        console.log('Error occurred: ', e);
        return false;
    }
}

/**
 * Helper method to fetch the name of the intent. Will throw an error if the given
 * request object is not an IntentRequest.
 */
const getIntentName = (handlerInput) => {
    if (Alexa.getRequestType(handlerInput.requestEnvelope) !== 'IntentRequest')
        throw Error(`The given object is not an intent request and so an intent name cannot be determined. Input: ${handlerInput}`);

    return handlerInput.requestEnvelope.request.intent.name;
}

/**
 * Helper method to find if a request is an IntentRequest of the specified intent.
 */
const isIntent = (handlerInput, intentName) => {
    try {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === intentName;
    } catch (e) {
        console.log('Error occurred: ', e);
        return false;
    }
}

module.exports = {
    getIntentName: getIntentName,
    isApiRequest: isApiRequest,
    isIntent: isIntent,
};