import Mailgun from 'mailgun-js';

const apiKey = 'key-f243cf86e84e0ca74bad948bb52cf50b';
const domain = 'sandbox6d8d0b26335f460fbd0c1399fe932507.mailgun.org';

export const mailgun = Mailgun({ apiKey, domain });
export const defaultFrom = 'Mailgun Sandbox <postmaster@sandbox6d8d0b26335f460fbd0c1399fe932507.mailgun.org>';
export const defaultTo = 'Gagan <ghayer@iteamnm.com, ' ,
export const subject = 'Online Form'