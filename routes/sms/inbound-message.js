const router = require("express").Router();

const {
  getAuthStatus,
} = require("../../functions/account-functions/verify-auth-status");
const {
  signUp,
  pswSignIn,
  keySignIn,
} = require("../../functions/account-functions/authenticate");
const { signUpPrompt, registered, signInPrompt } = require("../../constants");
const { messageResponse } = require("../../functions/sms/send-message");

const MessagingResponse = require("twilio").twiml.MessagingResponse;

router.route("/").post(async (req, res) => {
  const { From, Body } = req.body;

  if (Body.includes("PRIVATE KEY:") || Body.includes("PUBLIC KEY:")) {
    const response = await keySignIn(From, Body);

    const twiml = new MessagingResponse();
    twiml.message(response);

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  } else {
    const { authStatus, hasAccount } = await getAuthStatus(From);

    if ((hasAccount && !authStatus) || Body.includes("SIGN IN:")) {
      if (Body.includes("&&")) {
        // Prompt user to login
        //
        const returnMessage = await pswSignIn(From, Body, hasAccount);

        const twiml = messageResponse(returnMessage);

        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else {
        const twiml = messageResponse(signInPrompt);

        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      }
    } else if (!hasAccount) {
      if (Body.includes("USERNAME:") && Body.includes("PASSWORD:")) {
        const response = await signUp(From, Body);

        // Test if user has been successfully added to the database
        //
        if (response.successfullSignUp) {
          const publicKey = response.publicKey;
          const privateKey = response.privateKey;

          const message =
            registered +
            ` Your public key is: ${publicKey}, your private key is: ${privateKey}`;

          const twiml = messageResponse(message);

          res.writeHead(200, { "Content-Type": "text/xml" });
          res.end(twiml.toString());
        } else {
          const message = response.message
            ? response.message + " Sign up failed."
            : "Sign up failed";

          const twiml = messageResponse(message + "\n\n" + signUpPrompt);

          res.writeHead(200, { "Content-Type": "text/xml" });
          res.end(twiml.toString());
        }
      } else {
        const twiml = messageResponse(signUpPrompt);

        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      }
    } else if (authStatus) {
      // User is authenticated, allow for message queries
      //
      console.log("start messaging");
    }
  }
});

module.exports = router;
