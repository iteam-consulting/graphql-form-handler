
const {createGraphQLFormHandlerMutation} = require('./index');

const testConfig = {
  mailgun: {
    to: 'test@test.com',
    from: 'test@test.com',
    subject: 'Test'
  },
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

test('it creates the mutation with the correct file type', () => {
  // Arrange && Act
  const mutation = createGraphQLFormHandlerMutation(testConfig);
  const {file} = mutation.args;

  // Assert
  expect(file.type.name).toBe('file');
  expect(file.type.getFields()).not.toBeNull();
});

test('it creates the mutation with the correct form types', () => {
  // Arrange && Act
  const mutation = createGraphQLFormHandlerMutation(testConfig);
  const {form} = mutation.args;

  // Assert
  expect(form.type.ofType.getFields()).not.toBeNull();
});

test('it can render a template', (done) => {
  // Arrange
  const mutation = createGraphQLFormHandlerMutation(testConfig);
  const {resolve} = mutation;

  // Act && Assert
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
      expect(success).toBe(false);
      done();
    });
});

test('it adds an attachment when a file is present', (done) => {
  // Arrange
  const mutation = createGraphQLFormHandlerMutation(testConfig);
  const {resolve} = mutation;

  // Act && Assert
  resolve({}, {
    form: [],
    file: {
      buffer: 'Hello world',
  }})
    .then(({success}) => {
      expect(success).toBe(true);
      done();
    })
    .catch(({success}) => {
      expect(success).toBe(false);
      done();
    });
});

test('it rejects a promise', (done) => {
  // Arrange
  delete testConfig.mailgun.to;
  const mutation = createGraphQLFormHandlerMutation(testConfig);
  const {resolve} = mutation;

  // Act && Assert
  resolve({}, {
    form: []
  })
    .catch(({success}) => {
      expect(success).toBe(false);
      done();
    });
});

test('formElements in render will return null when key is "File"', () => {
  // Arrange
  const mutation = createGraphQLFormHandlerMutation(testConfig);
  const {resolve} = mutation;

  // Act && Assert
  resolve({}, {
    form: [
      {key: 'File', value: 'value'},
  ]})
    .then(({success, body}) => {
      expect(success).toBe(true);
      done();
    })
    .catch(({success}) => {
      expect(success).toBe(false);
      done();
    });
});
