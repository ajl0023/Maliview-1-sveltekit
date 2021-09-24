var nodemailer = require("nodemailer");

exports.handler = function (event, context, callback) {
  const body = JSON.parse(event.body);
  const payload = body.payload.human_fields;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // hostname
    // TLS requires secureConnection to be false
    port: 465, // port for secure SMTP
    secure: true,

    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
  var mailOptions = {
    from: process.env.EMAIL,
    to: payload.Email,
    subject: "Maliview application: Thank you",
    html: `<h1>Hi, ${payload.Name}</h1><p>Info about maliview</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      callback(null, { statusCode: 200 });
    }
  });
  transporter.sendMail(
    {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "Maliview application",
      html: /* HTML */ `<p>Name: ${payload.Name}</p>
        <p>Email: ${payload.Email}</p>
        <p>Phone: ${payload.Phone}</p>
        <p>Message: ${payload.Message}</p>`,
    },
    function (error, info) {
      if (error) {
        console.log(error);
      }
    }
  );
};
