angular.module("jsbursa", [])

angular.module("jsbursa")
  .controller('studentlist', ['$scope', function($scope) {
    $scope.students = [
      {
        "id": "1",
        "name": "Jeremy Lane",
        "phone": "(466) 514-6617",
        "status": "redcard"
      }
      ,
      {
        "id": "2",
        "name": "Austin Hunt",
        "phone": "(314) 333-4959",
        "status": "removed"
      },
      {
        "id": "3",
        "name": "Ronald Campbell",
        "phone": "(686) 869-6077",
        "status": "removed"
      }
      ,
      {
        "id": "4",
        "name": "Don Stewart",
        "phone": "(328) 747-6780",
        "status": "removed"
      }];
  }])

angular.module("jsbursa")
  .directive('draggableList', function() {
    return {
      scope: {
        items : "="
      },
      template: '<ul>' +
                  '<li ng-repeat="item in items">' +
                    '<h3>{{item.name}}</h3>' +
                    '<h4>{{item.phone}}</h4>' +
                  '</li>' +
                '</ul>',
      link: function (scope, element, attrs) {

        element.find('ul').sortable({});
      }
    };
  });