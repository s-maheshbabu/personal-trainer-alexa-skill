import { assert, expect } from 'chai';
import * as deepEqual from 'deep-equal';

const eventtypes = require("../../src/constants/EventTypes").eventtypes;

const nock = require('nock')
const Mailer = require("gateway/Mailer.js");
const nodemailerMock = require('nodemailer-mock');

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
        const ALEXA_API_ENDPOINT = "https://api.amazonalexa.com/";

        const FROM_EMAIL_ADDRESS = "Personal Trainer <refugee.restrooms@gmail.com>";
        const DUMMY_EMAIL_ADDRESS = "success@simulator.amazonses.com";

        const transporter = nodemailerMock.createTransport({
            host: '127.0.0.1',
            port: -100,
        });

        beforeEach(() => {
            configureUpsService(200, ALEXA_API_ENDPOINT, DUMMY_EMAIL_ADDRESS);
            Mailer.init(transporter);
        });

        afterEach(function () {
            nodemailerMock.mock.reset();
        });

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
                callback: () => {
                    // Verify that an email was sent.
                    const sentMail = nodemailerMock.mock.getSentMail();
                    expect(sentMail.length).to.equal(1);
                    expect(sentMail[0].from).to.equal(FROM_EMAIL_ADDRESS);
                    expect(sentMail[0].to).to.equal(DUMMY_EMAIL_ADDRESS);

                    expect(sentMail[0].subject).to.equal(`Personal Trainer - Alexa Skill`);

                    const htmlBody = sentMail[0].html;
                    expect(htmlBody.includes(`Here is your workout by`)).to.be.true;
                },
            },
        ]);
    });

    describe('should tell the user that we are unable to send an email because we do not have permissions to access their email address', () => {
        const mockChannelName = 'mockChannelName';
        const mockOriginalUrl = 'mockOriginalUrl';
        const mockVideoImageUrl = 'mockVideoImageUrl';
        alexaTest.test([
            {
                request: new AplUserEventRequestBuilder(skillSettings)
                    .withArguments(eventtypes.SendEmail, mockChannelName, mockOriginalUrl, mockVideoImageUrl)
                    .withInterfaces({ apl: true }).build(),
                says: `Sorry but I do not have permissions to email you. Please consider granting email access for the future. Good bye.`,
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

function configureUpsService(responseCode, apiEndpoint, payload) {
    if (!nock.isActive()) {
        nock.activate();
    }

    nock(apiEndpoint)
        .get(`/v2/accounts/~current/settings/Profile.email`)
        .query(true)
        .reply(responseCode, JSON.stringify(payload, null, 2));
}
