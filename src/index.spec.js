
const {createGraphQLFormHandlerMutation} = require('./index');

test('we can import', () => {
  expect(createGraphQLFormHandlerMutation).not.toBeNull();
});

test('null config throws exception', () => {
  expect(() => createGraphQLFormHandlerMutation()).toThrow();
});
