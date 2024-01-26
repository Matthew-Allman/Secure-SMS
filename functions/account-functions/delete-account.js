const { db } = require("../../utils/database");

// Function to delete a users account
//
const deleteAccount = async (phoneNumber) => {
  let returnMessage = "";

  const subQuery = `SELECT userID FROM VerifiedNumbers WHERE phoneNumber = '${phoneNumber}'`;

  await db
    .promise()
    .query(`DELETE FROM Users WHERE id = (${subQuery})`)
    .then((response) => {
      if (response[0].affectedRows > 0) {
        returnMessage = "Account Deleted. Goodbye.";
      } else {
        returnMessage = "Something went wrong, please try again.";
      }
    })
    .catch(() => {
      returnMessage = "Error while deleting you account, please try again.";
    });

  return returnMessage;
};

module.exports = { deleteAccount };
