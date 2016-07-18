var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var chalk = require('chalk');
var bcrypt = require('bcrypt');

var routes = require('./routes/index');
// var users = require('./routes/users');
var game = require('./routes/game_router');
// var test = require('./routes/test');
// var chat = require('./routes/chat');
var db = require('./bin/db.js');
var shuffle = require('./bin/shuffle_module.js');
var salt = require('./bin/salt.js')


var app = express();
app.io = require('socket.io')();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
// app.use('/users', users);
app.use('/game', game)
// app.use('/test', test)
// app.use('/chat', chat)

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
VARIABLES LIEES AU JEU
*******************************************************************************/
var players = {};
var player = function(options) {
  this.user = options.user;
  this.mail = options.mail;
  this.score = 0;
  this.bestScore = options.bestScore;
  this.askedCountries = [];
  this.guessedCountries = [];
  this.countryToGuess = '';
};
/*******************************************************************************
GESTION du WEBSOCKET
******************************************************************************/
app.io.on('connection', function(socket) { //connexion initiale au websocket


//Recherche du pseudo dans la base et connection au jeu si non trouvé
    socket.on('new player', function(user) {
      if(user != ''){
        var top5 = [];
        var collection = db.get().collection('players');
        collection.find({},{user:1,bestScore:1,_id:0}).sort({bestScore:-1}).limit(5).toArray(function(err, data){
          socket.emit('leaderBoard data', data)
        });
        collection.find({
          'user': user
        }).toArray(function(err, data) {
          if (err) {
            throw err;
          } else {
            if (data.length > 0) {
              socket.emit('ask pwd',{user: data[0].user})
            }else{
              players[socket.id] = new player({
                user: user,
                bestScore: 0
              })
              var newPlayer = players[socket.id];
              socket.broadcast.emit('addNewPlayerToBoard', {
                newPlayer
              });
              socket.emit('createMyNewScoreBoard', {
                players
              });
            };
          };
        });
      }else{
        console.log('il faut indiquer un pseudo')
      }
    });

/*************************************************************************
GESTION DE LA CONNEXION AU JEU POUR UN USER EXISTANT
*******************************************************************************/
    socket.on('check my ids', function(data){
      var pwd = data.pwd;
      db.connect('mongodb://locahost:27017/game', function(err){
        if (err) {
          console.log('Impossible de se connecter à la base de données.');
          process.exit(1);
        }else{
          db.connect('mongodb://localhost:27017/game', function(err){
            if(err){
              console.log(err)
            }else{
              var collection = db.get().collection('players');
              collection.find({'user':data.username}).toArray(function(err,data){
                var foundPlayer = {user: data[0].user, mail: data[0].mail, bestScore: data[0].bestScore};
                var hash = data[0].pwd;
                if(err){
                }else{
                  bcrypt.compare(pwd, hash, function(err, res){
                    if(err){
                      console.log(err);
                    }else {
                      if(res){
                        players[socket.id] = new player(foundPlayer)
                        var newPlayer = players[socket.id];
                        socket.broadcast.emit('addNewPlayerToBoard', {
                            newPlayer
                        });
                        socket.emit('createMyNewScoreBoard', {
                            players
                        });
                      }else{
                        socket.emit('no credential')

                      };
                    };
                  });
                };
              });
            };
          });
        };
      });
    });

/******************************************************************************
MECANIQUE DU JEU
*******************************************************************************/

    socket.on('Send me a new flag', function(){

      db.connect('mongodb://localhost:27017/game', function(err) {
        if (err) {
          console.log('Impossible de se connecter à la base de données.');
          process.exit(1);
        } else {
          for (var i in players) {
            if (i === socket.id) {
              var doNotSendTheseCountries = [];
              var totalCountries =  players[i].askedCountries.length + players[i].guessedCountries.length;
              if(totalCountries >= 47){
                players[i].askedCountries = [];
              };
              doNotSendTheseCountries.push.apply(doNotSendTheseCountries, players[i].askedCountries);
              doNotSendTheseCountries.push.apply(doNotSendTheseCountries, players[i].guessedCountries);
              var collection = db.get().collection('countries')
              collection.find({'country': {$nin: doNotSendTheseCountries}}).toArray(function(err, data) {
                if (err) {
                  console.log(err)
                } else {
                  var max = (data.length); ///TAILLE DE LA BASE DE DONNEES
                  var sendFlagNb = randInt(0, max);
                  players[socket.id].countryToGuess = data[sendFlagNb].country;
                  var flagToSend = players[socket.id].countryToGuess
                  var capital = data[sendFlagNb].capital;
                  var letters = shuffle.usingShuffle(shuffle.shuffleArray, capital);

                  socket.emit('newFlag', {message:'new Flag', country:flagToSend, flag:data[sendFlagNb].flag, capitalsize:data[sendFlagNb].capital.length, capital:data[sendFlagNb].capital, letters: letters, time:180})
                };
              });
            };
          };
        };
      });
    });

    socket.on('check if i win', function(data){
      var answer = data.answer;
      var countryToGuess = players[socket.id].countryToGuess;
      db.connect('mongodb://localhost:27017/game', function(err){
        if(err){
          console.log('Impossible de se connecter à la base de données.');
          process.exit(1);
        }else{
          var collection = db.get().collection('countries');
          collection.find({'country':countryToGuess,'capital':answer}).toArray(function(err, data){
            if (err){
              console.log(err)
            }else{
              if (data.length){
                players[socket.id].guessedCountries.push(players[socket.id].countryToGuess);
                players[socket.id].countryToGuess = [];
                players[socket.id].score += Math.ceil(1/48);
                app.io.emit('update score', {user: players[socket.id].user,score: players[socket.id].score});
                socket.emit('next round',{user: players[socket.id].user, score : players[socket.id].score});
              }else{
                players[socket.id].askedCountries.push(players[socket.id].countryToGuess);
                players[socket.id.countryToGuess] = [];
                socket.emit('next round',{user: players[socket.id].user, score : players[socket.id].score});
              };
            };
          });
        };
      });
    });


    socket.on('i pass', function(err,data){
        players[socket.id].askedCountries.push(players[socket.id].countryToGuess);
        players[socket.id].countryToGuess = [];
        socket.emit('next round',{user: players[socket.id].user, score : players[socket.id].score});
    });

/******************************************************************************
FIN DU JEU
******************************************************************************/

    socket.on('end game', function(data){
      var user = players[socket.id].user
      var collection = db.get().collection('players');
      var score = players[socket.id].score
      var rank = 0;
      collection.find({bestScore:{$gt:score}},{'_id':0,'bestScore':1}).toArray(function(err,data){
        if(err){
          console.log(err)
        }else{
          rank = data.length+1;
          return rank;
        };
      });

      collection.find({'user': user}).toArray(function(err, data){
        if(data.length > 0){
          if (players[socket.id].score > players[socket.id].bestScore){
            collection.update({'user': user},{$set: {'bestScore':players[socket.id].score}})
          }
          socket.emit('show results', {user: user, score: players[socket.id].score, rank: rank});
        }else{
          socket.emit('please register', {user: players[socket.id].user, score: players[socket.id].score, rank:rank})
        };
      });
    });

    socket.on('startAgain', function(){
      players[socket.id].score = 0;
      players[socket.id].guessedCountries = [];
      players[socket.id].askedCountries = [];
      app.io.emit('update score', {user: players[socket.id].user,score: players[socket.id].score});
      socket.emit('next round', {user:  players[socket.id].user, score: players[socket.id].score})
    });


/******************************************************************************
CREATION D'UN COMPTE DANS LA BASE
******************************************************************************/
    socket.on('register my account', function(data){
      console.log('register =' + data )
      var errors = {containErrors: false}
      if (checkEmail(data.mail)){

      }else{
        errors.containErrors = true;
        errors.mail = 'adresse e-mail non valide';
      };

      if(data.passInitial === ''){
        errors.containErrors = true;
        errors.pass_initial = 'il faut indiquer un mot de passe';
      }else if(data.passInitial != data.pass_check){
        errors.containErrors = true;
        errors.pass_check = 'Les mots de passe ne correpondent pas';
      }else{
        //chiffrage des mots de passe.
      }

      if(errors.containErrors == true){
        socket.emit('form invalid', {errors : errors});
        errors = {};
      }else{
        var newMongoPlayer = {'user':data.user, 'mail': data.mail, 'pwd':data.passInitial, 'bestScore': players[socket.id].score};
        salt.addNewMongoPlayer(newMongoPlayer);
        socket.emit('show results', {message: 'utilisateur enregistré'});
      };

    });

    var checkEmail = function(address){
      var regMail = /^(([a-zA-Z]|[0-9])|([-]|[_]|[.]))+[@](([a-zA-Z0-9])|([-])){2,63}[.](([a-zA-Z0-9]){2,63})+$/gi
      return regMail.test(address);
    };

/*****************************************************************************
    GESTION DE LA DECONNEXION DU JOUEUR
*****************************************************************************/
    socket.on('disconnect', function(data) {
        socket.broadcast.emit('leftTheGame', {
            message: 'parti',
            user: players[socket.id]
        });
        delete players[socket.id];
    })

});


/******************************************************************************
TIRAGE AU SORT PAYS
*****************************************************************************/
var randInt = function(min, max) {
    return Math.floor(Math.random() * max) + min
};


var dbSize = function(){
  db.connect('mongodb://localhost:27017/game', function(err){
    if (err){
      throw err
    }else {
      var collection = db.get().collection('countries');
      collection.count(function(err,data){
        if(err){
          throw err
        }else{
          return data;
        }
      })
    }
  });
}

var rankingCalculation = function(score){
  db.connect('mongodb://localhost:27017/game', function(err){
    if(err){
      console.log(err)
    }else{
      var collection = db.get().collection('players');
      collection.find({},{'_id':0,'bestScore':1}).sort({bestScore: -1}).toArray(function(err,data){
        if(err){
          console.log(err)
        }else{
          var scores = []
          for (var i in data){
            scores.push(data[i].bestScore);
          };
          return scores.indexOf(score)+1;
        };
      });
    };
  });
};


module.exports = app;
