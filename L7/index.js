var http = require('http');
var url = require('url');

var server = http.createServer(function (req, resp) {

  //console.log( url.parse(req.url));

  if(-1 == req.url.indexOf('/api/users')) {
    resp.end('incorrect path');
    return;
  }


  //if ('application/json' !== req.get('Content-Type')) {
  //  //resp.statusCode = 404;
  //  response.writeHead(404);
  //  resp.end();
  //  return;
  //}


  switch(req.method) {
    case 'GET':
      console.log("ISD get ");
      break;
    case 'POST':
      console.log("ISD get ");
      break;
    default:
      console.log("ISD something else");
  }

  resp.setHeader('content-type', 'application/json');
  resp.end(JSON.stringify({text: 'Test response string'}));
});

server.listen(20007);