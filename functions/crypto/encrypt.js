const CryptoJS = require("crypto-js");

// Function to encrypt a message using the provided key and method
//
const encryptMessage = (message, method, key) => {
  let encryptionMessage = "";

  try {
    const encryptionMethod = method.toLowerCase();

    // Use a switch on the decryption method and test if it matches any of the
    // following
    //
    switch (encryptionMethod) {
      case "aes": {
        encryptionMessage = CryptoJS.AES.encrypt(message, key);
        break;
      }

      case "tripledes": {
        encryptionMessage = CryptoJS.TripleDES.encrypt(message, key);
        break;
      }

      case "rc4": {
        encryptionMessage = CryptoJS.RC4.encrypt(message, key);
        break;
      }

      case "rabbit": {
        encryptionMessage = CryptoJS.Rabbit.encrypt(message, key);
        break;
      }

      case "rabbit-legacy": {
        encryptionMessage = CryptoJS.RabbitLegacy.encrypt(message, key);
        break;
      }
    }

    // Convert the encrypted message to a string
    //
    encryptionMessage = encryptionMessage.toString();
  } catch (e) {}

  return encryptionMessage.toString();
};

module.exports = { encryptMessage };
