# SecureSMS - Encrypted Messaging Platform

SecureSMS is an open-source encrypted messaging platform that allows users to send secure messages using SMS. It utilizes CryptoJS for encryption and decryption and MySQL for database management.

## Requirements

Before running SecureSMS, it is essential to have MySQL installed. For detailed installation instructions, please refer to the [MySQL Installation Guide](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/).

## Getting Started

1. **Twilio Account Setup:** Start by setting up a Twilio account and obtaining a verified Twilio number. Follow the detailed instructions provided by Twilio: [Twilio Setup](https://www.twilio.com/en-us/messaging).

2. **Ngrok Webhooks:** Create an Ngrok tunnel for webhooks to enhance communication security. Refer to the [Ngrok Documentation](https://ngrok.com/docs/integrations/twilio/webhooks/) for guidance.

3. **Clone Repository:**
   ```bash
   git clone https://github.com/matthew-allman/Secure-SMS.git
   cd Secure-SMS

## Environment Variables

Create a `.env` file at the topmost folder location and populate it with the following variables:

    ```
    TWILIO_ACCOUNT_SID=<Your Twilio Account SID>
    TWILIO_AUTH_TOKEN=<Your Twilio Auth Token>
    TWILIO_ACCOUNT_PHONE_NUMBER=<Your Twilio Account Phone Number>
    TWILIO_VERIFIED_PHONE_NUMBER=<Your Twilio Verified Phone Number>
    PORT=<Your Preferred Port>
    MYSQL_DATABASE=<Your MySQL Database Name>
    MYSQL_USER=<Your MySQL Username>
    MYSQL_PASSWORD=<Your MySQL Password>
    MYSQL_HOSTNAME=<Your MySQL Hostname>
    SALT_ROUNDS=<Number of Salt Rounds for Encryption>
    ENCRYPTION_PASSPHRASE=<Your Encryption Passphrase>
    ```

## Install Dependencies and Start

    ```bash
    npm i
    npm start
    
## Secure Messaging

Upon successful setup, the Twilio number acts as a secure gateway, enabling any number to send encrypted messages to any other number. Experience a robust and professional messaging platform interface.
