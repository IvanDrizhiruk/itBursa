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
  gameStatus: GAME_STATE.ENDED
};

var ELEMENTS = {
  getStartGameElement: function() { return document.querySelector('.startGame'); },
  getMainGameElement:  function() { return document.querySelector('.mainGame'); },
  getCount:            function() { return document.querySelector('.count'); },
  getErrorMessage:     function() { return document.querySelector('.error-message'); },
  getFieldElement:     function() { return document.querySelector('.field'); },
  getWinnerElement:    function() { return document.querySelector('.winner-message'); }
};

function tryToRestoreGame() {
  var data = localStorage.getItem('game');

  if (!data) {
    return;
  }

  var savedGame = JSON.parse(data);

  game = savedGame.gamestate;
  setToWinnerField('Step number ' + game.stepNumber);

  goToBoard();

  var fields = savedGame.fields;
  var cells = document.querySelectorAll('.cell');
  var element;

  var res = [];
  for (var index = 0; index < cells.length; index++) {
    element = cells[index];
    if (fields[element.indexInBoard]) {
      element.classList.add(fields[element.indexInBoard]);
    }
  }
}

function isValidFieldSize(size) {
  var isValidNumber = size && !isNaN(size);

  return isValidNumber && size >=5 && size <=15;
}

function createRow() {
  var row = document.createElement('div');
  row.classList.add('row')
  return row;
}
function createCell(indexInBoard) {
  var cell = document.createElement('div');
  cell.classList.add('cell');
  cell.indexInBoard = indexInBoard;

  return cell;
}
function recreateBoard(boardSize) {
  var fragment = document.createDocumentFragment();
  for(var x=0;x<boardSize; x++){
    var row = createRow();
    fragment.appendChild(row);
    for(var y=0;y<boardSize; y++) {

      var cell = createCell(x * boardSize + y);

      row.appendChild(cell);
    }
  }

  ELEMENTS.getFieldElement().innerHTML = '';
  ELEMENTS.getFieldElement().appendChild(fragment);
}

function goToBoard() {
  ELEMENTS.getStartGameElement().style.display = 'none';
  ELEMENTS.getMainGameElement().style.display = 'inline';

  recreateBoard(game.boardSize);
}

function generateField() {
  var boardSize =  parseInt(ELEMENTS.getCount().value);
  if (!isValidFieldSize(boardSize)) {
    ELEMENTS.getErrorMessage().innerHTML = 'Вы ввели некорректное число';

    return;
  }

  game.boardSize = boardSize;

  goToBoard();
}

//function claerBoard() {
//  var cells = document.querySelectorAll('.cell');
//  var index = 0;
//  var element;
//  for (; index < cells.length; index++) {
//    element = cells[index];
//    element.classList.remove('x');
//    element.classList.remove('o');
//  }
//}

function startNewGame() {
  //claerBoard();
  game.stepNumber = 0;
  game.gameStatus = GAME_STATE.ENTER_BORDER_SIZE;

  ELEMENTS.getErrorMessage().innerHTML = '';
  ELEMENTS.getCount().value = '';
  setToWinnerField('');
  ELEMENTS.getStartGameElement().style.display = 'inline';
  ELEMENTS.getMainGameElement().style.display = 'none';
}


/////////////////////////////////
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

function setToWinnerField(text) {
  ELEMENTS.getWinnerElement().innerHTML = text;
}

function calculateNowPleyerStyle(stepNumber) {
  return (stepNumber % 2 == 1) ? 'x' : 'o';
}

function showWinnMessage(nowPleyerStyle) {
  'use strict';

  setToWinnerField(
    nowPleyerStyle === 'x'
      ? 'Крестик победил'
      : 'Нолик победил');
}

function finishIfNeed() {
  var winner = getWinner()

  console.log("ISD >>> " + winner);
  if (winner) {
    showWinnMessage(winner);
  } else if (game.boardSize * game.boardSize == game.stepNumber) {
    setToWinnerField("Ничья");
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

  if (isGameFinished()) {
    localStorage.clear();
  } else {
    saveToStorage();
  }

  //element.removeEventListener('click', stopPropagation);
}
///////////////////

function initElements() {
  document.querySelector('.generateField').addEventListener('click', generateField);
  document.querySelector('.startNewGame').addEventListener('click', startNewGame);
  document.querySelector('.field').addEventListener('click', clickOnField);
}

function initApp() {
    initElements();
    tryToRestoreGame();
}
///////////////////

function boartToArey() {
  var cells = document.querySelectorAll('.cell');
  var element;

  var res = [];
  for (var index = 0; index < cells.length; index++) {
    element = cells[index];

    var res2;
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
  }))
}

window.addEventListener('load', initApp);

})();