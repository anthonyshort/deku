
var babel = require('duo-babel');
var express = require('express');
var fs = require('fs');
var path = require('path');
var serve = require('duo-serve');
var app = module.exports = express();

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

var examples = fs.readdirSync(__dirname).filter(function (example) {
  return fs.statSync(path.resolve(__dirname, example)).isDirectory();
});

examples.forEach(function (example) {
  app.use('/' + example, subapp(example));
});

app.listen(3000, function () {
  console.log();
  console.log(' > Deku examples server listening at http://localhost:3000');
  console.log();
});

function subapp(example) {
  return serve(path.resolve(__dirname, example))
    .title(example)
    .use(babel({ jsxPragma: 'element' }))
    .entry('index.js')
    .entry('index.css')
    .server();
}
