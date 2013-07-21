var url = require('url');
var microformat = require('microformat-node');
var cheerio = require('cheerio');

module.exports = function microformatToAssertion(html, baseURL) {
  var parser = new microformat.Parser();
  var dom = cheerio.load(html);
  var out = parser.get(dom, dom.root(), parser.options);
  var badge = out.data.items[0].properties;
  var saltedId = badge['recipient-salted-identity'][0].split(':', 2);
  var issuer = url.parse(badge.issuer[0]);

  return {
    recipient: saltedId[0],
    salt: saltedId[1],
    evidence: baseURL,
    issued_on: badge.issuance[0],
    badge: {
      version: '0.5.0',
      name: badge.name[0],
      image: url.resolve(baseURL, badge.image[0]),
      description: badge.description[0],
      criteria: baseURL,
      issuer: {
        origin: issuer.protocol + '//' + issuer.host,
        name: badge['issuer-name'][0]
      }
    }
  };
};
