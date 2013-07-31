This is a simple proof of concept that converts a proposed badge
[microformat][] into a [0.5][] JSON hosted badge assertion.

## Why a Badge Microformat?

* [Humans first (machines second)](http://microformats.org/#why). Standard
  JSON badge assertions are the other way around.
* For non-technical users, it's not hard to host arbitrary HTML via services
  like blogs, but it is non-trivial to host JSON.
* Only one HTML page is required, rather than a machine-readable JSON blob
  hosted separately from an HTML page that uses the [issuer API][] to point
  to the JSON blob.
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

### Multiple Badges Per Page

Multiple badges can be placed on a single page, but each `h-badge` must
be given its own unique `id`. This `id` can then be specified in the hash
portion of a URL to ensure that each individual badge has a unique URL.

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

### The `hmailto:` scheme

There doesn't seem to be an existing way to represent a hashed email in
HTML, and since the content of a hashed email address isn't
very human-readable, I decided represent it via a bespoke URL scheme with the
following format:

<code>hmailto:<strong>hash</strong>?hashfunc=<strong>hashfunc</strong>&salt=<strong>salt</strong></code>

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
?hashfunc=sha256&salt=deadsea
```

### Security

One potential vulnerability of using a microformat for issuing badges is
that third parties may be able to "spoof" badges on another domain, if
third-party HTML is allowed. For instance, a bad actor could place an
HTML-microformatted badge in a comment on a blog post at foo.wordpress.com
to appear as though foo.wordpress.com issued it.

At the machine level, we can assert that `u-issuer` must be in an `<a>` tag
that has no `rel=nofollow` attribute on it. Since content management systems
always add [nofollow][] to links provided by third parties, this should help
ensure that badge microformats can't be spoofed.

### Limitations

This proof-of-concept "bridge" server provides an endpoint that allows HTML
microformat badges other domains to be delivered as standard JSON badge
assertions. However, as a result, the issuer origin will be whatever the
origin of the bridge server is, rather than the origin of the site that hosts
the badge HTML. This can only be resolved if and when the microformat is
accepted natively by the Open Badges standard (and thus by badge backpacks).

Also, at present HTML badges should only be hosted on pages that are also
permalinks. This means that if they're hosted on blogs, they should appear
"after the jump", in a section of a post that isn't visible on the front
page of a blog. (In the future, there should be a way to optionally specify
the permalink for a badge inside the badge itself. This way, regardless of
where the badge is viewed, a pointer to its canonical location will always
be available.)

  [recipient]: http://microformats.org/wiki/hcard
  [microformat]: http://microformats.org/
  [0.5]: https://github.com/mozilla/openbadges/wiki/Assertion-Specification-Changes
  [issuer API]: https://github.com/mozilla/openbadges/wiki/Issuer-API
  [h-card]: http://microformats.org/wiki/h-card
  [nofollow]: http://en.wikipedia.org/wiki/Nofollow
