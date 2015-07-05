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

    //$scope.students2 = [
    //  {
    //    "id": "5",
    //    "name": "1",
    //    "phone": "(466) 514-6617",
    //    "status": "redcard"
    //  }
    //  ,
    //  {
    //    "id": "6",
    //    "name": "2t",
    //    "phone": "(314) 333-4959",
    //    "status": "removed"
    //  },
    //  {
    //    "id": "7",
    //    "name": "3",
    //    "phone": "(686) 869-6077",
    //    "status": "removed"
    //  }
    //  ,
    //  {
    //    "id": "8",
    //    "name": "4",
    //    "phone": "(328) 747-6780",
    //    "status": "removed"
    //  }];

  }])


// CODE FOR CHECKER (remove next comment)
//angular.module("jsbursa", [])

function resort(items, stored) {
  if (! stored) {
      return;
    }

  var res = [];

  stored.forEach(function (storedElm) {

    var elm = _.find(items, function (fElm) {
      return fElm.id === storedElm.id;
    });

    if (elm) {
      res.push(elm);

      _.remove(items, function (rElm) {
        return rElm.id === storedElm.id;
      });
    }
  });

  items.forEach(function (addElm) {
      res.push(addElm);
  });

  return res;
}

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

        if(!scope.items) {
          scope.items = [];
        }

        var elementId = attrs.id;

        var currentUl = element.find('ul');

        console.log("ISD elemtn " + elementId);
        console.log(currentUl);



        if (elementId) {
          var saved = localStorage.getItem(elementId);
          if (saved) {
            console.log("ISD " + saved);
            scope.items = resort(scope.items, JSON.parse(saved));
          }
        }


        currentUl.sortable(
          {
            connectWith: "ul",

            start: function(event, ui) {

              var res = scope.items.splice(ui.item.index(), 1);

              console.log("ISD id " + elementId);
              console.log(scope.items);
              console.log(res);

              ui.item.data('data.item', {
                index: ui.item.index(),
                data: res[0]
              });

              if (elementId) {
                localStorage.setItem(elementId, JSON.stringify(scope.items));
              }
            },
            update: function(event, ui) {
              console.log("ISD update");
              if (this !== ui.item.parent()[0]) {
                return;
              }

              var moveFrom = ui.item.data('data.item');
              var moveTo = {index: ui.item.index()/*, status: extractContainerType(ui.item)*/};


              var tmp = moveFrom.data;
              scope.items.splice(moveTo.index, 0, tmp);

              console.log("ISD end id " + elementId);
              console.log(scope.items);
              console.log(ui.item.index());


              scope.items = angular.copy(scope.items);
              scope.$applyAsync();

              if (elementId) {
                localStorage.setItem(elementId, JSON.stringify(scope.items));
              }
            }
          }
        );
      }
    };
  });