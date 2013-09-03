var HanabiApp = require('./lib/HanabiApp.js').HanabiApp;

var server = new HanabiApp(process.env.PORT);

server.listen();

