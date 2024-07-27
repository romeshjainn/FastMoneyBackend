import nodemailer from "nodemailer";

export function sendEmail(to, subject, text, html) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "romeshjainn@gmail.com",
      pass: "vumk hvnl dnhc syfb",
    },
  });

  var mailOptions = {
    from: "romeshjainn@gmail.com",
    to: to,
    subject: subject,
    text: text,
    html: html ? html : null,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
