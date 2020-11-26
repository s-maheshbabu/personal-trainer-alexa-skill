/**
* Create an entry point to satisfy Alexa's requirements without changing the code structure.
* Alexa-hosted skills cannot be configured to invoke lambda/src/index and require that the index
* file be at lambda/index. Hence this entry point which immediately routes to the actual index.
 * */
exports.handler = require('./src/index').handler;