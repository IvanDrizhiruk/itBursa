/* global gameUrls */
(function init() {
  'use strict';
  var gameId;
  var playerId;

  var GAME_STATE = {
    INITIALIZE: 'initialize',
    IN_PROGRESS: 'inProgres',
    ENDED: 'ended'
  };

  var GAME = {
    mySide: undefined,
    nowSide: 'x',
    status: GAME_STATE.INITIALIZE
  };


  var SEND;
  var ELEMENTS;
  var SOCKET = {
    socket: undefined,
    send: function send(obj) {
      if (this.socket) {
        this.socket.send(JSON.stringify(obj));
      }
    }
  };

  function safeJSONparse(line) {
    try {
      return JSON.parse(line);
    } catch (e) {
      return undefined;
    }
  }

  function showMessage(message) {
    ELEMENTS.startGameStatusMessage.innerHTML = message;
  }

  function showMessageInMainGame(message) {
    ELEMENTS.mainGameStatusMessage.innerHTML = message;
  }

  function postToServer(url, data, headers, postResultCallback) {
    var index;
    var request = new XMLHttpRequest();
    request.open('post', url);
    if (data) {
      request.setRequestHeader('Content-type', 'application/json');
    }
    if (headers) {
      for (index in headers) {
        if (index) {
          request.setRequestHeader(index, headers[index]);
        }
      }
    }

    request.addEventListener('readystatechange', function addEventListenerCb1() {
      var result;
      if (request.readyState === request.DONE) {
        if (request.responseText) {
          result = safeJSONparse(request.responseText);
        }

        if (postResultCallback) {
          postResultCallback(result, request.status);
        }
      }
    });

    if (data) {
      request.send(JSON.stringify(data));
    } else {
      request.send();
    }
  }

  function getToServer(url, headers, getResultCallback) {
    var index;
    var request = new XMLHttpRequest();
    request.open('get', url);

    if (headers) {
      for (index in headers) {
        if (index) {
          request.setRequestHeader(index, headers[index]);
        }
      }
    }

    request.addEventListener('readystatechange', function addEventListenerCb2() {
      var result;
      if (request.readyState === request.DONE) {
        if (request.status === 200 && request.responseText) {
          result = safeJSONparse(request.responseText);
        }

        if (getResultCallback) {
          getResultCallback(result, request.status);
        }
      }
    });

    request.send();
  }

  function putToServer(url, headers, putResultCallback) {
    var index;
    var request = new XMLHttpRequest();
    request.open('put', url);

    if (headers) {
      for (index in headers) {
        if (index) {
          request.setRequestHeader(index, headers[index]);
        }
      }
    }

    request.addEventListener('readystatechange', function addEventListenerCb3() {
      var result;
      if (request.readyState === request.DONE) {
        if (request.status === 200 && request.responseText) {
          result = safeJSONparse(request.responseText);
        }

        if (putResultCallback) {
          putResultCallback(result, request.status);
        }
      }
    });

    request.send();
  }

  function joinToGame(event) {
    var targetElement = event.target;

    gameId = targetElement.gameId;
    SOCKET.send({register: targetElement.gameId});
  }

  function newGemeId(newGameId) {
    var li = document.createElement('li');
    li.innerHTML = newGameId;
    li.gameId = newGameId;
    li.classList.add('liclass_' + newGameId);
    li.addEventListener('click', joinToGame);
    return li;
  }

  function findCellByIndex(index) {
    return document.querySelectorAll('.cell')[index - 1];
  }

  function listenOfOpponent() {
    var headers = {'Game-ID': gameId, 'Player-ID': playerId};
    var callback = function callbackX1(data, statusCode) {
      var message;
      var element;
      if (statusCode !== 200 && GAME.status === GAME_STATE.IN_PROGRESS) {
        SEND.get(gameUrls.move, headers, callbackX1);
        if (statusCode !== 504) {
          message = (data && data.message) || 'Неизвестная ошибка';
          showMessageInMainGame(message);
          GAME.status = GAME_STATE.ENDED;
          ELEMENTS.newGame.innerHTML = 'Новая игра';
        }

        return;
      }

      element = findCellByIndex(data.move);
      element.classList.add(GAME.opositSide);
      GAME.nowSide = GAME.nowSide === 'x' ? 'o' : 'x';

      if (data && data.win) {
        showMessageInMainGame(data.win);
        GAME.status = GAME_STATE.ENDED;
        ELEMENTS.newGame.innerHTML = 'Новая игра';
      }
    };

    SEND.get(gameUrls.move, headers, callback);
  }

  function clearBoard() {
    var index;
    var element;
    var cells = document.querySelectorAll('.field .cell');
    for (index = 0; index < 100; index++) {
      element = cells[index];

      element.classList.remove('x');
      element.classList.remove('o');
    }
  }

  function startGameWith(id) {
    playerId = id;

    ELEMENTS.createGame.disabled = true;
    showMessage('Ожидаем начала игры');

    SEND.post(gameUrls.gameReady, {player: playerId, game: gameId}, undefined,
      function postCb1(data, statusCode) {
      if (statusCode === 200) {
        GAME.mySide = data.side;
        GAME.opositSide = (data.side === 'x' ? 'o' : 'x');

        ELEMENTS.startGame.style.display = 'none';
        ELEMENTS.mainGame.style.display = 'block';
        showMessageInMainGame('');
        ELEMENTS.newGame.innerHTML = 'Сдаться';

        GAME.status = GAME_STATE.IN_PROGRESS;
        if (GAME.mySide !== GAME.nowSide) {
          listenOfOpponent();
        }

        clearBoard();
      } else if (statusCode === 410) {
        showMessage('Ошибка старта игры: другой игрок не ответил');
      } else {
        showMessage('Неизвестная ошибка старта игры');
        ELEMENTS.newGame.innerHTML = 'Новая игра';
        GAME.status = GAME_STATE.ENDED;
      }
    });
  }

  function removeGame(id) {
    ELEMENTS.remove(document.querySelector('.liclass_' + id.replace('.', '\\.')));
  }

  function registryGameId(id) {
    if (gameId === id) {
      return;
    }
    ELEMENTS.existingGames.appendChild(newGemeId(id));
  }

  function handleSocetMessage(message) {
    var data = JSON.parse(message.data);

    switch (data.action) {
      case 'add':
        registryGameId(data.id);
        break;
      case 'remove':
        removeGame(data.id);
        break;
      case 'startGame':
        startGameWith(data.id);
        break;
      default:
      {
        showMessage('Unknowen');
      }
    }
  }

  function establishConnection() {
    if (SOCKET.socket) {
      SOCKET.socket.close();
    }

    SOCKET.socket = new WebSocket(gameUrls.list);
    SOCKET.socket.onmessage = handleSocetMessage;
  }

  function onCreateGame() {
    ELEMENTS.createGame.disabled = true;

    SEND.post(gameUrls.newGame, undefined, undefined, function postCb2(data, status) {
      if (status !== 200) {
        showMessage('Ошибка создания игры');
        ELEMENTS.createGame.disabled = false;

        return;
      }

      gameId = data.yourId;

      SOCKET.send({register: gameId});
    });
  }

  function createRow() {
    var row = document.createElement('div');
    row.classList.add('row');
    return row;
  }

  function createCell(indexInBoard) {
    var cell = document.createElement('div');
    cell.classList.add('cell');
    cell.indexInBoard = indexInBoard;

    return cell;
  }

  function createBoard() {
    var row;
    var cell;
    var x;
    var y;
    var fragment = document.createDocumentFragment();
    for (x = 0; x < 10; x++) {
      row = createRow();
      fragment.appendChild(row);
      for (y = 0; y < 10; y++) {
        cell = createCell(x * 10 + y + 1);
        row.appendChild(cell);
      }
    }

    ELEMENTS.fieldElement.innerHTML = '';
    ELEMENTS.fieldElement.appendChild(fragment);
  }

  function clickOnField(event) {
    var element = event.target;
    var indexInBoard = element.indexInBoard;

    showMessageInMainGame('');

    SEND.post(
      gameUrls.move,
      {move: indexInBoard},
      {'Game-ID': gameId, 'Player-ID': playerId},
      function postcbX2(data, statusCode) {
        var message;
        if (statusCode !== 200) {
          message = (data && data.message) || 'Неизвестная ошибка';
          showMessageInMainGame(message);

          GAME.status = GAME_STATE.ENDED;
          ELEMENTS.newGame.innerHTML = 'Новая игра';

          return;
        }

        element.classList.add(GAME.mySide);

        if (data && data.win) {
          showMessageInMainGame(data.win);
          GAME.status = GAME_STATE.ENDED;
          ELEMENTS.newGame.innerHTML = 'Новая игра';

          return;
        }

        GAME.nowSide = GAME.nowSide === 'x' ? 'o' : 'x';
        listenOfOpponent();
      });
  }

  function clickOnNewGame() {
    var headers;
    var message;
    ELEMENTS.startGame.style.display = 'block';
    ELEMENTS.mainGame.style.display = 'none';

    if (GAME.status === GAME_STATE.ENDED) {
      ELEMENTS.startGame.style.display = 'block';
      ELEMENTS.mainGame.style.display = 'none';
      ELEMENTS.createGame.disabled = false;
      showMessage('');
      GAME.status = GAME_STATE.INITIALIZE;

      ELEMENTS.existingGames.innerHTML = '';
      establishConnection();

      gameId = undefined;
      playerId = undefined;
    } else {
      headers = {'Game-ID': gameId, 'Player-ID': playerId};
      SEND.put(gameUrls.surrender, headers, function putcbx1(data, statusCode) {
        if (statusCode === 200) {
          ELEMENTS.startGame.style.display = 'block';
          ELEMENTS.mainGame.style.display = 'none';
          ELEMENTS.createGame.disabled = false;
          showMessage('');
          GAME.status = GAME_STATE.INITIALIZE;

          ELEMENTS.existingGames.innerHTML = '';
          establishConnection();

          gameId = undefined;
          playerId = undefined;
          GAME.mySide = undefined;
          GAME.nowSide = 'x';
        } else {
          message = (data && data.message) || 'Неизвестная ошибка';
          showMessageInMainGame(message);

          GAME.status = GAME_STATE.ENDED;
          ELEMENTS.newGame.innerHTML = 'Новая игра';
        }
      });
    }
  }

  function initElements() {
    ELEMENTS = {
      startGame: document.querySelector('.startGame'),
      mainGame: document.querySelector('.mainGame'),
      startGameStatusMessage: document.querySelector('.startGame .status-message'),
      createGame: document.querySelector('.createGame'),
      fieldElement: document.querySelector('.field'),
      mainGameStatusMessage: document.querySelector('.mainGame .status-message'),
      newGame: document.querySelector('.newGame'),
      existingGames: document.querySelector('.existing-games'),


      remove: function remove(element) {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
    };

    ELEMENTS.createGame.addEventListener('click', onCreateGame);

    createBoard();

    ELEMENTS.fieldElement.addEventListener('click', clickOnField);

    ELEMENTS.newGame.addEventListener('click', clickOnNewGame);

    SEND = {
      post: postToServer,
      get: getToServer,
      put: putToServer
    };
  }

  function initApp() {
    initElements();

    establishConnection();
  }

  window.addEventListener('load', initApp);
})();