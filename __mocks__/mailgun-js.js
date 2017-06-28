
const mockClient = {
  send: (data, callback) => {
    callback(null, data);
  },
};

mockClient.messages = () => mockClient;

module.exports = function() {
  return mockClient;
};
