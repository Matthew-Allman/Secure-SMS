const { db } = require("../../utils/database");

const { encryptionMethods } = require("../../constants");

// Key used to encrypt sensitive data that will be stored in the DB
//
const encryptionPassphrase = process.env.ENCRYPTION_PASSPHRASE;

// Function to list all numbers associated with a users account
//
const listNumbers = async (phoneNumber) => {
  // String that will contain each number in a comma seperated list
  //
  let numberStr = "";

  const subQuery = `SELECT userID FROM VerifiedNumbers WHERE phoneNumber = '${phoneNumber}'`;

  await db
    .promise()
    .query(
      `SELECT phoneNumber, permAuth FROM VerifiedNumbers WHERE userID = (${subQuery})`
    )
    .then((response) => {
      if (response[0].length > 0) {
        const numberArr = response[0];

        // Add the numbers to the return string
        //
        numberArr.map((item, index) => {
          if (index == numberArr.length - 1) {
            item.permAuth = item.permAuth == 1 ? true : false;

            numberStr += JSON.stringify(item);
          } else {
            item.permAuth = item.permAuth == 1 ? true : false;

            numberStr += JSON.stringify(item) + " && ";
          }
        });
      } else {
        numberStr = "Something went wrong, please try again.";
      }
    })
    .catch((err) => console.log(err));

  return numberStr;
};

// Function to list all encryption configs associated with a users account
//
const listConfigs = async (phoneNumber) => {
  // String that will contain each config in a comma seperated list
  //
  let configStr = "";

  const subQuery = `SELECT userID FROM VerifiedNumbers WHERE phoneNumber = '${phoneNumber}'`;

  await db
    .promise()
    .query(
      `SELECT configName, encryptionMethod FROM Configurations WHERE userID = (${subQuery})`
    )
    .then((response) => {
      if (response[0].length > 0) {
        const configArr = response[0];

        // Add the numbers to the return string
        //
        configArr.map((item, index) => {
          if (index == configArr.length - 1) {
            configStr += JSON.stringify(item);
          } else {
            configStr += JSON.stringify(item) + " && ";
          }
        });
      } else {
        configStr = "Something went wrong, please try again.";
      }
    })
    .catch((err) => console.log(err));

  return configStr;
};

