var url = require('url'); 
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var htmlToAssertion = require('./html-to-assertion');

var app = express();

var PORT = process.env.PORT || 3000;
var ORIGIN = process.env.ORIGIN || 'http://localhost:' + PORT;
var ISSUER_NAME = process.env.ISSUER_NAME || 'Badge Microformat Bridge';

app.use(express.static(__dirname + '/static'));

app.get('/assertion', function(req, res, next) {
  var fullURL = req.param('url') || '';
  var info = url.parse(fullURL);
  var makeAssertion = function(body, issuerName, origin) {
    var dom = cheerio.load(body);
    try {
      var result = htmlToAssertion.findUnique(dom, fullURL);
    } catch (e) {
      return res.type("text")
        .send("unexpected exception parsing microformat: " + e);
    }

    var assertion = result.assertion;

    if (result.errors.length)
      return res.send({errors: result.errors}, 502);

    assertion.badge.issuer.org = assertion.badge.issuer.name + " (via " +
                                 assertion.badge.issuer.origin + ")";
    assertion.badge.issuer.name = issuerName;
    assertion.badge.issuer.origin = origin;

    return res.send(assertion);
  };

  if (!/^https?:/.test(info.protocol))
    return res.type('text').send('invalid URL', 400);

  if (req.param('testHtml'))
    return makeAssertion(req.param('testHtml'), 'TESTING MODE', '');

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

    return makeAssertion(body, ISSUER_NAME, ORIGIN);
  });
});

app.listen(PORT, function() {
  console.log("Listening on port " + PORT + ".");
});
