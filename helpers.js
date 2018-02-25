var fs = require('file-system');

module.exports = {
  getFileContents: getFileContents,
  getProxy: getProxy
};

function getFileContents(filepath) {
  return fs.readFileSync(filepath, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
  });
}

function getProxy(host, port) {
  var options_proxy = {
    proxy: {
      host: host,
      port: port,
      tunnel: false
    }
  };

  return options_proxy;
}

// exmaple using the proxy:
// new Client(options_proxy).put(href, args, function (data, response) {
//   // body
// });
