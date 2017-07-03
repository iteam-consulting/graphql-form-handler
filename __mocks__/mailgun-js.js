
const mockClient = {
  send: (data, callback) => {
    const {from, to} = data;
    const error = !from || !to;
    callback(error, data);
  },
};

mockClient.messages = () => mockClient;
mockClient.Attachment = (fileData) => ({data: fileData.buffer});

module.exports = function() {
  return mockClient;
};
