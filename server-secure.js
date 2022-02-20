const express = require('express');
const compression = require('compression');
const serve = express();
const app = express();
const gzipStatic = require('connect-gzip-static');
const fs = require('fs');
const cors = require('cors');
const config = require('./config');
const path = require('path');
const https = require('https');

const dir = './dist';
const port = config.build.portServer;
const appName = config.build.assetsPublicPath;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

serve.use(appName, app);

app.use(compression());
app.use(gzipStatic(path.join(__dirname, 'dist')));
app.use(express.static('oauth/config'));

// OAUTH
app.get('/oauth', (req, res, next) => {
  res.sendFile(path.join(__dirname, '/oauth/login.html'));
});
app.get('/oauth_logout', (req, res, next) => {
  res.sendFile(path.join(__dirname, '/oauth/logout.html'));
});

// Begin Fake auth
serve.use(cors());
serve.post('/auth', (req, res) => {
  let data = JSON.parse(fs.readFileSync('data-auth.sample.json', 'utf8'));
  res.send(data);
});
// End Fake auth

const options = {
  cert: fs.readFileSync(`${path.join(__dirname)}/ssl/server.crt`),
  key: fs.readFileSync(`${path.join(__dirname)}/ssl/server.key`)
};
https.createServer(options, serve).listen(port, function () {
  console.log(`Frontend app listening on port: ${port}`);
});
