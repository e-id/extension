if (typeof browser === 'undefined') {
  var browser = chrome;
}

browser.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (data) {
    browser.runtime.sendNativeMessage('io.github.eid', { url: data }, function(response) {
      if(chrome.runtime.lastError) {
        port.postMessage({ error: chrome.runtime.lastError.message });
      } else {
        port.postMessage(response);
      }
    });
  });
});
