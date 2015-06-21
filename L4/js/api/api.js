(function () {
  'use strict';

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

          var isError = request.status !== 200 && request.status !== 204;
          callback && callback(isError, data);
        }
      });

      if(data) {
        request.send(UTILS.safeJSONparse(data));
      }else {
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
    }
  }

  //-------------------------------------------
  // User
  //-------------------------------------------
  function User(data) {
    console.log("ISD User");
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.phone = data.phone;
    }
  };

  User.prototype.remove = remove;
  User.prototype.save = save;
  User.load = load;


  function remove(removeCallBack) {
    UTILS.sendDelete(window.crudURL + '/' + this.id, function (error) {
      removeCallBack(error);
    });
  };


  function save(saveCallback) {
    var thisUser = this;

    console.log(this);
    if (this.id) {
      UTILS.sendPut(window.crudURL + '/' + this.id,
        thisUser,
        function (error, data) {
          saveCallback(error);
        });
    } else {

      UTILS.sendPost(window.crudURL,
        thisUser,
        function (error, data) {
          if (!error) {
            thisUser.id = data.id;
          }
          saveCallback(error);
        });
    }
  };

  function toUserObjects(data) {
    var res = [];
    if (!data) {
      return res;
    }
    for (var i = 0; i < data.length; i++) {
      var currentData = data[i];

      if (currentData.role === 'Administrator') {
        currentData.role = 'Admin';
      }
      var user = new window[currentData.role](currentData);
      res.push(user);
    }

    return res;
  }

  function load(loadCallback) {
    UTILS.sendGet(window.crudURL, function (error, data) {
      if (loadCallback) {
        loadCallback(error, toUserObjects(data));
      }
    });
  };

//-------------------------------------------
// Student
//-------------------------------------------
  function Student(data) {
    console.log("ISD Student");

    User.call(this, data);

    if (data) {
      this.strikes = data.strikes;
    }
  };

  Student.prototype = Object.create(User.prototype);
  Student.prototype.getStrikesCount = getStrikesCount;

  function getStrikesCount() {
    return this.strikes;
  };

//-------------------------------------------
// Support
//-------------------------------------------
  function Support(data) {
    console.log("ISD Support");

    User.call(this, data);

    if (data) {
      this.location = data.location;
      this.role = data.role;
    }
  }

  Support.prototype = Object.create(User.prototype);

//-------------------------------------------
// Admin
//-------------------------------------------
  function Admin(data) {
    console.log("ISD Admin");
    //$.extend(this, data);

    User.call(this, data);

    if (data) {
      this.role = data.role;
    }
  }

  Admin.prototype = Object.create(User.prototype);
  Admin.prototype.save = function adminSave(saveCallback) {
    var user = this;
    User.prototype.save.call(this, function (error) {

      saveCallback(error);

      var arr = window.crudURL.split("/");
      var address = arr[0] + "//" + arr[2] + '/refreshAdmins';
      //var address = window.crudURL + '/refreshAdmins';

      //var parser = document.createElement('a');
      //parser.href = window.crudURL;
      //var address = parser.protocol + '//' + parser.host + '/refreshAdmins';

      UTILS.sendGet(address, user);
      //$.ajax({
      //  url: arr[0] + "//" + arr[2] + '/refreshAdmins',
      //  type: 'GET',
      //  contentType: 'application/json',
      //  dataType: 'json',
      //  processData: false
      //});
    });
  };
//-------------------------------------------
//-------------------------------------------
//-------------------------------------------
  window.User = User;
  window.Student = Student;
  window.Support = Support;
  window.Admin = Admin;
})
();