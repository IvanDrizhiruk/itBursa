(function () {
  'use strict';

  (function () {
    var UTILS = {
      send: function (address, type, data, callback) {
        var request = new XMLHttpRequest();
        request.open(type, address);
        request.setRequestHeader('Content-type', 'application/json');
        request.addEventListener('readystatechange', function addEventListenerCb1() {
          var data;
          if (request.readyState === request.DONE) {
            if (request.responseText) {
              data = UTILS.safeJSONparse(request.responseText);
            }

            if (callback) {
              var isError = request.status !== 200 && request.status !== 204;
              callback(data, isError);
            }
          }
        });

        if (data) {
          request.send(UTILS.safeJSONstringify(data));
        } else {
          request.send();
        }
      },

      sendGet: function (address, callback) {
        UTILS.send(address, 'GET', undefined, callback);
      },

      sendPut: function (address, data, callback) {
        UTILS.send(address, 'PUT', data, callback);
      },

      sendPost: function (address, data, callback) {
        UTILS.send(address, 'POST', data, callback);
      },

      sendDelete: function (address, callback) {
        UTILS.send(address, 'DELETE', undefined, callback);
      },

      safeJSONparse: function safeJSONparse(line) {
        try {
          return JSON.parse(line);
        } catch (e) {
          return undefined;
        }
      },

      safeJSONstringify: function safeJSONstringify(line) {
        try {
          return JSON.stringify(line);
        } catch (e) {
          return undefined;
        }
      }
    };

    window.UTILS = UTILS;
  })();


  (function () {
    //-------------------------------------------
    // Dispatcher
    //-------------------------------------------
    var Dispatcher = new function () {
      var listeners = [];
      var instance;

      function Dispatcher() {
        if (!instance) {
          instance = this;
        } else {
          return instance;
        }

        Dispatcher.prototype.on = function addHandler(eventName, fn) {
          if (!listeners[eventName]) {
            listeners[eventName] = [];
          }
          listeners[eventName].push(fn);
        };

        Dispatcher.prototype.fire = function fireHandlers(eventName, data) {
          if (listeners[eventName]) {
            listeners[eventName].forEach(function (handler) {
              handler(data);
            });
          }
        };
      }

      return Dispatcher;
    };


    //-------------------------------------------
    window.Dispatcher = Dispatcher;
  })();

//-------------------------------------------
// Student
//-------------------------------------------
  function Student(data) {
    if (data) {
      $.extend(this, data);
    }
  }

//Student.prototype.remove = remove;
//Student.prototype.save = save;
  Student.load = load;

  function load(callback) {
    UTILS.sendGet(window.url, callback);
  }

  (function () {
    //-------------------------------------------
    // Students list
    //-------------------------------------------

    var elements;

    function StudentList(dispatcher, elementActive, elementRedcard, elementRemoved) {
      elements = {
        active: elementActive,
        redcard: elementRedcard,
        removed: elementRemoved
      };

      dispatcher.on('student.add', this.showStudent.bind(this));
    }

    StudentList.prototype.showStudent = showStudent;


    function showStudent(student) {
      if (!student) {
        return;
      }
      var box = elements[student.status];
      if (box) {
        box.append(generateStudentElement(student.name, student.telephone));
      }
    }

    function generateStudentElement(name, telephone) {
      var li = document.createElement('li');
      var nameH3 = document.createElement('h3');
      var telephoneH4 = document.createElement('h4');

      nameH3.innerHTML = name;
      telephoneH4.innerHTML = telephone;

      li.appendChild(nameH3);
      li.appendChild(telephoneH4);

      return li;
    }


    window.StudentList = StudentList;
  })();

  (function () {
    //-------------------------------------------
    // Student Storage
    //-------------------------------------------
    var dispatcher;

    function StudentStorage(dispatcherObj) {
      dispatcher = dispatcherObj;
      this.items = [];
    }

    StudentStorage.prototype.load = load;

    function load() {
      var _this = this;
      Student.load(function (list, error) {
        console.log(list);
        if (error) {
          alert('Error');
          return;
        }
        list.forEach(function (item) {
          _this.items.push(new Student(item));
          dispatcher.fire('student.add', item);
        });
      });
    }

    //-------------------------------------------
    window.StudentStorage = StudentStorage;
  })();


//-------------------------------------------
// Init app
//-------------------------------------------
  window.addEventListener('load', initApp);

  function initApp() {
    var dispatcher = new Dispatcher();
    var studentStorage = new StudentStorage(dispatcher);

    new StudentList(dispatcher,
      $('.row .active ul'),
      $('.row .redcard ul'),
      $('.row .removed ul'));


    $( '.row .active ul, .row .redcard ul, .row .removed ul' ).sortable({
      connectWith: ".row .active ul, .row .redcard ul, .row .removed ul",
      dropOnEmpty: false
    }).disableSelection();


    studentStorage.load();
  }
//-------------------------------------------
})();