var express = require("express");
var app = express();
var bodyParser = require('body-parser')
var mustacheExpress = require("mustache-express")

var server = app.listen(3000, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

var roomList = {};

app.engine('html', mustacheExpress());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.set('view engine', 'html');
app.set('views', '.')
app.use(express.static(__dirname + "/build/"));



app.get("/", function(req, res, next){
  res.render("index.html");
});

app.get("/test", function(req, res, next){
  res.render("testhtml.html");
});

app.post("/connect", function(req, res){
  console.log(req.body);

  if(roomList[req.body.room] === undefined){
    roomList[req.body.room] = {'host':"", 'guest':""};
    res.send({'exist': 0});
  }
  else {
    res.send({'exist': 1});
  }
});

app.post("/send", function(req, res){
  console.log(req.body.host);

  if(req.body.host == "true"){
    console.log("set host");
    roomList[req.body.room]['host'] = req.body.sdp;
    res.send("ok");
  }
  else{
    console.log("set guest");
    roomList[req.body.room]['guest'] = req.body.sdp;
    res.send("ok");
  }
});

app.post("/receive", function(req,res){
  //setTimeout(function(){res.send("test");}, 5000);

  if(req.body.host == "false"){
    console.log("guest come");
    if(roomList[req.body.room]['host'] == ""){
      res.send("fail");
    }
    else {
      res.send(roomList[req.body.room]['host']);
    }
  }
  else{
    console.log("host come");
    if(roomList[req.body.room]['guest'] == ""){
      res.send("fail");
    }
    else {
      res.send(roomList[req.body.room]['guest']);
    }

  }

});
