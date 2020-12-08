import { assert, expect } from 'chai';
import * as deepEqual from 'deep-equal';

const eventtypes = require("../../src/constants/EventTypes").eventtypes;

import { AlexaTest, AplUserEventRequestBuilder, SkillSettings } from 'ask-sdk-test';
const skillSettings: SkillSettings = {
    appId: 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000',
    userId: 'amzn1.ask.account.VOID',
    deviceId: 'amzn1.ask.device.VOID',
    locale: 'en-US',
    debug: false,
};

import { handler as skillHandler } from "../../src/index";
const alexaTest = new AlexaTest(skillHandler, skillSettings);

const endOfWorkoutDocument = require("../../src/response/display/EndOfWorkoutView/document.json");
const exitSkillDocument = require("../../src/response/display/ExitSkillView/document.json");

describe("Handle end of video event", () => {
    describe('should encourage the users to like and subscribe to the channel of the workout video creator.', () => {
        const mockChannelName = 'mockChannelName';
        const mockOriginalUrl = 'mockOriginalUrl';
        const mockVideoImageUrl = 'mockVideoImageUrl';
        alexaTest.test([
            {
                request: new AplUserEventRequestBuilder(skillSettings)
                    .withArguments(eventtypes.WorkoutEnded, mockChannelName, mockOriginalUrl, mockVideoImageUrl)
                    .withInterfaces({ apl: true }).build(),
                says: `Hope you had a great workout. You can show your appreciation for ${mockChannelName} by liking and subscribing to their content. See you soon for your next workout.`,
                shouldEndSession: undefined,
                get renderDocument() {
                    return {
                        document: (doc: any) => {
                            return deepEqual(doc, endOfWorkoutDocument);
                        },
                        hasDataSources: {
                            endOfWorkoutDataSource: (ds: any) => {
                                assert(deepEqual(ds.sendEmailEvent, {
                                    type: "SendEvent",
                                    arguments: [
                                        eventtypes.SendEmail,
                                        mockChannelName,
                                        mockOriginalUrl,
                                        mockVideoImageUrl,
                                    ]
                                }));

                                expect(ds.videoImageUrl).to.equal(mockVideoImageUrl);
                                expect(ds.channelName).to.equal(mockChannelName);
                                expect(ds.originalUrl).to.equal(mockOriginalUrl);

                                return true;
                            },
                        },
                    }
                },
            },
        ]);
    });
});

describe("Handle send email event", () => {
    describe('should send an email with the workout video details to the user.', () => {
        const mockChannelName = 'mockChannelName';
        const mockOriginalUrl = 'mockOriginalUrl';
        const mockVideoImageUrl = 'mockVideoImageUrl';
        alexaTest.test([
            {
                request: new AplUserEventRequestBuilder(skillSettings)
                    .withArguments(eventtypes.SendEmail, mockChannelName, mockOriginalUrl, mockVideoImageUrl)
                    .withInterfaces({ apl: true }).build(),
                says: `Done. See you on your next workout. Good bye.`,
                shouldEndSession: undefined,
                get renderDocument() {
                    return {
                        document: (doc: any) => {
                            return deepEqual(doc, exitSkillDocument);
                        },
                    }
                },
            },
        ]);
    });
});
