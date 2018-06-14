const config = require('../config');
const {markdown} = require('nodemailer-markdown');
const nodemailer = require('nodemailer');
const getValue = require('./get-value');

const {enabled, from, smtpUrl} = config.mail;

let transport;
const getTransport = async () => {
  if (transport) return transport;

  transport = nodemailer.createTransport(
    await getValue({value: smtpUrl}),
    {from}
  );
  transport.use('compile', markdown());
  return transport;
};

module.exports = async options => {
  if (enabled) return await (await getTransport()).sendMail(options);

  const {to, subject, markdown} = options;
  console.log([
    '<mail>',
    `TO ${JSON.stringify(to)}`,
    `FROM ${JSON.stringify(from)}`,
    subject,
    markdown,
    '</mail>'
  ].join('\n'));
};
