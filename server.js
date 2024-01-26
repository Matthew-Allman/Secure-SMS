const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

// Initialize the server application
//
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set allowed headers
//
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const inboundMessage = require("./routes/sms/inbound-message");
app.use("/inbound-messages", inboundMessage);

// Start the server on the specified port
//
app.listen(process.env.PORT, () => {
  console.log("Using port: " + process.env.PORT);
});
