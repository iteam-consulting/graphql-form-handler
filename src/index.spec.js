
test('we can import', () => {
  const {createGraphQLFormHandlerMutation} = require('./index');
  expect(createGraphQLFormHandlerMutation).not.toBeNull();
});
