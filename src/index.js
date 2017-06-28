/**
* iTEAM Consulting (https://github.com/iteam-consulting)
*
* Copyright © 2017 iTEAM Consulting, LLC. All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE.txt file in the root directory of this source tree
*/
const handlerbars = require('handlebars');
const mailgun = require('mailgun-js');

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
    success: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
});

/**
 * Function that returns the html to be rendered in the email
 */
function render(form, template) {
  const formElements = [];
  const compiledRowTemplate = handlebars.compile(`
    <tr className="form-element">
      <td className="key">{{key}}</td>
      <td className="value">{{value}}</td>
    </tr>`);
  const compiledTemplate = handlerbars.compile(template);

  form.forEach(({key, value}) => {
    if (key !== 'File') {
      formElements.push(rowTemplate)({key, value: unescape(value)});
    }
  });

  return compiledTemplate({formData: formElements.join(' ')});
}

/**
 * Function for sending the application via email
 * @param {object} request
 * @param {object} GraphQL arguments => form object and file buffer
 */
const createSendFormHandler = (client, addressing) =>
  async (req, {form, file}) => {
    const html = render(form);
    const data = {
      html,
      ...addressing,
    };

    if (file) {
      const attachment = new mailgun.Attachment({
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
            reject({ success: false, error });
          } else {
            resolve({ success: true, body });
          }
        });
    });
}

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
  const emailClient = mailgun(creds);

  return {
    type: ResultType,
    description: 'Send form data via Email',
    args: {
      form: {type: ApplicationInputType},
      file: {type: FileInputType},
    },
    resolve: createSendFormHandler(client, {from, to, subject}),
  };
}
