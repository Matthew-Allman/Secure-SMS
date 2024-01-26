const CryptoJS = require("crypto-js");

const encryptMessage = (message, method, key) => {
  let encryptionMessage = "";

  try {
    const encryptionMethod = method.toLowerCase();

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
  } catch (e) {}

  return encryptionMessage.toString();
};

module.exports = { encryptMessage };
