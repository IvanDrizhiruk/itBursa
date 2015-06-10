(function init() {
  'use strict';

  function isSuccessTure(responseText) {
      try {
        return JSON.parse(responseText).status === 'ok';
      } catch (e) {
        console.log(e);
        return false;
      }
  }

  function sendRequest(requestType, resultCallback) {
    var request = new XMLHttpRequest();
    request.open(requestType, 'https://cors-test.appspot.com/test');
    request.addEventListener('readystatechange', function () {
      if (request.readyState === request.DONE) {
        var doneResult = request.status === 200 && isSuccessTure(request.responseText);
        resultCallback && resultCallback(doneResult);
      }
    });
    request.send();
  }

  function generateCallback(selector) {
    return function(result) {
      var element = document.querySelector(selector);
      element.classList.add(result ? 'success' : 'error');
      element.innerHTML = result ? 'Ok' : 'Failed';
    }
  }

  function initApp() {
    sendRequest('GET', generateCallback('.get'));
    sendRequest('POST', generateCallback('.post'));
    sendRequest('WEIRD', generateCallback('.weird'));
  }

  window.addEventListener('load', initApp);

})();