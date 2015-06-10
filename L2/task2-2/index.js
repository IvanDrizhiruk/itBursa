(function init() {
  'use strict';

  var value1;
  var value2;
  var error1;
  var error2;
  var button;

  function validateNumber(number) {
    var re = /^[0-9]+([.][0-9]*)?$/i;
    return re.test(number);
  }

  function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;

    if (parent.lastchild === targetElement) {
      parent.appendChild(newElement);
    } else {
      parent.insertBefore(newElement, targetElement.nextSibling);
    }
  }

  function validateAndShowError(valueObj, error) {
    var value = valueObj.value;

    var isValid = value && !isNaN(value) && validateNumber(value);
    if (!isValid) {
      insertAfter(error, valueObj);
    }
    return isValid;
  }

  function appendResult(res) {
    var result = document.createElement('div');
    result.id = 'result';
    result.innerHTML = res;
    document.querySelector('body').appendChild(result);
  }

  function removeError(error) {
    if (error.parentNode) {
      error.parentNode.removeChild(error);
    }
  }
  function prepareForCalculation() {
    var result;

    removeError(error1);
    removeError(error2);

    result = document.querySelector('#result');
    if (result) {
      document.querySelector('body').removeChild(result);
    }
  }

  function onButtonClick() {
    var v1;
    var v2;
    prepareForCalculation();
    v1 = validateAndShowError(value1, error1);
    v2 = validateAndShowError(value2, error2);

    if (!v1) {
      insertAfter(error1, value1);
    }

    if (!v2) {
      insertAfter(error2, value2);
    }

    if (v1 && v2) {
      appendResult(parseFloat(value1.value) + parseFloat(value2.value));
    }
  }

  function initApp() {
    var body;

    value1 = document.createElement('input');
    value2 = document.createElement('input');
    error1 = document.createElement('div');
    error2 = document.createElement('div');
    button = document.createElement('button');

    button.innerHTML = 'Посчитать';
    button.addEventListener('click', onButtonClick);
    error1.classList.add('error-message');
    error1.innerHTML = 'Это не число';
    error1.style.color = 'red';

    error2.classList.add('error-message');
    error2.innerHTML = 'Это не число';
    error2.style.color = 'red';

    body = document.querySelector('body');
    body.appendChild(value1);
    body.appendChild(value2);
    body.appendChild(button);
  }

  window.addEventListener('load', initApp);
})();