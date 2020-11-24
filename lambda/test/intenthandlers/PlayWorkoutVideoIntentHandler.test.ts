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

const mockPlayableURL = "mock playable url";
const mockChannelName = "mock channel name";
const mockChannelUrl = "mock channel url";
const mockVideoTitle = "mock video title";

setupYtdlCoreMock('https://www.youtube.com/watch?v=-5ztdzyQkSQ');
rewiremock.enable();
import { handler as skillHandler } from '../../src/index';
rewiremock.disable();

const alexaTest = new AlexaTest(skillHandler, skillSettings);

const intentName = 'PlayWorkoutVideoIntent';

const workoutVideoViewDocument = require("../../src/response/display/WorkoutVideoView/document.json");
const { VIDEO_PLAYER_COMPONENT_ID, VIDEO_PLAYER_VIEW_TOKEN } = require("../../src/constants/APL");

describe.only("Playing the requested video on APL devices", () => {
    describe('should be able to search and play the requested workout video', () => {
        alexaTest.test([
            {
                request: new IntentRequestBuilder(skillSettings, intentName).withInterfaces({ apl: true }).build(),
                says: `Here is ${mockVideoTitle} from ${mockChannelName}. Enjoy your workout.`,
                shouldEndSession: undefined,
                get renderDocument() {
                    return {
                        token: VIDEO_PLAYER_VIEW_TOKEN,
                        document: (doc: any) => {
                            return deepEqual(doc, workoutVideoViewDocument);
                        },
                        hasDataSources: {
                            workoutVideoDataSource: (ds: any) => {
                                expect(ds.url).to.equal(mockPlayableURL);
                                expect(ds.videoPlayerId).to.equal(VIDEO_PLAYER_COMPONENT_ID);

                                return true;
                            },
                        },
                    }
                },
            },
        ]);
    });
});

function setupYtdlCoreMock(url) {
    const videoInfo = { author: { channel_url: mockChannelUrl, name: mockChannelName }, formats: [{ url: 'someUrl' }, { url: 'someOtherUrl' }], videoDetails: { title: mockVideoTitle } };
    const ytdlGetInfoStub = sinon.stub();
    ytdlGetInfoStub
        .withArgs(url).onFirstCall().returns(videoInfo)
        .onSecondCall().throws("unexpected call to ytdl-core/getInfo");

    const ytdlChooseFormatStub = sinon.stub();
    ytdlChooseFormatStub
        .withArgs(videoInfo.formats, { filter: 'audioandvideo', quality: 'highestvideo' }).onFirstCall().returns({ url: mockPlayableURL })
        .onSecondCall().throws("unexpected call to ytdl-core/chooseFormat");

    rewiremock('ytdl-core')
        .with({
            getInfo: ytdlGetInfoStub,
            chooseFormat: ytdlChooseFormatStub,
        });
}
