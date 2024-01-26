const { db } = require("../../utils/database");

// Function to sign a user out of the application
//
const signOut = async (phoneNumber) => {
  let returnMessage = "";

  await db
    .promise()
    .query(
      `UPDATE Users, VerifiedNumbers SET loggedIn = 0 WHERE VerifiedNumbers.phoneNumber = '${phoneNumber}' AND VerifiedNumbers.userID = Users.id`
    )
    .then((response) => {
      if (response[0].affectedRows > 0) {
        returnMessage = "Logged out. Goodbye.";
      } else {
        returnMessage = "Something went wrong, please try again.";
      }
    })
    .catch((err) => console.log(err));

  return returnMessage;
};

module.exports = { signOut };
