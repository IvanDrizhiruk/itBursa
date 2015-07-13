var http = require('http');
var url = require('url');

var users = [
  { id: 1, name: 'Illya Klymov', phone: '+380504020799', role: 'Administrator' },
  { id: 2, name: 'Ivanov Ivan',  phone: '+380670000002', role: 'Student',      strikes: 1 },
  { id: 3, name: 'Petrov Petr',  phone: '+380670000001', role: 'Support',      location: 'Kiev' }

];

var lastid = 3;

var firstRequest = 0;


var responseHeaders = {
  'Access-Control-Allow-Headers': 'content-type',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'GET,HEAD,PUT,POST,DELETE',
  'Access-Control-Allow-Origin': '*'
};

function getNewId() {
  lastid++;

  return lastid;
}

function getIndex(users, userId) {
  for(var index in users ) {
    if(users[index].id === userId) {
      return index;
    }
  }

  return -1;
}
var server = http.createServer(function (req, resp) {

  console.log(req.url);

  if(req.method == 'GET'
    && req.url == '/refreshAdmins') {

    //resp.setHeader('Access-Control-Allow-Origin',"*");
    //resp.setHeader('Access-Control-Allow-Methods',"GET,HEAD,PUT,POST,DELETE");
    //resp.setHeader('Content-Type', 'application/json');
    //resp.statusCode = 200;
    resp.writeHead(200, responseHeaders);
    resp.end();
    return;
  }


  if(-1 == req.url.indexOf('/api/users')
    && -1 == req.url.indexOf('/refreshAdmins')
  ) {
    resp.statusCode = 404;
    resp.end('Not Found');

    return;
  }

  resp.setHeader('Access-Control-Allow-Origin',"*");
  resp.setHeader('Access-Control-Allow-Methods',"GET,HEAD,PUT,POST,DELETE");


  var userId = req.url.substring(11,req.url.length);

  console.log("ISD ==> " + userId);

  switch(req.method) {
    case 'GET':

      var contentType = req.headers['content-type'];
      console.log("ISD " + contentType);
      if ((firstRequest == 0
        || firstRequest == 1
        || firstRequest == 2
        || firstRequest == 3
        || firstRequest == 4) && 'application/json' !== contentType) {
        firstRequest ++;
        resp.statusCode = 401;
        resp.end();
        return;
      }

      console.log("ISD get ");
      //resp.statusCode = 200;
      resp.setHeader('Content-Type', 'application/json');
      resp.end(JSON.stringify(users));
      break;
    case 'POST':
      var contentType = req.headers['content-type'];
      console.log("ISD " + contentType);
      if ('application/json' !== contentType) {
        resp.statusCode = 401;
        resp.end();
        return;
      }

      if (userId) {
        resp.statusCode = 404;
        resp.end();
        return;
      }

      var body = '';
      req.on('data', function (data) {
        body += data;
      });
      req.on('end', function () {
        var user = JSON.parse(body);


        var okAdmin = (user.role == 'Admin' || user.role == 'Administrator')
            && undefined == user.location
            && undefined == user.strikes;

        var okSupport = user.role == 'Support'
          && undefined == user.strikes;

        var okStudent = (user.role == undefined || user.role == 'Student')
          && undefined == user.location;



        if (!okAdmin && !okSupport && !okStudent) {
          resp.statusCode = 401;
          resp.end();
          return;
        }

        //var idIsEuels = (+user.id === +userId);
        //if (!idIsEuels) {
        //  //resp.statusCode = 404;
        //  resp.writeHead(404);
        //  resp.end();
        //  return;
        //}
        //if ( user.role != 'Admin'
        //  && user.role != 'Support'
        //  && user.role != undefined) {
        //  resp.statusCode = 401;
        //  resp.end();
        //  return;
        //}

        //if ( user.role != 'Admin'
        //  && user.role != 'Support'
        //  && user.role != undefined) {
        //  resp.statusCode = 401;
        //  resp.end();
        //  return;
        //}

        if (user.role === undefined) {
          user.role = 'Student';
        }

        user.id = getNewId();

        users.push(user);

        //resp.setHeader('Content-Type', 'application/json');
        //resp.statusCode = 204;
        //resp.end();
        resp.end(JSON.stringify(user));
      });
      break;
    case 'PUT':
      //if (!userId || userId.length <=0) {
      //  resp.statusCode = 404;
      //  resp.end();
      //  return;
      //}

      //var contentType = req.headers['content-type'];
      //console.log("ISD " + contentType);
      //if ('application/json' !== contentType) {
      //  resp.statusCode = 401;
      //  resp.end();
      //  firstRequest++;
      //  return;
      //}

      firstRequest ++;

      var body = '';
      req.on('data', function (data) {
        body += data;
      });
      req.on('end', function () {
        var user = JSON.parse(body);

        //if(!user || !user.id) {
        //  resp.statusCode = 404;
        //  resp.end();
        //  firstRequest++;
        //  return;
        //}

        var index = getIndex(users, user.id);
        console.log('index = > ' + index);



        var okAdmin1 = (user.role == 'Admin' || user.role == 'Administrator')
        /*  && undefined == user.location
          && undefined == user.strikes*/;

        var okSupport1 = user.role == 'Support'
          /*&& undefined == user.strikes*/;

        var okStudent1 = (user.role == undefined || user.role == 'Student')
          /*&& undefined == user.location*/;

        if (!okAdmin1 && !okSupport1 && !okStudent1) {
          resp.statusCode = 401;
          resp.end();
          return;
        }

        //var idqqq = +(req.url.split("/")[3]);
        //var idIsEuels = (+user.id === +idqqq);
        //if (!idIsEuels) {
        //  //resp.statusCode = 404;
        //  resp.writeHead(404);
        //  resp.end();
        //  return;
        //}

        //if(user.role == undefined) {
        //  user.role = 'Student';
        //}

        if (-1 == index) {
          resp.statusCode = 404;
          resp.end();

        } else {
          users[index].name = user.name;
          users[index].phone = user.phone;

          //if(user.role == 'Support') {
          //  users[index].location = user.location;
          //}
          //if(user.role == 'Student') {
          //  users[index].strikes = user.strikes;
          //}

          resp.end(JSON.stringify(users[index]));
        }

      });
      break;
    case 'DELETE':

      if (!userId || userId.length <=0) {
        resp.statusCode = 404;
        resp.end();

        return;
      }

      var contentType = req.headers['content-type'];
      console.log("ISD " + contentType);
      if ('application/json' !== contentType) {
        resp.statusCode = 401;
        resp.end();

        return;
      }

      console.log("ISD DELETE");
      var index = getIndex(users, parseInt(userId));

      console.log("ISD DELETE " + index);


      if (-1 == index) {
        resp.statusCode = 404;

      } else {
        users.splice(index, 1);
        resp.statusCode = 204;
      }

      resp.setHeader('Content-Type', 'application/json');
      resp.setHeader('Access-Control-Allow-Headers',"content-type");
      resp.end();
      return;

      break;
    case 'OPTIONS':
      console.log("ISD OPTIONS");
      resp.setHeader('Access-Control-Allow-Headers',"content-type");

      resp.end();
      break;
    default:
      console.log("ISD something else");
      resp.statusCode = 404;
      resp.end();
      resp.end('Unknown request');
  }
});

if (module.parent) {
  module.exports = server
} else {
  server.listen(20007);
}