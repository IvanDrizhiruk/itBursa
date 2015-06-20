(function () {
  'use strict';


  // User
  function User() {
    console.log("ISD User");
  };

  User.prototype.getStrikesCount = function getStrikesCount() {
    return this.strikes;
  }

  User.prototype.save = function save(saveCallback) {
    var user = {};

    $.extend(user, this);

    $.ajax({
      url: window.crudURL,
      data: JSON.stringify(user),
      success: function () {
        saveCallback(undefined);
      },
      dataType: 'json',
      type: 'PUT'
    }).fail(function (error) {
      saveCallback(error)
    });

  }

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

  // Sudent
  function Student() {
    console.log("ISD Student");
  };

  Student.prototype = Object.create(User.prototype);

  // Support
  function Support() {
    console.log("ISD Support");
  }

  Support.prototype = Object.create(User.prototype);


  //-------------------------------------------

  window.User = User;
  window.Student = Student;
  window.Support = Support;
})();