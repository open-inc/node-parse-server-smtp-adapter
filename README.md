# @openinc/parse-server-smtp-adapter

A mail adapter for Parse Server, which uses [nodemailer](https://github.com/nodemailer/nodemailer) to send mails and [nunjucks](https://github.com/mozilla/nunjucks) for templates.

## Installation

```
npm i @openinc/parse-server-smtp-adapter
```

## Usage

In your Parse Server config:

```js
{
  //...
  "emailAdapter": {
    "module": "@openinc/parse-server-smtp-adapter",
    "options": {
      // adapter config:
      // the email "from" field
      "from": "info@beispiel.de",

      // (default: email) attribute of the Parse.User object, which will hold an email
      "emailAttribute": "email",

      // (default: language) attribute of the Parse.User object, which will hold an a language identifier
      "languageAttribute": "language",

      // Subject when sending password reset emails:
      "subjectPasswordResetEmail": "Parse App: Password Reset",

      // Or as an object, which will point from a language identifier to a string
      // If you use an object, subjectPasswordResetEmail.default will be required
      // as an identifier, which will be used, if no other object property matches the language identifier
      "subjectPasswordResetEmail": {
        "de": "Parse App: Passwort Zurücksetzen",
        "default": "Parse App: Password Reset"
      },

      // Same as subjectPasswordResetEmail but for sending verification emails
      "subjectVerificationEmail": "Parse App: Email Verification"

      // Path to the template directory
      // You need to create the following files
      // - verificationEmail.txt
      // - verificationEmail.html
      // - passwordResetEmail.txt
      // - passwordResetEmail.html
      // The following variables are available in your templates:
      // - link: Link to the password reset/email verification page
      // - user: Parse.User object
      // - language: Language identifier
      "templateDir": "./views/emails",

      // nodemailer config (https://nodemailer.com/smtp/):
      // All options, that do not match the above options,
      // will be passed to nodemailer.createTransport(options)
      "host": "xxx",
      "port": 465,
      "secure": true,
      "auth": {
        "user": "xxx",
        "pass": "xxx"
      },
    }
  }
}

```
