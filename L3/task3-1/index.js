function jsonpCallback(data) {
  'use strict';

  var contentElement = document.querySelector('#content');
  var text;

  if (data.parse) {
    text = data.parse.text['*'];
    contentElement.innerHTML = text.replace(/href="\/wiki/g, 'href="http://en.wikipedia.org/wiki');
  } else {
    contentElement.innerHTML = 'Cannot find the knowledge';
  }
}

(function init() {
  'use strict';

  function sendJsonpRequest(title) {
    var scriptTag = document.createElement('script');
    scriptTag.src = 'http://en.wikipedia.org/w/api.php?action=parse&page='
      + encodeURIComponent(title)
      + '&prop=text&section=0&format=json&callback=jsonpCallback';

    document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
  }

  function find() {
    var title = document.querySelector('input').value;
    sendJsonpRequest(title.replace(' ', '_'));
  }

  function initialiseApp() {
    document.querySelector('button').addEventListener('click', find);
  }

  window.addEventListener('load', initialiseApp);
})();