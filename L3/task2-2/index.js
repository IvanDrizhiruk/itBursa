(function init() {
  'use strict';

  var value1;
  var value2;
  var error1;
  var error2;
  var button;

  function validateAndShowError(value1, error) {
    var value = value1.value;

    var isValid = value && !isNaN(value);
    if (!isValid) {
      error.style.display = 'block';
    }
    return isValid;
  }

  function appendResult(res) {

    var result =  document.createElement('div');
    result.id = 'result';
    result.innerHTML = res;
    document.querySelector('body').appendChild(result);
  }

  function prepareForCalculation() {
    error1.style.display = 'none';
    error2.style.display = 'none';

    var result = document.querySelector('#result');
    if (result) {
      document.querySelector('body').removeChild(result);
    }
  }

  function onButtonClick() {
    prepareForCalculation();
    var v1 = validateAndShowError(value1, error1);
    var v2 = validateAndShowError(value2, error2);

    if (v1 && v2) {
      var result = parseFloat(value1.value) + parseFloat(value2.value);

      appendResult(result);
    }
  }

  //function appendBr(body) {
  //  body.appendChild(document.createElement('br'));
  //}
  function initApp() {
    value1 = document.createElement('input');
    value2 = document.createElement('input');
    error1 = document.createElement('div');
    error2 = document.createElement('div');
    button = document.createElement('button');

    button.innerHTML = 'Посчитать';
    button.addEventListener('click', onButtonClick);
    error1.classList.add('error-message');
    error1.innerHTML = 'Это не число';
    //error1.style.display = 'none';
    //error1.style.color = 'red';

    error2.classList.add('error-message');
    error2.innerHTML = 'Это не число';
    //error2.style.display = 'none';
    //error2.style.color = 'red';

    var body =  document.querySelector('body');
    body.appendChild(value1);
    body.appendChild(error1);
    //appendBr(body);
    body.appendChild(value2);
    body.appendChild(error2);
    //appendBr(body);
    body.appendChild(button)
    //appendBr(body);
  }

  window.addEventListener('load', initApp);

})();