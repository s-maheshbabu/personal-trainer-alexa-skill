module.exports = ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`ERROR: ${error}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I didn't get that. Please try again.")
      .withShouldEndSession(true)
      .getResponse();
  }
};
