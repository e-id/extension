if (typeof browser === 'undefined') {
  var browser = chrome;
}

window.openEidXHelper = function() {
  const elements = document.querySelectorAll('[href^="e-id://"]');
  elements.forEach(function (el) {
    if (!el.hasAttribute('data-x-href')) {
      el.setAttribute('data-x-href', el.getAttribute('href'));
      var url = new URL(el.getAttribute('href'));
      if (url.host === '') {
        var newUrl = new URL(location.href);
        newUrl.protocol = 'e-id';
        newUrl.search = url.search;
        newUrl.hash = url.hash;
        Object.keys(el.dataset).forEach(function (key) {
          if (key.startsWith('eId')) {
            newUrl.searchParams.set('e-id-' + key.substring(3).toLowerCase(), el.dataset[key]);
          }
        });
        url = new URL(newUrl.href + (url.href.endsWith('#') ? '#' : ''));
      }
      el.setAttribute('href', 'javascript:/*' + url.href + '*/');
      el.setAttribute('data-x-href', url.href);
      el.addEventListener('click', function(e) {
        var url = new URL(e.target.closest('a').getAttribute('data-x-href'));
        var fx = null;
        if (url.searchParams.has('e-id-callback')) {
          var callback = url.searchParams.get('e-id-callback');
          window.eIdCallbacks[callback] = new window.eIdCallback(callback);
          fx = window.eIdCallbacks[callback];
        }
        window.eIdRead(url.href, fx);
      });
    }
  });
}

window.eIdRead = function(url, callback) {
  var port = browser.runtime.connect();
  port.postMessage(url);
  port.onMessage.addListener(function (data) {
    callback.callback ? callback.callback(data) : console.log(data);
  });
}

window.eIdCallbacks = {};

window.eIdCallback = function(callback) {
  this.name = callback;
  this.callback = function(data) {
    var evt = new CustomEvent(this.name, { detail: data });
    window.dispatchEvent(evt);
  }
}

window.addEventListener('load', function() {
  window.openEidXHelper();
});

