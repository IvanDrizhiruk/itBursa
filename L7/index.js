var http = require('http');
var url = require('url');

var users = [
  { id: '1', name: 'Illya Klymov', phone: '+380504020799', role: 'Administrator' },
  { id: '2', name: 'Ivanov Ivan',  phone: '+380670000002', role: 'Student',      strikes: 1 },
  { id: '3', name: 'Petrov Petr',  phone: '+380670000001', role: 'Support',      location: 'Kiev' }

];

var lastid = 3;

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

  if(-1 == req.url.indexOf('/api/users')) {
    resp.statusCode = 404;
    resp.end();

    return;
  }

  //if (req.method !== 'OPTIONS') {
  //  var contentType = req.headers['content-type'];
  //  console.log("ISD " + contentType);
  //  if ('application/json' !== contentType) {
  //    resp.statusCode = 401;
  //    resp.end();
  //    return;
  //  }
  //}

  resp.setHeader('Access-Control-Allow-Origin',"*");
  resp.setHeader('Access-Control-Allow-Methods',"GET,HEAD,PUT,POST,DELETE");


  var userId = req.url.substring(11,req.url.length);

  console.log("ISD ==> " + userId);

  switch(req.method) {
    case 'GET':
      var contentType = req.headers['content-type'];
      console.log("ISD " + contentType);
      if ('application/json' !== contentType) {
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
      var body = '';
      req.on('data', function (data) {
        body += data;
      });
      req.on('end', function () {
        var user = JSON.parse(body);

        user.id = getNewId();

        users.push(user);

        resp.end(JSON.stringify(user));
      });
      break;
    case 'PUT':
      var body = '';
      req.on('data', function (data) {
        body += data;
      });
      req.on('end', function () {
        var user = JSON.parse(body);
        var index = getIndex(users, user.id);
        console.log('index = > ' + index);
        users[index].name = user.name;
        users[index].phone = user.phone;

        resp.end(JSON.stringify(users[index]));
      });
      break;
    case 'DELETE':
      console.log("ISD DELETE");
      var index = getIndex(users, userId);
      users.splice(index, 1);


      console.log(users);

      resp.end();

      break;
    case 'OPTIONS':
      console.log("ISD OPTIONS");
      resp.setHeader('Access-Control-Allow-Headers',"content-type");

      resp.end();
      break;
    default:
      console.log("ISD something else");

      resp.end('Unknown request');
  }
});

if (module.parent) {
  module.exports = server
} else {
  server.listen(20007);
}