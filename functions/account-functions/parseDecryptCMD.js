const { db } = require("../../utils/database");

const encryptionPassphrase = process.env.ENCRYPTION_PASSPHRASE;

// Function to parse a -d or decrypt command to get the parameters
// message, encryption type, and encryption key
//
const getDecryptParams = async (phoneNumber, message) => {
  let returnMessage = "";

  try {
    let encryptedMessage = "";
    let configName = "";
    let encryptionType = "";
    let keyString = "";

    // Replace the -d and split the string by &&
    //
    const parameters = message.replace("-d", "").split("&&");

    // Parse the users message and get the specifed fields
    //
    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i];

      if (parameter.includes("NAME:")) {
        configName = parameter.split(":")[1].replaceAll(" ", "");
      } else if (parameter.includes("MESSAGE:")) {
        encryptedMessage = parameter.replace("MESSAGE: ", "");

        if (encryptedMessage[0] == " ") {
          encryptedMessage = encryptedMessage.substring(1);
        }
      } else if (parameter.includes("METHOD:")) {
        encryptionType = parameter.split(":")[1].replaceAll(" ", "");
      } else if (parameter.includes("KEY:")) {
        keyString = parameter.split(":")[1].replaceAll(" ", "");
      }
    }

    // Test if the encrypted message was received
    //
    if (encryptedMessage) {
      // Test if the user simply specifed and encryption type and key string
      //
      if (encryptionType.length > 0 && keyString.length > 0) {
        return { encryptedMessage, encryptionType, keyString };
      } else if (configName.length > 0) {
        // Select and decrypt the encryption passphrase AS passphrase and the method
        // using a join on the Configurations and VerifiedNumbers tables
        //
        await db
          .promise()
          .query(
            `SELECT AES_DECRYPT(Configurations.encryptionPassphrase, '${encryptionPassphrase}') AS passphrase, Configurations.encryptionMethod FROM Configurations, VerifiedNumbers WHERE Configurations.configName = '${configName}' AND VerifiedNumbers.phoneNumber = '${phoneNumber}' AND Configurations.userID = VerifiedNumbers.userID`
          )
          .then((response) => {
            if (response[0].length > 0) {
              keyString = response[0][0].passphrase.toString();
              encryptionType = response[0][0].encryptionMethod;
            } else {
              returnMessage =
                "There is no config setting with this name for this account. Please specify one.";
            }
          })
          .catch(() => {
            returnMessage =
              "Error while getting the encryption config information, please try again.";
          });

        if (encryptionType && keyString) {
          return { encryptedMessage, encryptionType, keyString };
        }
      } else {
        await db
          .promise()
          .query(
            `SELECT AES_DECRYPT(Configurations.encryptionPassphrase, '${encryptionPassphrase}') AS passphrase, Configurations.encryptionMethod FROM Configurations, VerifiedNumbers WHERE Configurations.defaultSetting = 1 AND VerifiedNumbers.phoneNumber = '${phoneNumber}' AND Configurations.userID = VerifiedNumbers.userID`
          )
          .then((response) => {
            if (response[0].length > 0) {
              keyString = response[0][0].passphrase.toString();
              encryptionType = response[0][0].encryptionMethod;
            } else {
              returnMessage =
                "There is no default config setting for this account. Please specify one.";
            }
          })
          .catch((err) => {
            returnMessage =
              "Error while getting the encryption config information, please try again.";
          });

        if (encryptionType && keyString) {
          return { encryptedMessage, encryptionType, keyString };
        }
      }
    } else {
      returnMessage = "Please provide a message for decryption.";
    }
  } catch (e) {
    returnMessage =
      "Please follow the format provided in the user guide for decrypting messages.";
  }

  return returnMessage;
};

module.exports = { getDecryptParams };
