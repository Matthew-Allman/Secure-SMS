const { db } = require("../../utils/database");

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

module.exports = { listNumbers, listConfigs };
