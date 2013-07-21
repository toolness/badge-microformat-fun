var url = require('url');
var microformat = require('microformat-node');

function htmlToAssertion(dom, rootNode, baseURL) {
  var parser = new microformat.Parser();
  var out = parser.get(dom, rootNode, parser.options);
  var badge = out.data.items[0].properties;
  var issuer = url.parse(badge.issuer[0]);
  var errors = [];
  var assertion = {
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

  if ('recipient-salted-identity' in badge) {
    var saltedId = badge['recipient-salted-identity'][0].split(':', 2);
    assertion.recipient = saltedId[0];
    assertion.salt = saltedId[1];
  } else {
    var mailto = url.parse(badge.recipient[0].properties.url[0]);
    assertion.recipient = mailto.auth + '@' + mailto.hostname;
  }

  // TODO: Ensure that issuer anchor exists and is absolute.

  if (rootNode.find("[rel=nofollow]").length)
    errors.push({
      code: "REL_NOFOLLOW_FOUND",
      message: "One or more elements are rel=\"nofollow\""
    });

  return {
    errors: errors,
    assertion: assertion
  };
}

htmlToAssertion.findAll = function findAll(dom, baseURL) {
  return dom.root().find(".h-badge").map(function() {
    var id = this.attr("id");
    return htmlToAssertion(dom, this, baseURL + (id ? '#' + id : ''));
  });
};

module.exports = htmlToAssertion;
