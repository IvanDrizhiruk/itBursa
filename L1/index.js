var GEMA_STATE = {
    IN_PROGRESS: 'inProgres',
    ENDED: 'ended'
}
var stepNumber = 0;
var gameStatus = GEMA_STATE.ENDED;


window.addEventListener('load', onLoad);

function onLoad() {
    document
        .querySelector('.startNewGame')
        .addEventListener('click', startGame);

    document
        .querySelector('.field')
        .addEventListener('click', clickOnField);
}

function startGame () {
    claerBoard();
    stepNumber = 0;
    setToWinnerField('');
    gameStatus = GEMA_STATE.IN_PROGRESS;
}

function claerBoard() {
    var cells = document.querySelectorAll(".cell");
    for(var index = 0; index < cells.length; index++) {
        var element = cells[index];
        element.classList.remove('x', 'o');
        element.removeEventListener('click', stopPropagation);
    }
}

function isGameFinished() {
    return gameStatus === GEMA_STATE.ENDED;
}

function isFieldUsed(element) {
    return element.classList.contains('x','o');
}

function isCellElement(element) {
    return element.classList.contains('cell');
}
function setToWinnerField(text) {
    document.querySelector('.winner-message').innerHTML = text;
}

function showWinnMessage(nowPleyerStyle) {
    setToWinnerField(
        'x' === nowPleyerStyle
            ? 'Крестик победил'
            : 'Нолик победил');
}

function finishIfNeed() {
    var winner = getWinner()

    if (winner) {
        showWinnMessage(winner);
    } else if (9 == stepNumber) {
        setToWinnerField("Ничья");
    } else {
        return;
    }

    gameStatus = GEMA_STATE.ENDED;
}

function calculateNowPleyerStyle(stepNumber) {
    return (stepNumber % 2 == 1) ? 'x' : 'o';
}

function stopPropagation(event) {
    event.stopPropagation();
}

function clickOnField(event) {
    var element = event.target;

    if (!isCellElement(element)
        || isGameFinished()
        || isFieldUsed(element)) {
        return;
    }

    element.addEventListener('click', stopPropagation);
    event.stopPropagation();


    stepNumber++;
    setToWinnerField('Step number ' + stepNumber);

    element.classList.add(calculateNowPleyerStyle(stepNumber));

    finishIfNeed();
}