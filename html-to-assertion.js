var url = require('url');
var microformat = require('microformat-node');

function splitHash(fullURL) {
  var parts = url.parse(fullURL);
  var hash = parts.hash || '';

  parts.hash = '';
  return {
    baseURL: url.format(parts),
    hash: hash,
    id: hash.slice(1)
  };
}

function htmlToAssertion(dom, rootNode, baseURL) {
  var parser = new microformat.Parser();
  var out = parser.get(dom, rootNode, parser.options);
  var badge = out.data.items[0].properties;
  var issuer = url.parse(badge.issuer[0]);
  var base = url.parse(baseURL);
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

  if (assertion.badge.issuer.origin != base.protocol + '//' + base.host)
    errors.push({
      code: 'ISSUER_ORIGIN_MISMATCH',
      message: 'Origin of issuer does not match origin of hosted HTML'
    });

  var identity = url.parse(badge.recipient[0].properties.url[0], true);

  if (identity.protocol == 'mailto:') {
    assertion.recipient = identity.auth + '@' + identity.hostname;
  } else if (identity.protocol == 'hmailto:') {
    assertion.recipient = identity.query.hashfunc + '$' + identity.hostname;
    // For some reason url.parse() limits the hostname to 63 characters and
    // puts the rest in the pathname.
    assertion.recipient += identity.pathname.slice(1);
    assertion.salt = identity.query.salt;
  } else {
    errors.push({
      code: 'UNKNOWN_RECIPIENT_PROTOCOL',
      message: 'Unkown recipient protocol'
    });
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

htmlToAssertion.findUnique = function findUnique(dom, fullURL) {
  var info = splitHash(fullURL);
  var rootNode = dom.root().find(info.hash + ".h-badge");

  if (rootNode.length == 0) {
    return {
      errors: [{
        code: 'NOT_FOUND',
        message: 'no results found'
      }]
    }
  } else if (rootNode.length > 1) {
    return {
      errors: [{
        code: 'AMBIGUOUS_MATCH',
        message: 'multiple results found'
      }]
    }    
  }
  return htmlToAssertion(dom, rootNode, fullURL);
};

htmlToAssertion.findAll = function findAll(dom, baseURL) {
  return dom.root().find(".h-badge").map(function() {
    var id = this.attr("id");
    return htmlToAssertion(dom, this, baseURL + (id ? '#' + id : ''));
  });
};

module.exports = htmlToAssertion;
