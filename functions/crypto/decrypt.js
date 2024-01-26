const CryptoJS = require("crypto-js");

const decryptMessage = (message, method, key) => {
  let decryptionMessage = "";

  try {
    const decryptionMethod = method.toLowerCase();

    switch (decryptionMethod) {
      case "aes": {
        decryptionMessage = CryptoJS.AES.decrypt(message, key);
        break;
      }

      case "tripledes": {
        decryptionMessage = CryptoJS.TripleDES.decrypt(message, key);
        break;
      }

      case "rc4": {
        decryptionMessage = CryptoJS.RC4.decrypt(message, key);
        break;
      }

      case "rabbit": {
        decryptionMessage = CryptoJS.Rabbit.decrypt(message, key);
        break;
      }

      case "rabbit-legacy": {
        decryptionMessage = CryptoJS.RabbitLegacy.decrypt(message, key);
        break;
      }
    }

    decryptionMessage = decryptionMessage.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    decryptionMessage =
      "Please make sure the message was encrypted with the same method that you are trying to decrypt with.";
  }

  return decryptionMessage;
};

module.exports = { decryptMessage };
