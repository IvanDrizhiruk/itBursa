//(function init() {
//    'use strict';

    var myId;
    var gameId;

    var GAME = {
        mySide: undefined
    };


    var SEND = {
        POST: postToServer
    };

    var ELEMENTS;


    var SOCKET = {
        socket :undefined,
        send: function(obj) {
            console.log('Send throw socket');
            console.log(obj);
            this.socket && this.socket.send(JSON.stringify(obj));
        }
    };

    function safeJSONparse(line) {
        try {
            return JSON.parse(line);
        } catch (e) {
            console.log('Can not parse as json ' + line);
            console.log(e);
        }

        return undefined;
    }

    function showMessage(message) {
        ELEMENTS.statusMessage.innerHTML = message
    }

    function postToServer(url, resultCallback) {
        var request = new XMLHttpRequest();
        request.open('POST', url);
        request.addEventListener('readystatechange', function () {
            if (request.readyState === request.DONE) {
                var result;
                if (request.status === 200 && request.responseText) {
                    result = safeJSONparse(request.responseText);
                }

                if (resultCallback) {
                    resultCallback(result, request.status);
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

    function newGemeId(gameId) {
        var li = document.createElement('li');
        li.innerHTML = 'Game_' + gameId;
        li.gameId = gameId;
        //li.classList.add('liclass_' + gameId);
        li.addEventListener('dblclick', joinToGame);
        return li;
    }

    function registryGameId(id) {
        if (myId === id) {
            return;
        }
        document.querySelector('.existing-games').appendChild(newGemeId(id));
    }

    function startGameWith(id) {
        if (!myId) {
            return;
        }

        gameId = id;

        ELEMENTS.createGame.disabled = true;
        showMessage('Ожидаем начала игры');

        SEND.POST(gameUrls.gameReady, {id: myId, gameId: gameId}, function (data, statusCode) {
            if(statusCode === 408) {
                showMessage('Ошибка старта игры: другой игрок не ответил');
            } else if(statusCode === 410) {
                showMessage('Неизвестная ошибка старта игры');
            } else if(!data) {
                showMessage('Some error');
            } else {
                GAME.mySide = data.side;

                ELEMENTS.startGame.style.display = 'none';
                ELEMENTS.mainGame.style.display = 'block';
            }
        });
    }

    function handleSocetMessage(message) {
        var data = JSON.parse(message.data);
        //console.log(message);

        switch (data.action) {
            case 'add':
                registryGameId(data.id);
                break;
            case 'remove':
                break;
            case 'startGame':
                startGameWith(data.id);
                break;
            default:
            {
                console.log('Some error');
                console.log(message);
            }
        }
    }

    function establishConnection() {
        try {
            SOCKET.socket = new WebSocket(gameUrls.list);
            SOCKET.socket.onopen = function(error){
                console.log('Socket is now open.');
                console.log(error);
            };
            SOCKET.socket.onclose = function(error){
                console.log('Socket is now closed.');
                console.log(error);
            };
            SOCKET.socket.onerror = function (error) {
                console.error('There was an un-identified Web Socket error');
                console.log(error);
            };
            SOCKET.socket.onmessage = handleSocetMessage;
        } catch (e) {
            console.error('Sorry, the web socket at "%s" is un-available', url);
        }
    }

    function onCreateGame() {
        ELEMENTS.createGame.disabled = true;

        SEND.POST(gameUrls.newGame, function (data, status) {
            if (!data) {
                showMessage('"Ошибка создания игры');
            }

            myId = data.yourId;

            SOCKET.send({register: myId}) //TODO can be send error
        });
    }

    function initElements() {
        ELEMENTS = {
            startGame: document.querySelector('.startGame'),
            mainGame: document.querySelector('.mainGame'),
            statusMessage: document.querySelector('.status-message'),
            createGame: document.querySelector('.createGame'),


            remove: function remove(element) {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            },
            findByClass : function findByClass(className) {
               return document.querySelector('.' + className);
            }
        }

        ELEMENTS.createGame.addEventListener('click', onCreateGame);
    }

    function initApp() {
        initElements();

        establishConnection();
    }

    window.addEventListener('load', initApp);
//})
//();