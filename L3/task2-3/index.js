/* global getWinner */
(function init() {
  'use strict';

  var GAME_STATE = {
    ENTER_BORDER_SIZE: 'enterBorderSize',
    IN_PROGRESS: 'inProgres',
    ENDED: 'ended'
  };

  var game = {
    boardSize: undefined,
    stepNumber: 0,
    gameStatus: GAME_STATE.ENDED,
    winner: undefined
  };

  var ELEMENTS = {
    getStartGameElement: function getStartGameElement() {
      return document.querySelector('.startGame');
    },
    getMainGameElement: function getMainGameElement() {
      return document.querySelector('.mainGame');
    },
    getCount: function getCount() {
      return document.querySelector('.count');
    },
    getErrorMessage: function getErrorMessage() {
      return document.querySelector('.error-message');
    },
    getFieldElement: function getFieldElement() {
      return document.querySelector('.field');
    },
    getWinnerElement: function getWinnerElement() {
      return document.querySelector('.winner-message');
    }
  };

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

  function recreateBoard(boardSize) {
    var row;
    var cell;
    var x;
    var y;
    var fragment = document.createDocumentFragment();
    for (x = 0; x < boardSize; x++) {
      row = createRow();
      fragment.appendChild(row);
      for (y = 0; y < boardSize; y++) {
        cell = createCell(x * boardSize + y);

        row.appendChild(cell);
      }
    }

    ELEMENTS.getFieldElement().innerHTML = '';
    ELEMENTS.getFieldElement().appendChild(fragment);
  }

  function setToWinnerField(text) {
    ELEMENTS.getWinnerElement().innerHTML = text;
    return null;
  }

  function goToBoard() {
    ELEMENTS.getStartGameElement().style.display = 'none';
    ELEMENTS.getMainGameElement().style.display = 'inline';
    game.gameStatus = GAME_STATE.IN_PROGRESS;

    recreateBoard(game.boardSize);
  }

  function showWinnMessage(nowPleyerStyle) {
    setToWinnerField(
      nowPleyerStyle === 'x'
        ? 'Крестик победил'
        : 'Нолик победил');
  }

  function tryToRestoreGame() {
    var fields;
    var cells;
    var element;
    var savedGame;
    var index;
    var data = localStorage.getItem('game');

    if (!data) {
      return;
    }

    savedGame = JSON.parse(data);

    game = savedGame.gamestate;
    setToWinnerField('Step number ' + game.stepNumber);

    goToBoard();

    fields = savedGame.fields;
    cells = document.querySelectorAll('.cell');

    for (index = 0; index < cells.length; index++) {
      element = cells[index];
      if (fields[element.indexInBoard]) {
        element.classList.add(fields[element.indexInBoard]);
      }
    }

    if (game.winner) {
      if (game.winner === 'xy') {
        setToWinnerField('Ничья');
      } else {
        showWinnMessage(game.winner);
      }

      game.gameStatus = GAME_STATE.ENDED;
    }
  }


  function isNumber(value) {
    var reg = new RegExp('^[0-9]+$');
    return reg.test(value);
  }


  function isValidFieldSize(sizeAsString) {
    var isValidNumber = sizeAsString && !isNaN(sizeAsString) && isNumber(sizeAsString);
    var sizeAsNumber = parseInt(sizeAsString, 10);

    return isValidNumber && sizeAsNumber >= 5 && sizeAsNumber <= 15;
  }

  function boartToArey() {
    var cells = document.querySelectorAll('.cell');
    var element;
    var res = [];
    var index;
    var res2;

    for (index = 0; index < cells.length; index++) {
      element = cells[index];

      res2 = undefined;
      if (element.classList.contains('x')) {
        res2 = 'x';
      } else if (element.classList.contains('o')) {
        res2 = 'o';
      } else {
        res2 = undefined;
      }

      if (res2) {
        res[element.indexInBoard] = res2;
      }
    }

    return res;
  }

  function saveToStorage() {
    localStorage.setItem('game', JSON.stringify({
      gamestate: game,
      fields: boartToArey()
    }));
  }

  function generateField() {
    if (!isValidFieldSize(ELEMENTS.getCount().value)) {
      ELEMENTS.getErrorMessage().innerHTML = 'Вы ввели некорректное число';

      return;
    }

    game.boardSize = parseInt(ELEMENTS.getCount().value, 10);
    goToBoard();
    saveToStorage();
  }

  function claerBoard() {
    var cells = document.querySelectorAll('.cell');
    var index = 0;
    var element;
    for (; index < cells.length; index++) {
      element = cells[index];
      element.classList.remove('x');
      element.classList.remove('o');
    }
  }

  function startNewGame() {
    game.stepNumber = 0;
    game.gameStatus = GAME_STATE.ENTER_BORDER_SIZE;

    ELEMENTS.getErrorMessage().innerHTML = '';
    ELEMENTS.getCount().value = '';
    setToWinnerField('');
    ELEMENTS.getStartGameElement().style.display = 'inline';
    ELEMENTS.getMainGameElement().style.display = 'none';

    claerBoard();
  }


  function isCellElement(element) {
    return element.classList.contains('cell');
  }

  function isGameFinished() {
    return game.gameStatus === GAME_STATE.ENDED;
  }

  function isFieldUsed(element) {
    var classList = element.classList;

    return classList.contains('x')
      || classList.contains('o');
  }

  function calculateNowPleyerStyle(stepNumber) {
    return (stepNumber % 2 === 1) ? 'x' : 'o';
  }

  function finishIfNeed() {
    var winner = getWinner();

    if (winner) {
      game.winner = winner;
      showWinnMessage(winner);
    } else if (game.boardSize * game.boardSize === game.stepNumber) {
      game.winner = 'xy';
      setToWinnerField('Ничья');
    } else {
      return;
    }

    game.gameStatus = GAME_STATE.ENDED;
  }

  function clickOnField(event) {
    var element = event.target;

    if (!isCellElement(element)
      || isGameFinished()
      || isFieldUsed(element)) {
      return;
    }

    event.stopPropagation();


    game.stepNumber++;
    setToWinnerField('Step number ' + game.stepNumber);

    element.classList.add(calculateNowPleyerStyle(game.stepNumber));

    finishIfNeed();

    saveToStorage();
  }

  function initElements() {
    document.querySelector('.generateField').addEventListener('click', generateField);
    document.querySelector('.startNewGame').addEventListener('click', startNewGame);
    document.querySelector('.field').addEventListener('click', clickOnField);
  }

  function initApp() {
    initElements();
    tryToRestoreGame();
  }

  window.addEventListener('load', initApp);
})();