var url = require('url'); 
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var htmlToAssertion = require('./html-to-assertion');

var app = express();

var PORT = process.env.PORT || 3000;
var ORIGIN = process.env.ORIGIN || 'http://localhost:' + PORT;
var ISSUER_NAME = process.env.ISSUER_NAME || 'Badge Microformat Bridge';

app.get('/assertion', function(req, res, next) {
  var fullURL = req.param('url') || '';
  var info = url.parse(fullURL);

  if (!/^https?:/.test(info.protocol))
    return res.type('text').send('invalid URL', 400);

  request({
    url: fullURL,
    timeout: 5000,
  }, function(err, proxiedRes, body) {
    if (err) return next(err);

    if (proxiedRes.statusCode != 200)
      return res.type('text').send('gateway response is not 200', 502);

    if (!(/^text\/html/.test(proxiedRes.headers['content-type']) &&
          typeof(body) == 'string'))
      return res.type('text').send('gateway response is not html', 502);

    var dom = cheerio.load(body);
    var result = htmlToAssertion.findUnique(dom, fullURL);
    var assertion = result.assertion;

    if (result.errors.length)
      return res.send({errors: result.errors}, 502);

    assertion.badge.issuer.org = assertion.badge.issuer.name + " (via " +
                                 assertion.badge.issuer.origin + ")";
    assertion.badge.issuer.name = ISSUER_NAME;
    assertion.badge.issuer.origin = ORIGIN;

    return res.send(assertion);
  });
});

app.listen(PORT, function() {
  console.log("Listening on port " + PORT + ".");
});
