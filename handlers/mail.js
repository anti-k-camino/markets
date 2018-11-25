'use strict';

const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// transport.sendMail({
//   from: 'Anton Kratyuk <kratyuk.anton84@gmail.com>',
//   to: 'kratyukan@gmail.com',
//   subject: 'Tryout',
//   html: 'Hello to <strong>YOU</strong>',
//   text: 'Hello to **YOU**!'
// });

const generateHTML = (filename, options={}) => { 
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  return juice(html); // inline css
}

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: 'Kratyuk Anton <noreply@markets.com>',
    to: options.user.email,
    subject: options.subject,
    html,
    text
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(options);
};
