(function init() {
  'use strict';

  function isSuccessTrue(responseText) {
    try {
      return JSON.parse(responseText).status === 'ok';
    } catch (e) {
      return false;
    }
  }

  function isStatus200(request) {
    return request.status === 200;
  }

  function sendRequest(requestType, resultCallback) {
    var request = new XMLHttpRequest();
    request.open(requestType, 'http://cors-test.appspot.com/test');
    request.addEventListener('readystatechange', function onRedy() {
      var doneResult;

      if (request.readyState === request.DONE) {
        doneResult = isStatus200(request)
          && isSuccessTrue(request.responseText);

        resultCallback(doneResult);
      }
    });
    request.send();
  }

  function generateCallback(selector) {
    return function generated(result) {
      var element = document.querySelector(selector);
      element.classList.add(result ? 'success' : 'error');
      element.innerHTML = result ? 'OK' : 'Failed';
    };
  }

  function initApp() {
    sendRequest('GET', generateCallback('.get'));
    sendRequest('POST', generateCallback('.post'));
    sendRequest('WEIRD', generateCallback('.weird'));
  }

  window.addEventListener('load', initApp);
})();