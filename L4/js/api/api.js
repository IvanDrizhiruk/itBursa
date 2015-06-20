(function () {
  'use strict';


  // User
  function User() {
    console.log("ISD User");
  };

  User.prototype.getStrikesCount = function getStrikesCount() {
    return this.strikes;
  };


  User.prototype.remove = function remove(removeCallBack) {
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



  User.prototype.save = function save(saveCallback) {

    var thisUser = this;

    console.log(this);
    if(this.id) {
      $.ajax({
        url: window.crudURL + '/' + this.id,
        type: 'PUT',
        dataType: 'json',
        data: JSON.stringify(thisUser),
        processData: false,
        success: function (responseObj) {
          saveCallback(undefined);

          if(thisUser.role == 'Admin') {
            $.ajax({
              url: window.crudURL + '/refreshAdmins',
              type: 'GET'});
          }
        }
      }).fail(function (error) {
        saveCallback(error)
      });
    } else {
      $.ajax({
        url: window.crudURL,
        type: 'POST',
        dataType: 'json',
        processData: false,
        data: JSON.stringify(thisUser),
        success: function (responseObj) {

          $.extend(thisUser, responseObj);

          if(thisUser.role == 'Admin') {
            $.ajax({
              url: window.crudURL + '/refreshAdmins',
              type: 'GET'});
          }

          saveCallback(undefined);
        }
      }).fail(function (error) {
        saveCallback(error)
      });
    }
  };

  User.load = function (loadCallback) {
    $.get(window.crudURL, function (data) {

      var res = [];
      for (var i = 0; i < data.length; i++) {
        var newStudent = new Student()
        $.extend(newStudent, data[i]);
        res.push(newStudent);
      }

      loadCallback(undefined, res)
    }).fail(function (error) {
      onSuccessLoading(error, undefined)
    });
  };

  // Student
  function Student(data) {
    console.log("ISD Student");
    $.extend(this, data);
  };

  Student.prototype = Object.create(User.prototype);

  // Support
  function Support(data) {
    console.log("ISD Support");
    $.extend(this, data);
  }

  Support.prototype = Object.create(User.prototype);
  // Admin
  function Admin(data) {
    console.log("ISD Admin");
    $.extend(this, data);
  }

  Admin.prototype = Object.create(User.prototype);
  //-------------------------------------------

  window.User = User;
  window.Student = Student;
  window.Support = Support;
  window.Admin = Admin;
})();