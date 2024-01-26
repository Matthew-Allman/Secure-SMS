const { db } = require("../../utils/database");
const badWords = require("badwords-list").array;
const bcrypt = require("bcrypt");

// passphrase used to encrypt user credential keys - priv/pub keys
//
const encryptionPassphrase = process.env.ENCRYPTION_PASSPHRASE;

const {
  keygen,
  UUIDKeygen,
} = require("../../functions/account-functions/tools");

// Used to hash the users password for the database entry
//
const saltRounds = parseInt(process.env.SALTROUNDS);

// Function to hash the password that will be stored in the database
// for security reasons
//
const hashPassword = async (password) => {
  let hashedPassword = "";

  await bcrypt
    .hash(password, saltRounds)
    .then((response) => {
      hashedPassword = response;
    })
    .catch(() => {
      hashedPassword = false;
    });

  return hashedPassword;
};

// Function that will verify that the username is a valid username
// and does not exist in the database already
//
const verifyUsername = async (username) => {
  let validUsername = false;
  let message = "";

  const bool = badWords.every((item) => !username.includes(item));

  if (bool) {
    // Test if a user with the user name already exists
    // select only username for security reasons.
    // Since it is a unique index, the check is not necessarily
    // required, but we add since we want to give an appropriate error
    // message to the user.
    //
    await db
      .promise()
      .query(`SELECT username FROM Users WHERE username = '${username}'`)
      .then((response) => {
        // Rows have been returned, so the user should chose another name
        //
        if (response[0].length > 0) {
          message = "Username not available, please choose another.";
        } else {
          validUsername = true;
        }
      })
      .catch(() => {
        message = "Something went wrong, please try again";
      });
  } else {
    message = "Username contains profanity, please choose another.";
  }

  return { validUsername, message };
};

// Function to register a user and add them to rows in the database
//
const signUp = async (phoneNumber, message) => {
  let successfullSignIn = false;
  let privateKey = "";
  let publicKey = "";

  try {
    const splitMessage = message.split("&&");

    if (splitMessage.length == 2) {
      // Parse the message for the username and password
      //
      const usernameStr = splitMessage[0].replaceAll("'", "");
      const passwordStr = splitMessage[1].replaceAll("'", "");

      let username = usernameStr.split(":")[1].replaceAll(" ", "");
      let password = passwordStr.split(":")[1].replaceAll(" ", "");

      username = username.toLowerCase();

      // Validate the username
      //
      const { validUsername, message } = await verifyUsername(username);

      if (validUsername && password) {
        let exitFlag = false;
        let count = 0;

        const hash = await hashPassword(password);

        // Generate users unique credential keys
        //
        let userID = UUIDKeygen();
        privateKey = keygen();
        publicKey = keygen();

        while (!exitFlag && typeof hash == "string") {
          // Encrypt sensitive data before storing into the DB
          //
          await db
            .promise()
            .query(
              `INSERT INTO Users (id, username, password, publicKey, privateKey, loggedIn) 
              VALUES (?, ?, ?, AES_ENCRYPT(?, '${encryptionPassphrase}'), AES_ENCRYPT(?, '${encryptionPassphrase}'), ?)`,
              [userID, username, hash, publicKey, privateKey, true]
            )
            .then(async (result) => {
              if (result[0].affectedRows > 0) {
                successfullSignIn = true;
                exitFlag = true;

                await db
                  .promise()
                  .query(
                    `INSERT INTO VerifiedNumbers (userID, phoneNumber) VALUES (?, ?)`,
                    [userID, phoneNumber]
                  )
                  .catch(() => {});
              }
            })
            .catch((err) => {
              // Test if the user ID, private key, and public key are unique
              //
              if (err.code == "ER_DUP_ENTRY") {
                // Test if count = 5, if it does then exit the loop
                //
                if (count == 5) {
                  exitFlag = true;
                } else {
                  // Get a new unique key
                  //
                  userID = UUIDKeygen();
                  privateKey = keygen();
                  publicKey = keygen();
                  count++;
                }
              } else {
                exitFlag = true;
              }
            });
        }
      } else if (message) {
        return { successfullSignIn, message };
      }
    }
  } catch (e) {}

  return { successfullSignIn, privateKey, publicKey };
};

