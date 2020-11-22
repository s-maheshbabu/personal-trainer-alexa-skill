const utilities = require("utilities");

module.exports = StartWorkoutAPI = {
    canHandle(handlerInput) {
        return utilities.isApiRequest(handlerInput, 'StartWorkoutAPI');
    },
    async handle(handlerInput) {
        return {
            directives: [{
                type: 'Dialog.DelegateRequest',
                target: 'skill',
                period: {
                    until: 'EXPLICIT_RETURN'
                },
                updatedRequest: {
                    type: 'IntentRequest',
                    intent: {
                        name: 'PlayWorkoutVideoIntent',
                    }
                }
            }],
        }
    }
}