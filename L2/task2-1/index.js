(function init() {
  'use strict';

  var TASK_KEY = 'tasks';

  var tasks = [];
  var tasksArea;
  var taskInput;

  function rewriteTascks() {
    var li;
    tasksArea.innerHTML = '';

    tasks.forEach(function addTaskFromHistory(task) {
      li = document.createElement('li');
      li.innerHTML = task;
      tasksArea.appendChild(li);
    });
  }

  function doAddTask(newTaskText) {
    if (!newTaskText) {
      return;
    }

    tasks.push(newTaskText);
    tasks.sort();

    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    rewriteTascks();
  }

  function doAddTaskFromInput() {
    var newTaskText = taskInput.value;
    taskInput.value = '';

    doAddTask(newTaskText);
  }

  function loadHistory() {
    var tascksFromHistory = localStorage.getItem(TASK_KEY);

    if (tascksFromHistory) {
      tasks = JSON.parse(tascksFromHistory);
      tasks.sort();

      rewriteTascks();
    }
  }

  function onKeypressEnter(e) {
    if ((e.which || e.keyCode) === 13) {
      doAddTaskFromInput();
    }
  }

  function initialiseApp() {
    tasksArea = document.querySelector('ul');
    taskInput = document.querySelector('input');

    document.querySelector('button').addEventListener('click', doAddTaskFromInput);
    document.querySelector('input').addEventListener('keypress', onKeypressEnter);

    loadHistory();
  }

  window.addEventListener('load', initialiseApp);
})();