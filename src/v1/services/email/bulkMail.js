const nodeMailer = require('nodemailer');
const pug = require('pug');
const { consoleError, consoleMessage } = require('../../utils/console');

module.exports = class BulkMail {
  constructor(users, subject, content, organization, sentBy,res) {
    this.users = users;
    this.subject = subject;
    this.from = `${organization.name} <${process.env.EMAIL}>`;
    this.content = content;
    this.res = res;
    this.organization = organization;
    this.sentBy = sentBy
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
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        ${content}
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
