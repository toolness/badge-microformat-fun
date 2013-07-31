This is a simple proof of concept that converts a proposed badge
[microformat][] into a [0.5][] JSON hosted badge assertion.

## Why a Badge Microformat?

* [Humans first (machines second)](http://microformats.org/#why). Standard
  JSON badge assertions are the other way around.
* For non-technical users, it's not hard to host arbitrary HTML via services
  like blogs, but it is non-trivial to host JSON.
* Only one HTML page is required, rather than an HTML page that
  uses the [issuer API][] to point to a different JSON URL.
* The unity between metadata and presentation also helps ensure that the two
  don't fall out-of-sync.

## Proposed Badge Microformat

All fields are required.

* `p-name` - name, formatted/full
* `u-image` - badge image (square)
* `p-description` - badge description, approximately one sentence
* `p-recipient` - badge recipient, [h-card][]. The recipient `url` should be
   either a `mailto:` or `hmailto:` link.
* `dt-issuance` - date of badge issuance
* `u-issuer` - origin of issuer
* `p-issuer-name` - name of issuer

Note that I'm very new to microformats, so this specification is surely
horrible in certain ways. Feedback is welcome.

### The `hmailto:` scheme

There doesn't seem to be an existing way to represent a hashed email in
HTML, and since the content of a hashed email address isn't
very human-readable, I decided represent it via a bespoke URL scheme with the
following format:

<code>hmailto:**hash**?hashfunc=**hashfunc**&salt=**salt**</code>

where

* <code>**hash**</code> is the hex-encoded salted hash of the user's email,
* <code>**hashfunc**</code> is the name of the hash function used
  (e.g., `sha256`), and
* <code>**salt**</code> is the name of the salt appended to the user's email
  before hashing.

As an example, the hashed email for foo@bar.com can be represented like so
(ignoring extraneous whitespace):

```
hmailto:59f82c7054c3695e8d49f76f27c1ae1e14b3988433c4f255016ad24c4f0f9fa7
?hashfunc=sha256&amp;salt=deadsea
```

### Example

```html
<div id="silly-badge-for-foo-bar" class="h-badge">
  <h3 class="p-name">Silly Badge</h3>
  <img src="http://sillybadges.com/silly.png" class="u-image">
  <p class="p-description">A silly badge for silly people.</p>
  <p>
    This badge is awarded to
    <a href="mailto:foo@bar.com" class="p-recipient h-card">Foo Bar</a>
    on
    <time datetime="2013-07-31" class="dt-issuance">July 31st 2013</time>
    by
    <a href="http://sillybadges.com" class="u-issuer p-issuer-name">Silly 
      Badge Corp</a>,
    in recognition of their awesomeness.
  </p>
</div>
```

  [recipient]: http://microformats.org/wiki/hcard
  [microformat]: http://microformats.org/
  [0.5]: https://github.com/mozilla/openbadges/wiki/Assertion-Specification-Changes
  [issuer API]: https://github.com/mozilla/openbadges/wiki/Issuer-API
  [h-card]: http://microformats.org/wiki/h-card
