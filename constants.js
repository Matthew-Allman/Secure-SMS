const signUpPrompt = `Please sign up for an account.\nFormat your next message exactly as the following:\n\n
USERNAME: [your_username] && PASSWORD: [your_password]\n\n(e.g. USERNAME: maxwell1 && PASSWORD: matt1).`;

const signInPrompt = `Please sign in. To sign in, format your next message exactly as the following:\n\n
SIGN IN: [your_username] && [your_password].\n\n (e.g. SIGN IN: matthew1 && matt123)`;

const registered = `Welcome to SecureSMS!\n\n1. Sign-Up Confirmation:\n - Sign-up success! Welcome!\n\n2. Overview:\n - Send encrypted messages to contacts.\n\n3. Create Encryption Configurations:\n - Type: CREATE ENCRYPTION CONFIG\n - Will be prompted to specify:\n\t- Name (e.g., config-1).\n\t- Encryption type (e.g., AES, SHA256).\n\t- Encryption passphrase.\n\n4. Send Encrypted Message:\n - Type: NAME: [encryption name] && MESSAGE: [your message] && TO: [number1, ...].\n - 'TO' can be a list or a single number.\n\tOmit 'TO' to simply get a message back with the encrypted message.\n\n5. Create a Contact:\n - Type: CREATE CONTACT\n - Follow prompts for name and number.\n\tContact creation allows you to send messages using the contact's name (e.g., NAME: config-1 && MESSAGE: hello world && TO: matthew, maxwell).\n\n6. To delete your account at any time, you must first sign in then type only 'DELETE MY ACCOUNT'.\n\n7. To sign out at any time, type only 'SIGN OUT' (must be signed in to perform this action).\n\n 8. Public & Private Keys:\n - Auto-sign in:\n\t- Public Key: Signs in from any number.\n\t- Private Key: Signs in and remembers your current number. \n - To use your keys at any time, type: PRIVATE KEY: [your private key] or PUBLIC KEY: [your public key]\n - Keep keys private; don't share. \n\n9. HELPFUL COMMANDS: \n\tType: ls --numbers\n -Will send a list of all phone numbers associated with your account. \n\tType: ls --configs\n -Will send a list of all the names of the encryption configurations associated with your account. \n\tType rm [encryption-name] || [phoneNumber]\n-Will delete the encryption config or phone number if it is associated with your account.\n\tType --help\n-Will print this user guide for you again.`;

module.exports = { signUpPrompt, registered, signInPrompt };