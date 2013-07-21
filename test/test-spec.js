var assert = require('assert');
var fs =require('fs');
var microformat = require('microformat-node');
var cheerio = require('cheerio');
var expect = require('expect.js');

var htmlToAssertion = require('../html-to-assertion');

var sampleDir = __dirname + '/../sample';
var mediaCardHtml = fs.readFileSync(sampleDir + '/media-card.html', 'utf-8');

describe("microformat-node", function() {
  it("parses microformats as expected", function() {
    var parser = new microformat.Parser();
    var mediaCardDom = cheerio.load(mediaCardHtml);
    var out = parser.get(mediaCardDom, mediaCardDom.root(), parser.options);
    var badge = out.data.items[0].properties;

    expect(out.errors).to.equal(null);
    expect(out.data.items[0].type).to.eql([ "h-badge" ]);

    expect(badge.image).to.eql([ 'img/code-whisperer.png' ]);
    expect(badge.name).to.eql([ 'Code Whisperer' ]);
    expect(badge.issuance).to.eql([ '2012-01-01' ]);
    expect(badge.issuer).to.eql([ 'http://webmaker.org/' ]);
    expect(badge.description).to.eql([ 'Recipient can craft code comments.' ]);
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

describe("htmlToAssertion", function() {
  it("reports errors when rel=\"nofollow\" links are present", function() {
    var mediaCardDom = cheerio.load(mediaCardHtml);
    mediaCardDom(".u-issuer").attr("rel", "nofollow");
    var result = htmlToAssertion(mediaCardDom, mediaCardDom.root(),
                                 'http://webmaker.org/badge/1');

    expect(result.errors).to.eql([{
      code: "REL_NOFOLLOW_FOUND",
      message: "One or more elements are rel=\"nofollow\""
    }]);
  });

  it("works with mailto: recipient", function() {
    var mediaCardDom = cheerio.load(mediaCardHtml);
    mediaCardDom(".p-recipient").attr("href", "mailto:foo@bar.org");
    mediaCardDom(".p-recipient-salted-identity").remove();
    var result = htmlToAssertion(mediaCardDom, mediaCardDom.root(),
                                 'http://webmaker.org/badge/1');
    expect(result.errors.length).to.equal(0);
    expect(result.assertion.recipient).to.eql("foo@bar.org");
    expect('salt' in result.assertion).to.equal(false);
  });

  it("works as expected", function() {
    var mediaCardDom = cheerio.load(mediaCardHtml);
    var result = htmlToAssertion(mediaCardDom, mediaCardDom.root(),
                                 'http://webmaker.org/badge/1');
    expect(result.errors.length).to.equal(0);
    expect(result.assertion).to.eql({
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
