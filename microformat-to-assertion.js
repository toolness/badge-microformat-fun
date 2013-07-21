var url = require('url');
var microformat = require('microformat-node');

module.exports = function microformatToAssertion(dom, rootNode, baseURL) {
  var parser = new microformat.Parser();
  var out = parser.get(dom, rootNode, parser.options);
  var badge = out.data.items[0].properties;
  var saltedId = badge['recipient-salted-identity'][0].split(':', 2);
  var issuer = url.parse(badge.issuer[0]);
  var assertion = {
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

  return {
    errors: [],
    assertion: assertion
  };
};
