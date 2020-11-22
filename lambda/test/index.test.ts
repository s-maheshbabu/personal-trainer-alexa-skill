const assert = require("chai").assert;
const expect = require("chai").expect;

const AlexaTest = require('ask-sdk-test').AlexaTest;
const LaunchRequestBuilder = require('ask-sdk-test').LaunchRequestBuilder;
const SkillSettings = require('ask-sdk-test').SkillSettings;

const skillHandler = require("../src/index").handler;

const skillSettings: typeof SkillSettings = {
    appId: 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000',
    userId: 'amzn1.ask.account.VOID',
    deviceId: 'amzn1.ask.device.VOID',
    locale: 'en-US',
    debug: false,
};

const alexaTest = new AlexaTest(skillHandler, skillSettings);

describe("Skill Luanch", () => {
    describe('should be able to launch the skill and render a welcome message.', () => {
        alexaTest.test([
            {
                request: new LaunchRequestBuilder(skillSettings).build(),
                says: `Welcome, to personal trainer. This is a placeholder?`,
                reprompts: `Welcome, to personal trainer. This is a placeholder?`,
                shouldEndSession: false,
            },
        ]);
    });

});
