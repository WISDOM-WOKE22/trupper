const nodeMailer = require('nodemailer');
const pug = require('pug');
const { consoleError, consoleMessage } = require('../../utils/console');

module.exports = class BulkMail {
  constructor(users, subject, content, res) {
    this.users = users;
    this.subject = subject;
    this.from = `admin from admin@amidarh.com`;
    this.content = content;
    this.res = res;
  }

  newTransport() {
    return nodeMailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject, content, user) {
    const html = pug.renderFile(
      `${__dirname}/../../template/email/newsletter.pug`,
      {
        firstName: user.firstName,
        subject,
        content: content,
      }
    );

    const mailOptions = {
      from: this.from,
      to: user.email,
      subject: this.subject,
      html: `<html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>#{subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600px" style="margin: auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px; margin-top: 20px;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <h2 style="color: #05051B; font-size: 1.7rem;">Amidarh</h2>
            </td>
          </tr>
          <tr>
            <td>
              <h5 style="color: #333; font-size: 1.2rem; margin-left: 20px">Hello ${user.firstName},</h5>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px;">
              <h3 style="color: #333; font-size: 20px; margin: 0;">${subject}</h3>
              <p style="color: #555; font-size: 15px;">${content}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #f8f8f8;">
              <p style="color: #777; font-size: 14px;">Best regards, <br>Sent with ❤️ from Amidarh</p>
            </td>
          </tr>
        </table>
      </body>
    </html>`,
      text: `Hello ${user.firstName}`,
    };

    await this.newTransport().sendMail(mailOptions, (err) => {
      if (err) {
        consoleError(err);
      } else {
        consoleMessage(`Email sent to ${user.email}`);
        // consoleMessage(info);
      }
    });
  }

  async sendBulk() {
    for (const user of this.users) {
      await this.send(this.subject, this.content, user);
    }
  }
};
