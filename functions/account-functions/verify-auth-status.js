const { db } = require("../../utils/database");

// Function to get whether or not the user is signed in to the application
//
const getAuthStatus = async (phoneNumber) => {
  let authStatus = false;
  let hasAccount = false;

  // Use a join on the Users and VerifiedNumbers tables to select the loggedIn status
  // or permAuth of the number for the user
  //
  const sqlStr = `SELECT Users.loggedIn, VerifiedNumbers.permAuth FROM Users, VerifiedNumbers 
                  WHERE VerifiedNumbers.phoneNumber = '${phoneNumber}' 
                  AND VerifiedNumbers.userID = Users.id`;

  await db
    .promise()
    .query(sqlStr)
    .then((response) => {
      if (response[0].length > 0) {
        if (response[0][0].loggedIn || response[0][0].permAuth) {
          authStatus = true;
          hasAccount = true;
        } else {
          hasAccount = true;
        }
      }
    })
    .catch(() => {
      returnMessage = "Something went wrong, please try again.";
    });

  return { authStatus, hasAccount };
};

module.exports = { getAuthStatus };
