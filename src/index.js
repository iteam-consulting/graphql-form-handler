/**
* iTEAM Consulting (https://github.com/iteam-consulting)
*
* Copyright © 2017 iTEAM Consulting, LLC. All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE.txt file in the root directory of this source tree
*/
const handlebars = require('handlebars');
const makeMailgun = require('mailgun-js');

const {
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString} = require('graphql');

const KeyValueInputType = new GraphQLInputObjectType({
  name: 'application',
  fields: () => ({
    key: {type: new GraphQLNonNull(GraphQLString)},
    value: {type: GraphQLString},
  }),
});

const ApplicationInputType = new GraphQLList(KeyValueInputType);

const FileInputType = new GraphQLInputObjectType({
  name: 'file',
  fields: () => ({
    buffer: {type: GraphQLString},
  }),
});

const ResultType = new GraphQLObjectType({
  name: 'result',
  fields: {
    success: {type: new GraphQLNonNull(GraphQLBoolean)},
  },
});

/**
 * Function that returns the html to be rendered in the email
 * @param {array} form an array of key value pairs
 * @param {string} template The template to compile.
 * @return {string} The rendered template.
 */
function render(form, template) {
  const compiledRowTemplate = handlebars.compile(
    '<tr class="form-element">' +
      '<td class="key">{{key}}</td>' +
      '<td class="value">{{value}}</td>' +
    '</tr>');
  const compiledTable = handlebars.compile(
    '<table><tbody>{{{rows}}}</tbody></table>');
  const compiledTemplate = handlebars.compile(template);

  const formElements = form.map(({key, value}) => {
    if (key !== 'File') {
      return compiledRowTemplate({key, value: unescape(value)});
    }

    return null;
  });

  const formData = compiledTable({rows: formElements.join(' ')});

  return compiledTemplate({formData});
}

/**
 * Function for sending the application via email
 * @param {object} client The mailgun client
 * @param {object} GraphQL arguments => form object and file buffer
 * @return {function} The resolve handler
 */
const createSendFormHandler = (client, {template, ...addressing}) =>
  (req, {form, file}) => {
    const html = render(form, template);
    const data = {
      html,
      ...addressing,
    };

    if (file) {
      const attachment = new client.Attachment({
        data: new Buffer(file.buffer, 'base64'),
        filename: 'upload',
        contentType: 'application/pdf',
      });
      data.attachment = attachment;
    }

    return new Promise((resolve, reject) => {
      client
        .messages()
        .send(data, (error, body) => {
          if (error) {
            reject({success: false, error});
          } else {
            resolve({success: true, body});
          }
        });
    });
};

/**
 * Create the mutation field schema.
 * @param {object} config The config which should include a mailgun config
 * object and a template string.
 * @return {object} The mutation field schema.
 */
export function createGraphQLFormHandlerMutation(config) {
  if (!config) {
    throw new Error('You must provide a config to create the mutation.');
  }

  // Extract the mailgun config
  const {mailgun} = config;
  if (!mailgun) {
    throw new Error('You must provide a mailgun config to create the mutation');
  }

  const {template} = config;
  if (!template || typeof template !== 'string') {
    throw new Error('Invalid or empty template provided in the config.');
  }

  const {from, to, subject, ...creds} = mailgun;
  const emailClient = makeMailgun(creds);

  return {
    type: ResultType,
    description: 'Send form data via Email',
    args: {
      form: {type: ApplicationInputType},
      file: {type: FileInputType},
    },
    resolve: createSendFormHandler(emailClient, {from, to, subject, template}),
  };
}
