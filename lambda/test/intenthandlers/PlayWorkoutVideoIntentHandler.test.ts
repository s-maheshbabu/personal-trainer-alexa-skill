import { expect } from 'chai';
const sinon = require("sinon");

import { rewiremock } from '../rewiremock';

import * as deepEqual from 'deep-equal';

import { AlexaTest, IntentRequestBuilder, SkillSettings } from 'ask-sdk-test';
const skillSettings: SkillSettings = {
    appId: 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000',
    userId: 'amzn1.ask.account.VOID',
    deviceId: 'amzn1.ask.device.VOID',
    locale: 'en-US',
    debug: false,
};

rewiremock('ytdl-core').dynamic();
rewiremock.enable();
import { handler as skillHandler } from '../../src/index';
rewiremock.disable();

const alexaTest = new AlexaTest(skillHandler, skillSettings);

const intentName = 'PlayWorkoutVideoIntent';

const workoutVideoViewDocument = require("../../src/response/display/WorkoutVideoView/document.json");
const { VIDEO_PLAYER_COMPONENT_ID, VIDEO_PLAYER_VIEW_TOKEN } = require("../../src/constants/APL");

const Duration_Key = "Duration";
const ExerciseLevel_Key = "ExerciseLevel";
const ExerciseType_Key = "ExerciseType";
const MuscleGroup_Key = "MuscleGroups";

describe("Playing the requested video on APL devices", () => {
    describe('should be able to search and play the requested workout video when there is just a single match', () => {
        const intent = new IntentRequestBuilder(skillSettings, intentName).withInterfaces({ apl: true }).build();
        const sessionAttributes = {
            [ExerciseType_Key]: 'CARDIO',
            [MuscleGroup_Key]: ['UPPER_BACK'],
        }
        injectSessionAttributes(sessionAttributes, intent);

        const expectedVideo = 'https://url/3';
        const mockValues = setupYtdlCoreMock(expectedVideo);
        alexaTest.test([
            {
                request: intent,
                says: `Here is ${mockValues.mockVideoTitle} from ${mockValues.mockChannelName}. Enjoy your workout.`,
                shouldEndSession: undefined,
                get renderDocument() {
                    return {
                        token: VIDEO_PLAYER_VIEW_TOKEN,
                        document: (doc: any) => {
                            return deepEqual(doc, workoutVideoViewDocument);
                        },
                        hasDataSources: {
                            workoutVideoDataSource: (ds: any) => {
                                expect(ds.url).to.equal(mockValues.mockPlayableURL);
                                expect(ds.videoPlayerId).to.equal(VIDEO_PLAYER_COMPONENT_ID);

                                return true;
                            },
                        },
                    }
                },
            },
        ]);
    });

    describe.only('should render an appropriate error message when there are no playable videos matching the given criteria', () => {
        const intent = new IntentRequestBuilder(skillSettings, intentName).withInterfaces({ apl: true }).build();
        const sessionAttributes = {
            [ExerciseType_Key]: 'YOGA',
            [MuscleGroup_Key]: ['BICEPS'],
        }
        injectSessionAttributes(sessionAttributes, intent);

        alexaTest.test([
            {
                request: intent,
                says: `I am sorry but I do not have any videos matching your preferences. Good bye.`,
                shouldEndSession: true,
            },
        ]);
    });
});

// ask-sdk-test currently doesn't support injecting session attributes. Doing it here for now.
function injectSessionAttributes(sessionAttributes, intent) {
    intent.session = {
        'new': true,
        'sessionId': "sessionId",
        'user': { 'userId': 'userId' },
        'attributes': sessionAttributes,
        'application': { 'applicationId': 'applicationId' },
    };
}

function setupYtdlCoreMock(url) {
    const mockChannelName = `mock-channel-name-for-${url}`;
    const mockChannelUrl = `mock-channel-url-for-${url}`;
    const mockPlayableURL = `mock-playable-url-for-${url}`;
    const mockVideoTitle = `mock-video-title-for-${url}`;

    const videoInfo = { formats: [{ url: 'someUrl' }, { url: 'someOtherUrl' }], videoDetails: { author: { channel_url: mockChannelUrl, name: mockChannelName }, title: mockVideoTitle } };
    const ytdlGetInfoStub = sinon.stub();
    ytdlGetInfoStub
        .withArgs(url).onFirstCall().returns(videoInfo)
        .onSecondCall().throws("unexpected call to ytdl-core/getInfo");

    const ytdlChooseFormatStub = sinon.stub();
    ytdlChooseFormatStub
        .withArgs(videoInfo.formats, { filter: 'audioandvideo', quality: 'highestvideo' }).onFirstCall().returns({ url: mockPlayableURL })
        .onSecondCall().throws("unexpected call to ytdl-core/chooseFormat");

    const ytdlMock = rewiremock.getMock('ytdl-core');
    ytdlMock
        .with({
            getInfo: ytdlGetInfoStub,
            chooseFormat: ytdlChooseFormatStub,
        });

    return {
        mockChannelName: mockChannelName,
        mockChannelUrl: mockChannelUrl,
        mockVideoTitle: mockVideoTitle,
        mockPlayableURL: mockPlayableURL,
    }
}
