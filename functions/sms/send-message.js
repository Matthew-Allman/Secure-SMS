require("dotenv").config();
const MessagingResponse = require("twilio").twiml.MessagingResponse;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Number that was used to create twilio account (free price)
//
const verifiedPhoneNumber = process.env.TWILIO_VERIFIED_PHONE_NUMBER;
const accountPhoneNumber = process.env.TWILIO_ACCOUNT_PHONE_NUMBER;

// Can not use this number without a verified twilio number
//
const testNumber = process.env.TEST_PHONE_NUMBER;

// console.log("testNymber4", testNumber);

const client = require("twilio")(accountSid, authToken);

const outBoundMessage = async () => {
  // await client.messages
  //   .create({
  //     body: "Test message",
  //     from: accountPhoneNumber,
  //     to: verifiedPhoneNumber,
  //   })
  //   .then((message) => console.log(message));
};

const messageResponse = (message) => {
  const twiml = new MessagingResponse();
  twiml.message(message);

  return twiml;
};

module.exports = { outBoundMessage, messageResponse };
