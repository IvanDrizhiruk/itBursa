function jsonpCallback(data) {
  'use strict';

  console.log(data);

  var contentElement = document.querySelector('#content');

  if (data.parse) {
    var text = data.parse.text['*'];
    contentElement.innerHTML = text.replace(/href="\/wiki/g, 'href="http://en.wikipedia.org/wiki');
  } else {
    contentElement.innerHTML = "Cannot find the knowledge";
  }

}

(function init() {
  'use strict';

  function sendJsonpRequest(title) {
    var scriptTag = document.createElement('script');
    scriptTag.src = "http://en.wikipedia.org/w/api.php?action=parse&page="
      + encodeURIComponent(title)
      + "&prop=text&section=0&format=json&callback=jsonpCallback";

    document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
  }

  function find() {
    var title = document.querySelector('#title').value;
    sendJsonpRequest(title);
  }

  function initialiseApp() {
    document.querySelector('#find').addEventListener('click', find);
  }

  window.addEventListener('load', initialiseApp);
})();