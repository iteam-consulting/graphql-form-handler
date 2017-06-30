
const mockClient = {
  send: (data, callback) => {
    callback(null, data);
  },
};

mockClient.messages = () => mockClient;
mockClient.Attachment = (fileData) => ({data: fileData.buffer});

module.exports = function() {
  return mockClient;
};