// Function to create a contact
//
const createContact = async (phoneNumber, body) => {
  let message = "";

  try {
    const parameters = body.split(":")[1];

    const paramArr = parameters.split("&&");

    const contactName = paramArr[0].replaceAll(" ", "");
    const contactNumber = paramArr[1].replaceAll(" ", "");

    if (contactName && contactNumber) {
      await db
        .promise()
        .query(
          `SELECT contactName FROM Contacts, VerifiedNumbers WHERE VerifiedNumbers.phoneNumber = '${phoneNumber}' AND VerifiedNumbers.userID = Contacts.userID
                `
        )
        .then(async (response) => {
          if (response[0].length > 0) {
            message = "Contact name already exists.";
          } else {
            const subQuery = `SELECT userID FROM VerifiedNumbers WHERE phoneNumber = '${phoneNumber}'`;

            await db
              .promise()
              .query(
                `INSERT INTO Contacts SET userID = (${subQuery}), contactName = '${contactName}', contactNumber = '${contactNumber}'`
              )
              .then((res) => {
                if (res[0].affectedRows > 0) {
                  message = `Successfully added new contact name: ${contactName}, phoneNumber: ${contactNumber}`;
                } else {
                  message = "An error has occured.";
                }
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  } catch (e) {
    message = "Please follow the format specified in the user guide.";
  }
  return message;
};
// Function to list all the contacts associated with a user
// Not fully complete
//
const listContacts = async (phoneNumber) => {
  // String that will contain each contact in a comma seperated list
  //

  let contactStr = "";

  const subQuery = `SELECT userID FROM VerifiedNumbers WHERE phoneNumber = '${phoneNumber}'`;

  await db
    .promise()
    .query(
      `SELECT AES_DECRYPT(contactName, '${encryptionPassphrase}'), AES_DECRYPT(contactNumber, '${encryptionPassphrase}')  FROM Contacts WHERE userID = (${subQuery})`
    )
    .then((response) => {
      if (response[0].length > 0) {
        const contactArr = response[0];

        // Add the numbers to the return string
        //
        contactArr.map((item, index) => {
          if (index == contactArr.length - 1) {
            contactStr += JSON.stringify(item);
          } else {
            contactStr += JSON.stringify(item) + " && ";
          }
        });
      } else {
        contactStr = "Something went wrong, please try again.";
      }
    })
    .catch((err) => console.log(err));

  return contactStr;
};

// Function to create an encryption config for the user
//
const createConfig = async (phoneNumber, message) => {
  let returnMessage = "";

  try {
    const parameters = message.split(":")[1];

    const paramArr = parameters.split("&&");

    let name = paramArr[0];
    let method = paramArr[1];
    let passphrase = paramArr[2];
    let defaultConfig = paramArr[3];

    if (name && method && passphrase) {
      name = name.replaceAll(" ", "").toLowerCase();
      method = method.replaceAll(" ", "");
      passphrase = passphrase.replaceAll(" ", "");

      if (encryptionMethods.includes(method.toLowerCase())) {
        if (typeof defaultConfig === "string") {
          defaultConfig = defaultConfig.replaceAll(" ", "").toLowerCase();
        }

        let dupName = false;

        // Test if the user already has a config with this name
        //
        await db
          .promise()
          .query(
            `SELECT configName FROM Configurations, VerifiedNumbers WHERE VerifiedNumbers.phoneNumber = '${phoneNumber}' AND VerifiedNumbers.userID = Configurations.userID AND Configurations.configName = '${name}'`
          )
          .then((response) => {
            if (response[0].length > 0) {
              dupName = true;
            } else {
            }
          })
          .catch((err) => {
            console.log(err);
          });

        if (dupName) {
          returnMessage =
            "The config name you provided is already being used by this account. Please choose another";
        } else {
          const subQuery = `SELECT userID FROM VerifiedNumbers WHERE phoneNumber = '${phoneNumber}'`;

          defaultConfig = defaultConfig
            ? defaultConfig.includes("y")
              ? true
              : false
            : false;

          await db
            .promise()
            .query(
              `INSERT INTO Configurations SET userID = (${subQuery}), configName = '${name}', encryptionMethod = '${method}', encryptionPassphrase = AES_ENCRYPT('${passphrase}', '${encryptionPassphrase}'), defaultSetting = ${defaultConfig}`
            )
            .then((response) => {
              if (response[0].affectedRows > 0) {
                returnMessage = `Encryption: ${name} has been created. Keep a note of your passphrase, as we will not display it again.`;
              } else {
                returnMessage = "Something went wrong, please try again.";
              }
            })
            .catch((err) => console.log(err));
        }
      } else {
        returnMessage =
          "Please specify a encryption method that is on this list (spelling should be exact).\n\n" +
          encryptionMethods.join("\n");
      }
    } else {
      returnMessage =
        "Please make sure your message is formatted as follows:\n\nONFIG: [encryption name] && [encryption method] && [encryption passphrase] && [yes/no]\n\n(e.g. CONFIG: config-1 && aes && my-secret-key && yes)";
    }
  } catch (e) {
    returnMessage =
      "Please make sure your message is formatted as follows:\n\nONFIG: [encryption name] && [encryption method] && [encryption passphrase] && [yes/no]\n\n(e.g. CONFIG: config-1 && aes && my-secret-key && yes)";
  }

  return returnMessage;
};

// Function to remove user specified data
//
const removeCMD = async (phoneNumber, message) => {
  let returnMessage = "";

  try {
    if (message.includes("-")) {
      const splitMessage = message.substring(2).split(" ");

      let encryptionName = "";
      let number = "";
      let contactName = "";

      for (let i = 0; i < splitMessage.length; i++) {
        const tempStr = splitMessage[i];

        switch (tempStr) {
          case "-e": {
            encryptionName = splitMessage[i + 1];
            break;
          }

          case "-p": {
            number = splitMessage[i + 1];
            break;
          }

          case "-c": {
            contactName = splitMessage[i + 1];
            break;
          }
        }
      }

      if (
        encryptionName.length > 0 ||
        number.length > 0 ||
        contactName.length > 0
      ) {
        await db
          .promise()
          .query(
            `SELECT userID FROM VerifiedNumbers WHERE phoneNumber = '${phoneNumber}'`
          )
          .then(async (response) => {
            if (response[0].length > 0) {
              const userID = response[0][0].userID;
              let flag = false;

              let sqlStr = "";

              if (encryptionName) {
                sqlStr = `DELETE FROM Configurations WHERE configName = '${encryptionName}' AND userID = '${userID}'`;

                await db
                  .promise()
                  .query(sqlStr)
                  .then((response) => {
                    if (response[0].affectedRows > 0) {
                      flag = true;
                      returnMessage = `Removed ${encryptionName}. `;
                    }
                  })
                  .catch((err) => console.log(err));
              }

              if (number) {
                sqlStr = `DELETE FROM VerifiedNumbers WHERE phoneNumber = '${number}' AND userID = '${userID}'`;

                await db
                  .promise()
                  .query(sqlStr)
                  .then((response) => {
                    if (response[0].affectedRows > 0) {
                      flag = true;
                      returnMessage += `Removed ${number}. `;
                    }
                  })
                  .catch((err) => console.log(err));
              }

              if (contactName) {
                sqlStr = `DELETE FROM Contacts WHERE contactName = '${contactName}' AND userID = '${userID}'`;

                await db
                  .promise()
                  .query(sqlStr)
                  .then((response) => {
                    if (response[0].affectedRows > 0) {
                      flag = true;
                      returnMessage += `Removed ${contactName}. `;
                    }
                  })
                  .catch((err) => console.log(err));
              }

              if (flag) {
              } else {
                returnMessage = "Could not find any of the requested fields.";
              }
            } else {
              returnMessage = "Something went wrong, please try again.";
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  } catch (e) {
    returnMessage =
      "Please make sure the rm command is in the form:\n\n rm -e [encryption-name] || -p [phoneNumber] || -c [contact-name]";
  }

  return returnMessage;
};

// Function to change a users default configuration
//
const configDefault = async (phoneNumber, message) => {
  let returnMessage = "";

  try {
    const parameter = message.split(":")[1];
    const configName = parameter.replaceAll(" ", "");

    console.log(configName);

    if (configName) {
      const subQuery = `SELECT userID FROM VerifiedNumbers WHERE phoneNumber = '${phoneNumber}'`;

      console.log(subQuery);

      await db
        .promise()
        .query(
          `UPDATE Configurations SET defaultSetting = 1 WHERE configName = '${configName.toLowerCase()}' AND userID = (${subQuery})`
        )
        .then(async (response) => {
          if (response[0].affectedRows > 0) {
            await db
              .promise()
              .query(
                `UPDATE Configurations SET defaultSetting = 0 WHERE userID = (${subQuery}) AND configName != '${configName.toLowerCase()}'`
              )
              .catch((err) => {
                console.log(err);
              });

            returnMessage = "Default Changed.";
          } else {
            returnMessage = "No config associated with this name.";
          }
        })
        .catch((err) => console.log(err));
    } else {
      returnMessage =
        "Please make sure you're following the format provided in the user guide.";
    }
  } catch (e) {
    returnMessage =
      "Please make sure you're following the format provided in the user guide.";
  }

  return returnMessage;
};

module.exports = {
  listNumbers,
  listConfigs,
  createConfig,
  removeCMD,
  listContacts,
  createContact,
  configDefault,
};
