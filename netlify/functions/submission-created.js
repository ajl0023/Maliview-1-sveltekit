var nodemailer = require("nodemailer");

exports.handler = async function (event, context) {
  console.log(JSON.parse(event.body.payload.human_fields));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
  };
};
