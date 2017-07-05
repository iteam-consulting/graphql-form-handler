# GraphQL Forms Handler
This package provides a generalized graphql mutation meant to handle key-value
pair data submitted through an HTML form. The data is sent to an email target
using Mailgun.

# Installation
```
$ npm install graphql-form-handler --save
```

# Usage
The GraphQL mutation behavior is baked into the package, however, the email
template and Mailgun credentials (Mailgun *must* be configured) can be
configured.

This usage example shows how the package can be used with ExpressJS.
```javascript
const {GraphQLSchema, GraphQLObjectType} = require('graphql');
const {createGraphQLFormHandlerMutation} = require('graphql-form-handler');
const express = require('express');
const expressGraphQL = require('express-graphql');

const mutationConfig = {
  mailgun: {
    apiKey: 'key-XXXXXXXX',
    domain: 'funstuff@happyland.com',
    from: 'no-reply@happyland.com',
    to: 'hr@someplace.com',
    subject: 'Contact Request from Customer',
  },
  template: `
    <html>
      <body>
        <p>Here's a form submission!</p>
        {{formData}}
      </body>
    </html>`;
};

const schema = new GraphQLSchema({
  query: ...,
  mutation: new GraphQLObjectType({
    name: 'mutation',
    fields: () => ({
      formHandler: createGraphQLFormHandlerMutation(mutationConfig),
    }),
  }),
});

const app = express();
...

app.use('/graphql', expressGraphQL((request) => ({
  schema,
  rootValue: {request},
})));
```