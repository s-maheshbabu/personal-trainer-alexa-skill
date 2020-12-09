const nodemailer = require("nodemailer");
const EmailValidator = require("email-validator");

let AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

// TODO: Create an email address for personal trainer skill.
const FROM_ADDRESS = "Personal Trainer <refugee.restrooms@gmail.com>";
const SUBJECT_LINE = "Personal Trainer - Alexa Skill";

const SEND_EMAIL_LATENCY = "send-mail-latency";
const EMAIL_TRANSPORTER_INIT_LATENCY = "mail-transporter-initialization-latency";

let transporter;

/**
 * Composes an email with the given video information and sends it to the user.
 * 
 * @param {*} toAddress The address to send the email to. This has to be a valid email
 * address. Will throw otherwise.
 * @param {*} channelName The name of the video creator's channel.
 * @param {*} originalUrl URL to source of the video, for example Youtube consumer URL.
 * @param {*} videoImageUrl URL to a thumbnail image of the video.
 */
async function sendEmail(toAddress, channelName, originalUrl, videoImageUrl) {
    if (!EmailValidator.validate(toAddress)) throw new Error(`Invalid email address provided: ${toAddress}`);
    // TODO: Input validation for the remaining fields.

    console.time(SEND_EMAIL_LATENCY);
    let info = await transporter.sendMail({
        from: FROM_ADDRESS,
        to: toAddress,
        subject: SUBJECT_LINE,
        html: buildBody(channelName, originalUrl, videoImageUrl),
    });
    console.timeEnd(SEND_EMAIL_LATENCY);
    console.log(`Email successfully sent. Email Id: ${info.messageId}.`);

    // What happens if sending email fails?
}

// TODO: This still needs to be tested.
function buildBody(channelName, originalUrl, videoImageUrl) {
    let body = `
    <p style="text-align: center;"><strong>Hello,<br />Here is your workout by <span style="color: #ff9900;">${channelName}</span>.</strong></p>
<p style="text-align: center;"><a href="${originalUrl}" target="_blank" rel="noopener">Like and Subscribe</a></p>
<p><a href="${originalUrl}" target="_blank" rel="noopener"><img style="max-width: 100%; height: auto; display: block; margin-left: auto; margin-right: auto;" src="${videoImageUrl}" alt="Video Thumbnail Image" /></a></p>
`;

    return body;
}

/**
 * Initializes the email transporter.
 * 
 * @param {*} transporterForTesting A mock transporter to be injected for testing.
 * In production paths, transporter need not be provided.
 */
const init = (transporterForTesting) => {
    return new Promise((resolve, reject) => {
        if (transporterForTesting) {
            transporter = transporterForTesting;
            resolve();
        }
        else if (!transporter) {
            console.log("Creating NodeMailer SES transporter.");
            console.time(EMAIL_TRANSPORTER_INIT_LATENCY);
            transporter = nodemailer.createTransport({
                SES: new AWS.SES({
                    apiVersion: '2010-12-01'
                })
            });
            console.timeEnd(EMAIL_TRANSPORTER_INIT_LATENCY);
            resolve();
        } else {
            resolve();
        }
    });
};

module.exports = {
    init: init,
    sendEmail: sendEmail,
};