(function() {
  if (window.OpenBadgesMicroformatBridge) return;

  var me = document.querySelector('script[src$="/html-issuer.js"]');
  var myOrigin = me.src.match(/^(.*)\/html-issuer.js/)[1];

  function getClosestAncestor(element, className) {
    if (!element) return null;
    if (element.classList.contains(className)) return element;
    return getClosestAncestor(element.parentElement, className);
  }

  window.addEventListener("click", function(event) {
    if (event.target.hasAttribute('data-issue-html-badge')) {
      var hBadge = getClosestAncestor(event.target, 'h-badge');
      if (hBadge) {
        var id = hBadge.getAttribute('id') || '';
        var pageURL = location.protocol + '//' +
                      location.host + location.pathname +
                      location.search + (id ? '#' + id : '');
        var assertionURL = myOrigin + '/assertion?url=' + 
                           encodeURIComponent(pageURL);
        OpenBadges.issue([assertionURL]);
        event.preventDefault();
      }
    }
  }, true);

  window.OpenBadgesMicroformatBridge = {};
})();
