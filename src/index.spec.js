
const {createGraphQLFormHandlerMutation} = require('./index');

const testConfig = {
  mailgun: {},
  template: '<html><body>{{{formData}}}</body></html>',
};

jest.mock('mailgun-js');

test('we can import', () => {
  expect(createGraphQLFormHandlerMutation).not.toBeNull();
});

test('null config throws exception', () => {
  expect(() => createGraphQLFormHandlerMutation()).toThrow();
});

test('null mailgun config throws exception', () => {
  expect(() => createGraphQLFormHandlerMutation({})).toThrow();
});

test('null template config throws exception', () => {
  expect(() => createGraphQLFormHandlerMutation({mailgun: {}})).toThrow();
});

test('non-string template config throws exception', () => {
  expect(() => createGraphQLFormHandlerMutation({
    mailgun: {}, template: 1})).toThrow();
});

test('it creates the mutation', () => {
  // Act && Assert
  expect(createGraphQLFormHandlerMutation(testConfig)).not.toBeNull();
});

test('it creates the mutation with the correct arg types', () => {
  // Arrange && Act
  const mutation = createGraphQLFormHandlerMutation(testConfig);
  const {file} = mutation.args;

  // Assert
  expect(file.type.name).toBe('file');
  expect(file.type.getFields()).not.toBeNull();
});

test('it can render a template', (done) => {
  // Arrange && Act
  const mutation = createGraphQLFormHandlerMutation(testConfig);
  const {resolve} = mutation;

  resolve({}, {
    form: [
      {key: 'first', value: 'value'},
      {key: 'second', value: 'another'},
    ]})
    .then(({success, body}) => {
      expect(success).toBe(true);
      done();
    })
    .catch(({success}) => {
      expect(success).toBe(true);
      done();
    });
});
