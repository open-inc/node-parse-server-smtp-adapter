import Parse from "parse";

const nodemailer = require("nodemailer");
const nunjucks = require("nunjucks");
const path = require("path");
const fs = require("fs");

interface AdapterOptions {
  from: string;

  templateDir: string;

  languageAttribute: string;
  emailAttribute: string;

  subjectPasswordResetEmail: TranslatableString;
  subjectVerificationEmail: TranslatableString;
}

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
}

interface SendSpecificMailOptions {
  link: string;
  appName: string;
  user: Parse.User;
}

type TranslatableString =
  | string
  | {
      default: string;
      [key: string]: string;
    };

module.exports = initMailAdapter;

function initMailAdapter({
  from,
  languageAttribute = "language",
  emailAttribute = "email",
  templateDir = "./views/emails",
  subjectPasswordResetEmail,
  subjectVerificationEmail,
  ...options
}: AdapterOptions) {
  templateDir = path.resolve(templateDir);

  validateString("from", from);

  validateTranslatableString(
    "subjectPasswordResetEmail",
    subjectPasswordResetEmail
  );

  validateTranslatableString(
    "subjectVerificationEmail",
    subjectVerificationEmail
  );

  validateTemplate(templateDir, "verificationEmail.txt");
  validateTemplate(templateDir, "verificationEmail.html");
  validateTemplate(templateDir, "passwordResetEmail.txt");
  validateTemplate(templateDir, "passwordResetEmail.html");

  const transporter = nodemailer.createTransport(options);

  nunjucks.configure(templateDir, { autoescape: true });

  transporter.verify().then(
    (ok) => {},
    (error) => {
      console.error(
        `Parse SMTP Adapter: Error when trying to establish the SMTP connection:`
      );
      console.error(error);
    }
  );

  return Object.freeze({
    async sendMail({ to, subject, text }: SendMailOptions) {
      transporter.sendMail({
        from,
        to,
        subject,
        text,
      });
    },

    async sendVerificationEmail({
      link,
      appName,
      user,
    }: SendSpecificMailOptions) {
      const to = user.get(emailAttribute);
      const language = user.get(languageAttribute) || "default";

      const subject = getTranslatableString(subjectVerificationEmail, language);

      const text = nunjucks.render("verificationEmail.txt", {
        link,
        appName,
        user,
        language,
      });

      const html = nunjucks.render("verificationEmail.html", {
        link,
        appName,
        user,
        language,
      });

      transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
    },

    async sendPasswordResetEmail({
      link,
      appName,
      user,
    }: SendSpecificMailOptions) {
      const to = user.get(emailAttribute);
      const language = user.get(languageAttribute) || "default";

      const subject = getTranslatableString(
        subjectPasswordResetEmail,
        language
      );

      const text = nunjucks.render("passwordResetEmail.txt", {
        link,
        appName,
        user,
        language,
      });

      const html = nunjucks.render("passwordResetEmail.html", {
        link,
        appName,
        user,
        language,
      });

      transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
    },
  });
}

function validateString(key: string, input: string) {
  if (!input || !(typeof input === "string")) {
    throw new Error(
      `Parse SMTP Adapter: options.${key} is required and must be a string`
    );
  }
}

function getTranslatableString(input: TranslatableString, lang: string) {
  if (typeof input === "string") {
    return input;
  }

  if (input[lang] && typeof input[lang] === "string") {
    return input[lang];
  }

  return input.default;
}

function validateTranslatableString(key: string, input: TranslatableString) {
  if (typeof input === "string") {
    // valid
  } else if (typeof input === "object") {
    if (!input?.default || !(typeof input?.default === "string")) {
      throw new Error(
        `Parse SMTP Adapter: If options.${key} is an object, it must have a default property, which must be a string`
      );
    } else {
      // valid
    }
  } else {
    throw new Error(
      `Parse SMTP Adapter: options.${key} is required and must be a string`
    );
  }
}

function validateTemplate(templateDir, template) {
  const templatePath = path.join(templateDir, template);

  if (!fs.existsSync(templateDir)) {
    throw new Error(
      `Parse SMTP Adapter: options.templateDir does not exist ('${templateDir}')`
    );
  }

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Parse SMTP Adapter: '${template}' does not exist in '${templateDir}'`
    );
  }
}
