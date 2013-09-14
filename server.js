var HanabiApp = require('./lib/HanabiApp.js').HanabiApp;

var port = 3000;
if (process.env.PORT) port = process.env.PORT;

console.log('Starting HanabiApp on port: ' + port);
var server = new HanabiApp(process.env.PORT);

server.listen();