// Function to sign user in using their username/password conbination
//
const pswSignIn = async (phoneNumber, message, hasAccount) => {
  let verifiedUser = false;
  let returnMessage = "";

  try {
    const splitMessage = message.split(":")[1].split("&&");

    if (splitMessage.length == 2) {
      // Parse the message for the username and password
      // in the event that the user enters wrong formatted data
      // then the catch will handle the error and the application will continue
      // to run.
      //
      const usernameStr = splitMessage[0].replaceAll("'", "");
      const passwordStr = splitMessage[1].replaceAll("'", "");

      let username = usernameStr.replaceAll(" ", "");
      let password = passwordStr.replaceAll(" ", "");

      username = username.toLowerCase();

      await db
        .promise()
        .query(`SELECT password FROM Users WHERE username = '${username}'`)
        .then(async (response) => {
          // Test if the username exists in the database
          //
          if (response[0].length > 0) {
            const realPassword = response[0][0].password;

            verifiedUser = await bcrypt.compare(password, realPassword);

            // Test if the passwords matches the one stored in the database
            //
            if (verifiedUser) {
              // Create a row for the new number to associate it with the account
              //
              if (!hasAccount) {
                const subQuery = `SELECT id FROM Users WHERE username = '${username}'`;

                await db
                  .promise()
                  .query(
                    `INSERT INTO VerifiedNumbers SET userID = (${subQuery}), phoneNumber = '${phoneNumber}'`
                  )
                  .catch(() => {
                    returnMessage =
                      "Something went wrong while storing the phone number.";
                  });
              }

              // Ensure that the data in the database properly reflects the current state.
              // This updata statement uses a join on the Users and VerifiedNumbers tables
              // through their foreign keys and unique indexes
              //
              await db
                .promise()
                .query(
                  `UPDATE Users, VerifiedNumbers SET VerifiedNumbers.userID = Users.id, Users.loggedIn = 1 WHERE Users.username = '${username}' AND VerifiedNumbers.phoneNumber = '${phoneNumber}'`
                )
                .then((result) => {
                  if (result[0].affectedRows > 0) {
                    returnMessage = "Logged In. Welcome " + username;
                  } else {
                    returnMessage =
                      "Something went wrong, please try again later.";
                  }
                })
                .catch(() => {
                  returnMessage = "Something went wrong, please try again.";
                });
            } else {
              returnMessage = "Incorrect username/password combination";
            }
          } else {
            returnMessage = "Incorrect username/password combination";
          }
        })
        .catch(() => {
          returnMessage = "Something went wrong, please try again.";
        });
    }
  } catch (e) {
    returnMessage = "Message not formatted properly.";
  }

  return returnMessage;
};

// Function to sign user in using their priv/pub key
//
const keySignIn = async (phoneNumber, message) => {
  let returnMessage = "";

  try {
    // Flag to choose between either a public or private key.
    // Public key => false, private key => true
    //
    let flag = message.includes("PRIVATE KEY:") ? true : false;

    const key = message.split(":")[1].replaceAll(" ", "");

    await db
      .promise()
      .query(
        `SELECT phoneNumber FROM VerifiedNumbers WHERE phoneNumber = '${phoneNumber}'`
      )
      .then(async (response) => {
        // Test if the user is using a phone number that is in the database
        //
        if (response[0].length > 0) {
          // Change the user id to the id that is associated with the key if necessary.
          // Use the flag to denote whether it is a private key or public key.
          //
          const sqlStr = `UPDATE Users, VerifiedNumbers SET Users.loggedIn = 1 ${
            flag ? ", VerifiedNumbers.permAuth = 1" : ""
          }, VerifiedNumbers.userID = Users.id WHERE AES_DECRYPT(Users.${
            flag ? "privateKey" : "publicKey"
          }, '${encryptionPassphrase}') = '${key}' AND VerifiedNumbers.phoneNumber = '${phoneNumber}'`;

          await db
            .promise()
            .query(sqlStr)
            .then((result) => {
              if (result[0].affectedRows > 0) {
                // User has been signed in
                //
                returnMessage = `Logged in using ${
                  flag ? "private" : "public"
                } key.`;
              } else {
                returnMessage =
                  "Could not find a user with the associated key.";
              }
            })
            .catch(() => {
              returnMessage = "Something went wrong, please try again.";
            });
        } else {
          const subQuery = `SELECT id FROM Users WHERE 
          AES_DECRYPT(${
            flag ? "privateKey" : "publicKey"
          }, '${encryptionPassphrase}') = '${key}'`;

          await db
            .promise()
            .query(
              `INSERT INTO VerifiedNumbers SET userID = (${subQuery}), phoneNumber = '${phoneNumber}';`
            )
            .then(async (result) => {
              if (result[0].affectedRows > 0) {
                if (flag) {
                  await db
                    .promise()
                    .query(
                      `UPDATE Users, VerifiedNumbers SET VerifiedNumbers.permAuth = 1, Users.loggedIn = 1 WHERE phoneNumber = '${phoneNumber}' AND VerifiedNumbers.userID = Users.id`
                    )
                    .catch(() => {
                      returnMessage = "Something went wrong, please try again.";
                    });
                } else {
                  await db
                    .promise()
                    .query(
                      `UPDATE Users, VerifiedNumbers SET loggedIn = 1 WHERE VerifiedNumbers.phoneNumber = '${phoneNumber}' AND VerifiedNumbers.userID = Users.id;`
                    );
                }

                // User has been signed in
                //
                returnMessage = `Logged in using ${
                  flag ? "private" : "public"
                } key.`;
              } else {
                // This will throw an error if the key is not in the database
                //
                returnMessage =
                  "Could not find a user with the associated key.";
              }
            })
            .catch(() => {
              // This will throw an error if the key is not in the database
              //
              returnMessage = "Could not find a user with the associated key.";
            });
        }
      })
      .catch(() => {
        returnMessage = "Something went wrong, please try again.";
      });
  } catch (e) {
    returnMessage =
      "Please follow the format for siginin in with priavte/public keys:\n\n PRIVATE KEY: [your private key] or PUBLIC KEY: [your public key]";
  }

  return returnMessage;
};

module.exports = { pswSignIn, signUp, keySignIn };
