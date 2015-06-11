(function init() {
  'use strict';

  //var gameList =[];

  var socket;

  function newGemeId(gameId) {
    var li = document.createElement('li');
    li.innerHTML = 'Game_' + gameId;

    return li;
  }

  function registryGameId(gameId) {
    document.querySelector('.existing-games').appendChild(newGemeId(gameId));
  }

  function establishConnection() {
    socket = new WebSocket(gameUrls.list);
    socket.onmessage = function (message) {
      var data = JSON.parse(message.data);
      console.log(message);

      switch (data.action) {
        case 'add':
          registryGameId(data.id);
          break;
        case 'remove':
          break;
        case 'startGame':
          break;
        default:
        {
          console.log('Some error');
          console.log(message);
        }
      }
    };
  }

  function initElements() {
    document.querySelector('')
  }

  function initApp() {
    establishConnection();

    initElements();
  }

  window.addEventListener('load', initApp);
})();