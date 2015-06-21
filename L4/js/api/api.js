(function () {
  'use strict';

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
    jQuery.ajax({
      url: window.crudURL + '/' + this.id,
      type: 'DELETE',
      dataType: 'json',
      success: function () {
        removeCallBack(undefined);
      }
    }).fail(function (error) {
      removeCallBack(error);
    });
  };


  function save(saveCallback) {

    var thisUser = this;

    console.log(this);
    if (this.id) {
      $.ajax({
        url: window.crudURL + '/' + this.id,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(thisUser),
        processData: false,
        success: function (responseObj) {
          saveCallback(undefined);

          if (thisUser.role == 'Admin') {
            $.ajax({
              url: window.crudURL + '/refreshAdmins',
              type: 'GET'
            });
          }
        }
      }).fail(function (error) {
        saveCallback(error)
      });
    } else {
      $.ajax({
        url: window.crudURL,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        processData: false,
        data: JSON.stringify(thisUser),
        success: function (responseObj) {

          $.extend(thisUser, responseObj);

          // for admin

          saveCallback(undefined);
        }
      }).fail(function (error) {
        saveCallback(error)
      });
    }
  };

  function safeJSONparse(line) {
    try {
      return JSON.parse(line);
    } catch (e) {
      return undefined;
    }
  }

  function load(loadCallback) {
    //var request = new XMLHttpRequest();
    //request.open('GET', window.crudURL);
    //request.setRequestHeader('Content-type', 'application/json');
    ////if (headers) {
    ////  for (index in headers) {
    ////    if (index) {
    ////      request.setRequestHeader(index, headers[index]);
    ////    }
    ////  }
    ////}
    //
    //request.addEventListener('readystatechange', function addEventListenerCb1() {
    //  var data;
    //  var res = [];
    //  if (request.readyState === request.DONE) {
    //    if (request.responseText) {
    //
    //      data = safeJSONparse(request.responseText);
    //      for (var i = 0; i < data.length; i++) {
    //        var currentData = data[i];
    //
    //        //if (window[currentData.role]) {
    //        console.log("ISD " + currentData.role);
    //        if (currentData.role === 'Administrator') {
    //          currentData.role = 'Admin';
    //        }
    //        var user = new window[currentData.role](currentData);
    //        res.push(user);
    //      }
    //      //}
    //    }
    //
    //    if (loadCallback) {
    //      loadCallback && loadCallback(request.status !== 200, res);
    //    }
    //  }
    //});
    //
    //request.send();


    $.ajax({
        url: window.crudURL,
        type: 'GET',
        contentType: 'application/json',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        success: function (data) {
          var res = [];
          for (var i = 0; i < data.length; i++) {
            var currentData = data[i];

            //if (window[currentData.role]) {
              console.log("ISD " + currentData.role);
              if (currentData.role === 'Administrator') {
                currentData.role = 'Admin';
              }
              var user = new window[currentData.role](currentData);
              res.push(user);
            }
          //}

          loadCallback && loadCallback(undefined, res);
        }
      }
    ).fail(function (error) {
        loadCallback && loadCallback(error, undefined)
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
    User.prototype.save.call(this, saveCallback);

    $.ajax({
      url: window.crudURL + '/refreshAdmins',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      processData: false
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