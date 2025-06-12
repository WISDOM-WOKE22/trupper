// TODO: email handler

const nodeMailer = require('nodemailer');
const pug = require('pug');
const { consoleError, consoleMessage } = require('../../utils/console');

module.exports = class Email {
  constructor(res, user, url, code, organization) {
    this.res = res;
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `Trupper <${process.env.EMAIL}>`;
    this.code = code;
    this.organization =  organization
        ? organization.name
      : user.organization
        ? user.organization.name
        : 'Trupper';
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
        organization: this.organization,
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
    await this.send(
      'forgotPassword',
      `Reset Your Password for ${this.organization}`
    );
  }

  // Forgot password for organization user
  async forgetPasswordUser() {
    await this.send(
      'forgotPasswordUser',
      `Reset Your Password for ${this.organization}`
    );
  }

  async twoFactorLogin() {
    await this.send('2fa', 'Complete Your Login to ${organization}');
  }

  // Two factor login for organization user
  async twoFactorLoginUser() {
    await this.send('2faUser', `Complete Your Login ${this.organization}`);
  }

  async adminWelcome() {
    await this.send(
      'adminWelcome',
      `Welcome to Trupper by ${this.organization}`
    );
  }

  async addAdmin() {
    await this.send(
      'adminWelcome',
      `Congratulations, You've been added to ${this.organization}`
    );
  }

  async signupUserByLink() {
    await this.send(
      'continueUserSignup',
      `Welcome to ${this.organization}, Continue account creation`
    );
  }

  async newOrganization() {
    await this.send(
      'organization',
      `Welcome to ${this.organization} by Amidarh`
    );
  }

  async organization() {
    await this.send(
      'newOrganization',
      `Welcome to ${this.organization} by Amidarh`
    );
  }

  async welcome() {
    await this.send(
      'welcome',
      `🎉 Welcome to ${this.organization} - Unlock Your Learning Potential! 🚀`
    );
  }
  async welcomeOrganization() {
    await this.send(
      'newOrganization',
      `Welcome to ${this.organization} by Organization`
    );
  }
};
