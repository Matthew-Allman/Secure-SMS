const encryptionMethods = [
  "aes",
  "tripledes",
  "rc4",
  "rabbit",
  "rabbit-legacy",
];

const signUpPrompt = `Please sign up for an account.\nFormat your next message exactly as the following:\n\n
USERNAME: [your_username] && PASSWORD: [your_password]\n\n(e.g. USERNAME: maxwell1 && PASSWORD: matt1).`;

const signInPrompt = `Please sign in. To sign in, format your next message exactly as the following:\n\n
SIGN IN: [your_username] && [your_password].\n\n (e.g. SIGN IN: matthew1 && matt123)`;

const registered = `Sign-Up Confirmation:\n - Sign-up success! Welcome!\n\n`;

const userGuide = `1. Welcome to SecureSMS!\n\n\n\n\n2. Overview:\n - Send encrypted messages to contacts.\n\n3. Create Encryption Configurations:\n - Type: CREATE CONFIG\n - Will be prompted to specify:\n\t- Name (e.g., config-1).\n\t- Encryption type (e.g., AES, SHA256).\n\t- Encryption passphrase. \n\t- Default Config\n\n4. Send Encrypted Message:\n - Type: -e NAME: [config-name] && MESSAGE: [your message] && SENDTO: [number1, ...].\n - 'SENDTO' can be a list or a single number.\n\tOmit 'SENDTO' to simply get a message back with the encrypted message.\n\tOmit 'NAME' to use your accounts default config (must have specified a default config)\n\n5. Decrypt Message:\n - Type: -d MESSAGE: [your message] && { NAME: [encryption-name] || TYPE: [encryption-type] && KEY: [encryption-key] }\n\n(e.g.1: -d MESSAGE: hello world && NAME: config-1\ne.g.2: -d MESSAGE: hello world && TYPE: aes && KEY: my-secret-key)\n\nOmit 'NAME', 'TYPE', 'KEY' to use your accounts default config.\n\n6. Create a Contact:\n - Type: CREATE CONTACT\n - Follow prompts for name and number.\n\tContact creation allows you to send messages using the contact's name (e.g., -e NAME: config-1 && MESSAGE: hello world && SENDTO: 'matthew', 'maxwell')\n\nNOTE: Please use '' around any contact names that you include in your 'SENDTO' parameter.\n\n7. To delete your account at any time, you must first sign in then type only 'DELETE MY ACCOUNT'.\n\n8. To sign out at any time, type only 'SIGN OUT' (must be signed in to perform this action).\n\n 9. Public & Private Keys:\n - Auto-sign in:\n\t- Public Key: Signs in from any number.\n\t- Private Key: Signs in and remembers your current number. \n - To use your keys at any time, type: PRIVATE KEY: [your private key] or PUBLIC KEY: [your public key]\n - Keep keys private; don't share. \n\n10. HELPFUL COMMANDS: \n\tType: ls --numbers\n - Will send a list of all phone numbers associated with your account. \n\tType: ls --configs\n- Will send a list of all the names of the encryption configurations associated with your account.\n\tType: ls --contacts\n- Will send a list of all contacts associated with your account.\n\tType rm -e [encryption-name] || -p [phoneNumber] || -c [contact name]\n- Will delete the encryption config, phone number, or contact if it is associated with your account.\n\n(e.g. rm -e config-1 -p +15558906543)\n\nNOTE: Any parameter can be omitted.\n\tType DEFAULT: [encryption-name]\n\n(e.g. DEFAULT: config-1)\n- Will change the default encryption config to the config specfied\n\n\tType --help\n-Will print this user guide for you again.`;

const configCreation = `Here is a list of all the encryption methods that this application supports:\n\n-${encryptionMethods.join(
  "\n-"
)}\n\nPlease format your next message as follows:\n\CONFIG: [encryption-name] && [encryption method] && [encryption passphrase] && [yes/no]\n\n(e.g. CONFIG: config-1 && aes && my-secret-key && yes)\n\nNOTE: The [yes/no] parameter determines whether this config will be your accounts default (Omit the [yes/no] parameter for 'no').`;

const contactCreation = `Please format your next message as follows:\n\nCONTACT: [contact-name] && [contact phone number]\n\n(e.g. CONTACT: matthew && +15557895461)\n\nNOTE: Please incluse area codes.`;

module.exports = {
  signUpPrompt,
  registered,
  signInPrompt,
  userGuide,
  encryptionMethods,
  configCreation,
  contactCreation,
};
