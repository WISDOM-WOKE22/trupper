// TODO: email handler

const nodeMailer = require('nodemailer');
const pug = require('pug');
const { consoleError, consoleMessage } = require('../../utils/console');

module.exports = class Email {
  constructor(res, user, url, code) {
    this.res = res;
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `admin from admin@amidarh.com`;
    this.code = code;
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

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../../template/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
        code: this.code,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: 'Hello There',
    };

    // Create a transport an send email
    await this.newTransport().sendMail(mailOptions, (err, info) => {
      if (err) {
        consoleError(err);
      } else {
        consoleMessage('Email sent');
        consoleMessage(info);
      }
    });
  }

  async verifyEmail() {
    await this.send('emailVerification', 'Verify your email address');
  }

  async forgetPassword() {
    await this.send('forgotPassword', 'Reset Your Password for Amidarh');
  }

  async twoFactorLogin() {
    await this.send('2fa', 'Complete Your Login to Amidarh');
  }

  async addAdmin() {
    await this.send(
      'admin',
      "Congratulations, You've been added to Amidarh"
    );
  }

  async welcome() {
    await this.send(
      'welcome',
      "🎉 Welcome to AMIDARH - Unlock Your Learning Potential! 🚀"
    );
  }
};
