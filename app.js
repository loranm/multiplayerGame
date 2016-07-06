var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var game = require('./routes/game_router');
var test = require('./routes/test');
var chat = require('./routes/chat');

var db = require('./bin/db.js')



var app = express();
app.io = require('socket.io')();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/game', game)
app.use('/test', test)
app.use('/chat', chat)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/******************************************************************************
CONNEXION A MONGO
******************************************************************************/
db.connect('mongodb://localhost:27017/game', function(err){
  if(err){
    console.log('connexion à la base de données impossible');
  }else{
    console.log('connexion à mongodb effectuée')
  }
});




/*******************************************************************************
GESTION du WEBSOCKET
******************************************************************************/
app.io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('welcome', {message:'bienvenue'});

    socket.on('new message', function(msg){
      console.log("new mess = " + msg);
      app.io.emit('chat message', msg)
    });


    socket.on('new player', function(user){
      console.log(user)
      var collection =  db.get().collection('players');
      collection.find({'user':user}).toArray(function(err,data){
        if(err){
          console.log('impossible de trouver : ' + data);
        }else{
          if(data.length > 0){
            socket.emit('ok_player', {user: data[0].user, score: data[0].bestScore})
          }else{
            collection.insert({'user':user,'mail':'tbd','pwd':'tbd','bestScore':0},function(err, result){
              if(err){
                console.log('impossible de créer user');
              }else{
                collection.find({'user':user}).toArray(function(err,data){
                  console.log('new user : ' + data[0].user);
                });
              };
            });
          };
        };
      });
    });
  });



module.exports = app;
