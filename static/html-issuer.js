(function() {
  // http://davidwalsh.name/script-tag
  var allScripts = document.getElementsByTagName("script");
  var me = allScripts[allScripts.length - 1];

  function getClosestAncestor(element, className) {
    if (!element) return null;
    if (element.classList.contains(className)) return element;
    return getClosestAncestor(element.parentElement, className);
  }

  function maybeInjectIssuerApi() {
    var ISSUER_JS_API_URL = "//backpack.openbadges.org/issuer.js";

    if (window.OpenBadges) return;

    for (var i = 0; i < allScripts.length; i++) {
      if (allScripts[i].getAttribute("src") == ISSUER_JS_API_URL)
        return;
    }

    var script = document.createElement("script");
    script.setAttribute("src", ISSUER_JS_API_URL);
    me.parentNode.appendChild(script);
  }

  function replaceWithButton(script) {
    var button = document.createElement('button');
    var myOrigin = script.src.match(/^(.*)\/html-issuer.js/)[1];

    button.textContent = "Push to backpack";
    button.onclick = function(event) {
      event.preventDefault();

      var hBadge = getClosestAncestor(this, 'h-badge');
      if (hBadge) {
        var id = hBadge.getAttribute('id') || '';
        var pageURL = location.protocol + '//' +
                      location.host + location.pathname +
                      location.search + (id ? '#' + id : '');
        var assertionURL = myOrigin + '/assertion?url=' + 
                           encodeURIComponent(pageURL);
        OpenBadges.issue([assertionURL]);
      }
    };
    script.parentNode.replaceChild(button, script);    
  }

  if (!me.hasAttribute('data-push-badge'))
    return;

  maybeInjectIssuerApi();
  replaceWithButton(me);
})();
