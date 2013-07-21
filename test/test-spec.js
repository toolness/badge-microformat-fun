var assert = require('assert');
var fs =require('fs');
var microformat = require('microformat-node');
var cheerio = require('cheerio');
var expect = require('expect.js');

var microformatToAssertion = require('../microformat-to-assertion');

var sampleDir = __dirname + '/../sample';

var mediaCardHtml = fs.readFileSync(sampleDir + '/media-card.html', 'utf-8');
var mediaCardDom = cheerio.load(mediaCardHtml);

describe("microformat-node", function() {
  it("parses microformats as expected", function() {
    var parser = new microformat.Parser();
    var rootNode = mediaCardDom.root();
    var out = parser.get(mediaCardDom, rootNode, parser.options);
    var badge = out.data.items[0].properties;

    expect(out.errors).to.equal(null);
    expect(out.data.items[0].type).to.eql([ "h-badge" ]);

    expect(badge.image).to.eql([ 'img/code-whisperer.png' ]);
    expect(badge.name).to.eql([ 'Code Whisperer' ]);
    expect(badge.issuance).to.eql([ '2012-01-01' ]);
    expect(badge.issuer).to.eql([ 'http://webmaker.org/' ]);
    expect(badge.description).to.eql([ 'Recipient can craft code comments.' ]);
    expect(badge.criteria).to.match(/\<p\>The CodeWhisperer/);
    expect(badge.evidence).to.match(/\<p\>Try viewing/);
    expect(badge['issuer-name']).to.eql([ 'Mozilla Webmaker' ]);
    expect(badge['recipient-salted-identity']).to.eql(['sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5:deadsea']);

    expect(badge.recipient).to.eql([
      {
        "value": "Atul Varma",
        "type": [
          "h-card"
        ],
        "properties": {
          "name": [
            "Atul Varma"
          ],
          "url": [
            "http://toolness.com/"
          ]
        }
      }
    ]);
  });
});

describe("microformatToAssertion", function() {
  it("works as expected", function() {
    var assertion = microformatToAssertion(mediaCardHtml,
                                           'http://webmaker.org/badge/1');
    expect(assertion).to.eql({
      recipient: 'sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5',
      salt: 'deadsea',
      evidence: 'http://webmaker.org/badge/1',
      issued_on: '2012-01-01',
      badge: {
        version: '0.5.0',
        name: 'Code Whisperer',
        image: 'http://webmaker.org/badge/img/code-whisperer.png',
        description: 'Recipient can craft code comments.',
        criteria: 'http://webmaker.org/badge/1',
        issuer: {
          origin: 'http://webmaker.org',
          name: 'Mozilla Webmaker'
        }
      }
    });
  });
});
