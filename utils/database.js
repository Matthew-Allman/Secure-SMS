const mysql = require("mysql2");

const database = process.env.MYSQL_DATABASE;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOSTNAME;

// Create a mysql connection that will be used throughout the backend
//
exports.db = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database,
  multipleStatements: true,
});

// Create a mysql connection that will be used in this file
//
const con = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database,
  multipleStatements: true,
});

// String to create needed tables if they do not exist
//
let sqlStr = `CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(20) NOT NULL,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(100) NOT NULL,
    publicKey VARCHAR(100) NOT NULL,
    privateKey VARCHAR(100) NOT NULL,
    loggedIn BOOLEAN,
    PRIMARY KEY (id),
    UNIQUE INDEX username_UNIQUE (username ASC),
    UNIQUE INDEX privateKey_UNIQUE (privateKey ASC),
    UNIQUE INDEX publicKey_UNIQUE (publicKey ASC));`;

sqlStr += `CREATE TABLE IF NOT EXISTS Configurations (
        configID INT NOT NULL AUTO_INCREMENT,
        userID VARCHAR(20) NOT NULL,
        configName VARCHAR(20) DEFAULT 'config_1',
        encryptionPassphrase TEXT NOT NULL,
        encryptionMethod VARCHAR(30) DEFAULT 'aes',
        PRIMARY KEY (configID),
        FOREIGN KEY(userID) REFERENCES Users(id) ON DELETE CASCADE);`;

sqlStr += `CREATE TABLE IF NOT EXISTS VerifiedNumbers (
  numberID INT NOT NULL AUTO_INCREMENT,
  userID VARCHAR(20) NOT NULL,
  phoneNumber VARCHAR(15) NOT NULL,
  permAuth BOOLEAN DEFAULT 0,
  PRIMARY KEY (numberID),
  FOREIGN KEY(userID) REFERENCES Users(id) ON DELETE CASCADE);`;

// Create the tables using the sql connection
//
con.connect(async function (err) {
  if (err) console.log(err);
  var sql = sqlStr;
  con.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    } else if (result) {
      console.log("No errors occured with SQL");
    }
  });
});
