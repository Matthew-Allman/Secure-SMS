require("dotenv").config();
const { db } = require("../../utils/database");
const { encryptMessage } = require("../crypto/encrypt");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);
const MessagingResponse = require("twilio").twiml.MessagingResponse;

// Twilio credential keys
//

// Twilio provided phone number
//
const accountPhoneNumber = process.env.TWILIO_ACCOUNT_PHONE_NUMBER;

const encryptionPassphrase = process.env.ENCRYPTION_PASSPHRASE;

// Function to encrypt data and send to specified numbers or persons
//
const outBoundMessage = async (phoneNumber, message) => {
  let returnMessage = "";

  try {
    const parameters = message.replace("-e", "").split("&&");

    let configName = "";
    let outMessage = "";
    let sendTo = "";

    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i];

      if (parameter.includes("NAME:")) {
        configName = parameter.split(":")[1].replaceAll(" ", "");
      } else if (parameter.includes("MESSAGE:")) {
        outMessage = parameter.replace("MESSAGE: ", "");

        if (outMessage[0] == " ") {
          outMessage = outMessage.substring(1);
        }
      } else if (parameter.includes("SENDTO:")) {
        sendTo = parameter.split(":")[1].replaceAll(" ", "");
      }
    }

    let defaultConfig = configName.length == 0;

    let encryptionMethod = "";
    let secretPassphrase = "";

    if (defaultConfig) {
      await db
        .promise()
        .query(
          `SELECT AES_DECRYPT(Configurations.encryptionPassphrase, '${encryptionPassphrase}') AS passphrase, Configurations.encryptionMethod FROM Configurations, VerifiedNumbers WHERE Configurations.defaultSetting = 1 AND VerifiedNumbers.phoneNumber = '${phoneNumber}' AND Configurations.userID = VerifiedNumbers.userID`
        )
        .then((response) => {
          if (response[0].length > 0) {
            secretPassphrase = response[0][0].passphrase.toString();
            encryptionMethod = response[0][0].encryptionMethod;
          } else {
            returnMessage =
              "There is no default config setting for this account. Please specify one.";
          }
        })
        .catch((err) => console.log(err));
    } else {
      await db
        .promise()
        .query(
          `SELECT AES_DECRYPT(Configurations.encryptionPassphrase, '${encryptionPassphrase}') AS passphrase, Configurations.encryptionMethod FROM Configurations, VerifiedNumbers WHERE Configurations.configName = '${configName}' AND VerifiedNumbers.phoneNumber = '${phoneNumber}' AND Configurations.userID = VerifiedNumbers.userID`
        )
        .then((response) => {
          if (response[0].length > 0) {
            secretPassphrase = response[0][0].passphrase.toString();
            encryptionMethod = response[0][0].encryptionMethod;
          } else {
            returnMessage =
              "There is no config setting with this name for this account. Please specify one.";
          }
        })
        .catch((err) => console.log(err));
    }

    if (encryptionMethod && encryptionPassphrase) {
      const encryptedText = encryptMessage(
        outMessage,
        encryptionMethod,
        secretPassphrase
      );

      if (encryptedText.length > 0) {
        if (sendTo.length > 0) {
          sendTo = sendTo.replaceAll(" ", "");

          if (sendTo.includes(",")) {
            const numbersToMessage = sendTo.split(",");

            numbersToMessage.forEach(async function (number) {
              number = number.replaceAll(" ", "");

              if (number.includes("'")) {
                const contactName = number.replaceAll("'", "");

                await db
                  .promise()
                  .query(
                    `SELECT Contacts.contactNumber FROM Contacts, VerifiedNumbers WHERE Contacts.contactName = '${contactName}' AND VerifiedNumbers.phoneNumber = '${phoneNumber}' AND VerifiedNumbers.userID = Contacts.userID`
                  )
                  .then((response) => {
                    if (response[0].length > 0) {
                      number = response[0][0].contactNumber;
                    } else {
                      number = "";
                      returnMessage += `${contactName} is not a valid contact name for this account. `;
                    }
                  })
                  .catch(() => {
                    number = "";
                    returnMessage += `Something went wrong when sending to ${contactName}. `;
                  });
              }

              if (number.length > 0) {
                await client.messages
                  .create({
                    body: encryptedText,
                    from: accountPhoneNumber,
                    to: number,
                  })
                  .then((message) => {
                    if (message.status == "failed") {
                      returnMessage += `Failed: ${number}. `;
                    } else if (message.status == "sent") {
                      returnMessage += `Message sent to ${number}. `;
                    }
                  })
                  .catch(() => {})
                  .done();
              }
            });
          } else {
            sendTo = sendTo.replaceAll(" ", "");

            if (sendTo.includes("'")) {
              const contactName = number.replaceAll("'", "");

              await db
                .promise()
                .query(
                  `SELECT Contacts.contactNumber FROM Contacts, VerifiedNumbers WHERE Contacts.contactName = '${contactName}' AND VerifiedNumbers.phoneNumber = '${phoneNumber}' AND VerifiedNumbers.userID = Contacts.userID`
                )
                .then((response) => {
                  if (response[0].length > 0) {
                    sendTo = response[0][0].contactNumber;
                  } else {
                    sendTo = "";
                    returnMessage += `${contactName} is not a valid contact name for this account. `;
                  }
                })
                .catch(() => {
                  sendTo = "";
                  returnMessage += `Something went wrong when sending to ${contactName}. `;
                });
            }

            if (sendTo.length > 0) {
              await client.messages
                .create({
                  body: encryptedText,
                  from: accountPhoneNumber,
                  to: sendTo,
                })
                .then((message) => {
                  if (message.status == "failed") {
                    returnMessage += `Failed: ${sendTo}. `;
                  } else {
                    returnMessage += `Message sent to ${sendTo}. `;
                  }
                });
            }
          }
        } else {
          returnMessage = encryptedText;
        }
      } else {
        console.log("Something went wrong, please try again.");
      }
    }
  } catch (e) {
    returnMessage =
      "Please follow the format in the user guide for sending messages.";
  }

  return returnMessage;
};

const messageResponse = (message) => {
  const twiml = new MessagingResponse();
  twiml.message(message);

  return twiml;
};

module.exports = { outBoundMessage, messageResponse };
