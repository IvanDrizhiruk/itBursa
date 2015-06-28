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
        box.append(generateStudentElement(student.id, student.name, student.phone));
      }
    }

    function generateStudentElement(id, name, phone) {
      var li = document.createElement('li');
      var nameH3 = document.createElement('h3');
      var phoneH4 = document.createElement('h4');

      $(li).data('data.id', id);
      nameH3.innerHTML = name;
      phoneH4.innerHTML = phone;

      li.appendChild(nameH3);
      li.appendChild(phoneH4);

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
      this.iteams = {
        active: [],
        redcard: [],
        removed: []
      };

      dispatcher.on('student.moved', this.move.bind(this));
    }

    StudentStorage.prototype.load = load;
    StudentStorage.prototype.move = move;

    function load() {
      var _this = this;
      Student.load(function (list, error) {
        console.log(list);
        if (error) {
          alert('Error');
          return;
        }

        console.log("ISD start + "  + list.length);
        var prevStudentStr = localStorage.getItem('students');
        var prevStudent = UTILS.safeJSONparse(prevStudentStr)

        if (prevStudent) {
          prevStudent.active.forEach(function (e) {
            console.log("ISD prevStudent.active");
            marge(e, list, _this);
          });
          prevStudent.redcard.forEach(function (e) {
            console.log("ISD prevStudent.redcard");
            marge(e, list, _this);
          });
          prevStudent.removed.forEach(function (e) {
            console.log("ISD prevStudent.removed");
            marge(e, list, _this);
          });
        }

        console.log("ISD list + "  + list.length);
        list.forEach(function (item) {
          //_this.iteams.push(new Student(item));
          _this.iteams[item.status].push(new Student(item));
          dispatcher.fire('student.add', item);
        });

      });
    };

    function marge(historyItem, list, _this) {

      var e = _.find(list, function (res) {
        return res.id === historyItem.id;
      });

      if (e && e.status !== historyItem.status) {
        console.log("ISD " + historyItem.status + ">>>" + e.status);
        return;
      }

      _.remove(list, function (res) {
        return res.id === historyItem.id;
      });

      if (e) {
        _this.iteams[e.status].push(new Student(e));
        dispatcher.fire('student.add', e);

      }
    }

    function saveToStorage(iteams) {
      console.log('----');
      console.log(iteams.redcard);
      localStorage.setItem('students', UTILS.safeJSONstringify(iteams));

    }

    function copyStudent(toObj, fromObj) {
      console.log(JSON.stringify({from: fromObj, to: toObj}));
      //$.extend(toObj, fromObj);
      //console.log({from: fromObj, to: toObj});

      toObj.id = fromObj.id;
      toObj.name = fromObj.name;
      toObj.phone = fromObj.phone;
    }

    function move(move) {
      var containerFrom = this.iteams[move.from.status];
      var containerTo = this.iteams[move.to.status];
      if (move.from.status === move.to.status) {

        var tmp = containerFrom.splice(move.from.index, 1);
        var x = move.from.index > move.to.index ? 0 : 1;
        containerTo.splice(move.to.index - x, 0, tmp[0]);


      } else  {

        var tmp = containerFrom.splice(move.from.index, 1);
        tmp[0].status = move.to.status;
        containerTo.splice(move.to.index, 0, tmp[0]);
      }

      saveToStorage(this.iteams);
    };

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
      start: function(event, ui) {
        ui.item.data('start_pos', {
          index: ui.item.index(),
          status: extractContainerType(ui.item)});
      },
      update: function(event, ui) {
        if (this !== ui.item.parent()[0]) {
          return;
        }

        var id = ui.item.data('data.id');
        var moveFrom = ui.item.data('start_pos');
        var moveTo = {index: ui.item.index(), status: extractContainerType(ui.item)};

        if(moveFrom.status === 'removed' && moveTo.status !== 'removed') {
          $(ui.sender).sortable('cancel');
          return;
        }

        if (moveFrom.status === moveTo.status) {
          $(ui.sender).sortable('cancel');
          dispatcher.fire('student.moved', {from: moveFrom, to: moveTo});
          return;
        }

        UTILS.sendPost(
          window.url + '/' + id,
          {status: moveTo.status}, function (data, isError) {
            if (isError) {
              $(ui.sender).sortable('cancel');
            } else {
              dispatcher.fire('student.moved', {from: moveFrom, to: moveTo});
            }
          });
      }
    });

    function extractContainerType(element) {
      var container = element.closest('div.col-md-4');

      if(container.hasClass('active')) {
        return 'active';
      } else if(container.hasClass('redcard')) {
        return 'redcard';
      } else if(container.hasClass('removed')) {
        return 'removed';
      } else {
        return undefined;
      }
    }


    studentStorage.load();
  }
//-------------------------------------------
})();