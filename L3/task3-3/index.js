    //(function init() {
    //    'use strict';
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


        var SEND = {
            POST: postToServer,
            GET: getToServer,
            PUT: putToServer
        };
        var ELEMENTS;
        var SOCKET = {
            socket :undefined,
            send: function(obj) {
                //console.log('Send throw socket');
                //console.log(obj);
                this.socket && this.socket.send(JSON.stringify(obj));
            }
        };

        function safeJSONparse(line) {
            try {
                return JSON.parse(line);
            } catch (e) {
                //console.log('Can not parse as json ' + line);
                //console.log(e);
            }

            return undefined;
        }

        function showMessage(message) {
            ELEMENTS.startGameStatusMessage.innerHTML = message
        }

        function showMessageInMainGame(message) {
            ELEMENTS.mainGameStatusMessage.innerHTML = message
        }

        function postToServer(url, data, headers, postResultCallback) {
            var request = new XMLHttpRequest();
            request.open('POST', url);
            if (data) {
                request.setRequestHeader("Content-type","application/json");
            }
            if(headers) {
                for(var index in headers) {
                    request.setRequestHeader(index, headers[index]);
                }
            }

            request.addEventListener('readystatechange', function () {
                if (request.readyState === request.DONE) {
                    var result;
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
            var request = new XMLHttpRequest();
            request.open('GET', url);

            if(headers) {
                for(var index in headers) {
                    request.setRequestHeader(index, headers[index]);
                }
            }

            request.addEventListener('readystatechange', function () {
                if (request.readyState === request.DONE) {
                    var result;
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
            var request = new XMLHttpRequest();
            request.open('PUT', url);

            if(headers) {
                for(var index in headers) {
                    request.setRequestHeader(index, headers[index]);
                }
            }

            request.addEventListener('readystatechange', function () {
                if (request.readyState === request.DONE) {
                    var result;
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
            console.log("ISD gameId " + gameId);
            SOCKET.send({register: targetElement.gameId});
        }

        function newGemeId(gameId) {
            var li = document.createElement('li');
            li.innerHTML = gameId;
            li.gameId = gameId;
            li.classList.add('liclass_' + gameId);
            //li.addEventListener('dblclick', joinToGame);
            li.addEventListener('click', joinToGame);
            return li;
        }

        function registryGameId(id) {
            if (gameId === id) {
                return;
            }
            ELEMENTS.existingGames.appendChild(newGemeId(id));
        }

        function findCellByIndex(index) {
            return document.querySelectorAll('.cell')[index -1];
        }

        function listenOfOpponent() {
            var headers = {'Game-ID': gameId, 'Player-ID': playerId};
            var callback = function (data, statusCode) {
                if (200 !== statusCode && GAME.status === GAME_STATE.IN_PROGRESS) {
                    SEND.GET(gameUrls.move, headers, callback);
                  if (504 !== statusCode) {
                    var message = (data && data.message) || "Неизвестная ошибка";
                    showMessageInMainGame(message);
                    GAME.status = GAME_STATE.ENDED;
                    ELEMENTS.newGame.innerHTML = 'Новая игра';
                  }

                  return;
                }

                var element = findCellByIndex(data.move);
                element.classList.add(GAME.opositSide);
                GAME.nowSide = 'x' === GAME.nowSide ? 'o' : 'x';

                if (data && data.win) {
                    showMessageInMainGame(data.win);
                    GAME.status = GAME_STATE.ENDED;
                    ELEMENTS.newGame.innerHTML = 'Новая игра';
                }
            };

            SEND.GET(gameUrls.move, headers, callback);
        }

        function startGameWith(id) {
            playerId = id;

            ELEMENTS.createGame.disabled = true;
            showMessage('Ожидаем начала игры');

            SEND.POST(gameUrls.gameReady, {player: playerId, game: gameId}, undefined, function (data, statusCode) {
                    if (statusCode === 200) {
                        GAME.mySide = data.side;
                        GAME.opositSide = ('x' === data.side ? 'o' : 'x');

                        ELEMENTS.startGame.style.display = 'none';
                        ELEMENTS.mainGame.style.display = 'block';
                        showMessageInMainGame('');
                        ELEMENTS.newGame.innerHTML = 'Сдаться';

                        GAME.status = GAME_STATE.IN_PROGRESS;
                        if(GAME.mySide !== GAME.nowSide) {
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
                    alert('Some error');
                    //console.log('Some error');
                    //console.log(message);
                }
            }
        }

        function establishConnection() {
            //try {
                if (SOCKET.socket) {
                    SOCKET.socket.close();
                }

                SOCKET.socket = new WebSocket(gameUrls.list);
                SOCKET.socket.onopen = function(error){
                    //console.log('Socket is now open.');
                    //console.log(error);
                };
                SOCKET.socket.onclose = function(error){
                    //console.log('Socket is now closed.');
                    //console.log(error);
                };
                SOCKET.socket.onerror = function (error) {
                    showMessage('Ошибка создания игры')
                    console.error('There was an un-identified Web Socket error');
                    //console.log(error);
                };
                SOCKET.socket.onmessage = handleSocetMessage;
            //} catch (e) {
            //    console.error('Sorry, the web socket at "%s" is un-available', url);
            //}
        }

        function onCreateGame() {
            ELEMENTS.createGame.disabled = true;

            SEND.POST(gameUrls.newGame, undefined, undefined, function (data, status) {
                if (200 !== status) {
                    showMessage('Ошибка создания игры');
                    ELEMENTS.createGame.disabled = false;

                    return;
                }

                gameId = data.yourId;

                console.log("ISD gameId " + gameId);

                SOCKET.send({register: gameId}) //TODO can be send error
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

        function clearBoard() {
            var cells = document.querySelectorAll('.field .cell');
            for (var index = 0 ; index <100 ; index ++) {
                var element = cells[index];

                element.classList.remove('x');
                element.classList.remove('o');
            }
        }

        function isCellElement(element) {
            return element.classList.contains('cell');
        }

        function isGameFinished() {
            return GAME.status === GEMA_STATE.ENDED;
        }

        function isFieldUsed(element) {
            return element.classList.contains('x','o');
        }

        //function showInWinnerField(text) {
        //    ELEMENTS.mainGameStatusMessage.innerHTML = text;
        //    return null;
        //}
        //
        //function showWinnMessage(winner) {
        //    showMessageInMainGame(winner === 'x'
        //            ? 'Крестик победил'
        //            : 'Нолик победил');
        //}

        function clickOnField(event) {
            var element = event.target;
            var indexInBoard = element.indexInBoard;

            showMessageInMainGame('');

            //if (GAME.status === GAME_STATE.IN_PROGRESS && GAME.nowSide === GAME.mySide) {


                //if (!isCellElement(element)
                //    //|| isGameFinished() //TODO
                //    || isFieldUsed(element)) {
                //    showMessageInMainGame("Неизвестная ошибка");
                //    return;
                //}

                SEND.POST(
                    gameUrls.move,
                    { move: indexInBoard},
                    {'Game-ID': gameId, 'Player-ID': playerId},
                    function (data, statusCode) {
                        if(statusCode !== 200) {
                            var message = (data && data.message) || "Неизвестная ошибка";
                            showMessageInMainGame(message);

                            GAME.status = GAME_STATE.ENDED;
                            ELEMENTS.newGame.innerHTML = 'Новая игра';

                            return;
                        }

                        element.classList.add(GAME.mySide);

                        if(data && data.win) {
                            showMessageInMainGame(data.win);
                            GAME.status = GAME_STATE.ENDED;
                            ELEMENTS.newGame.innerHTML = 'Новая игра';

                            return;
                        }

                        GAME.nowSide = 'x' === GAME.nowSide ? 'o' : 'x';
                        listenOfOpponent();
                    })

            //}
        }

        function clickOnNewGame() {
            if(GAME.status === GAME_STATE.ENDED) {
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
                var headers = {'Game-ID': gameId, 'Player-ID': playerId};
                SEND.PUT(gameUrls.surrender, headers, function (data, statusCode) {
                    if (200 === statusCode) {
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
                        var message = (data && data.message) || "Неизвестная ошибка";
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
                fieldElement:  document.querySelector('.field'),
                mainGameStatusMessage: document.querySelector('.mainGame .status-message'),
                newGame: document.querySelector('.newGame'),
                existingGames: document.querySelector('.existing-games'),


                remove: function remove(element) {
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                },
                findByClass : function findByClass(className) {
                   return document.querySelector('.' + className);
                }
            };

            ELEMENTS.createGame.addEventListener('click', onCreateGame);

            createBoard();

            ELEMENTS.fieldElement.addEventListener('click', clickOnField);

            ELEMENTS.newGame.addEventListener('click', clickOnNewGame);
        }

        function initApp() {
            initElements();

            establishConnection();
        }

        window.addEventListener('load', initApp);
    //})();