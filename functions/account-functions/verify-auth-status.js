const { db } = require("../../utils/database");

const getAuthStatus = async (phoneNumber) => {
  let authStatus = false;
  let hasAccount = false;

  const sqlStr = `SELECT loggedIn, permAuth FROM Users, VerifiedNumbers 
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
    .catch((err) => {
      console.log(err);
    });

  return { authStatus, hasAccount };
};

module.exports = { getAuthStatus };
