var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var chalk = require('chalk');
var bcrypt = require('bcrypt');

var routes = require('./routes/index');
var game = require('./routes/game_router');
var db = require('./bin/db.js');
var shuffle = require('./bin/shuffle_module.js');
var salt = require('./bin/salt.js')


var app = express();
app.io = require('socket.io')();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
    var errorsUsername = {containErrors : false};
    var user = user.trim();
    if(user.length > 0 && user.length < 15 ){
      if (checkUserName(user)){
        var collection = db.get().collection('players');
        collection.find({
          'user': user.trim()
        }).toArray(function(err, data) {
          if (err) {
            throw err;
          } else {
            if (data.length > 0) {
              socket.emit('ask pwd',{user: data[0].user})
            }else{
              players[socket.id] = new player({
                user: user.trim(),
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
        errorsUsername.containErrors = true;
        errorsUsername.badFormatText = 'Your username must contain only letters and numbers';
      }
    }else{
      errorsUsername.containErrors = true;
      errorsUsername.sizeText = 'Your username must contain at least one letter and a maximum of 15 characters';
    }

    if(errorsUsername.containErrors){
      socket.emit('invalid username', {errorsUsername : errorsUsername});
    };
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

//interroge Mongo en prenant en compte les pays déja passé et répondus pour éviter de renvoyer 2 fois le même drapeaux.
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
            var collection = db.get().collection('countries');
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
                var collection = db.get().collection('players');
                collection.find({bestScore: {$ne:0}},{user:1,bestScore:1,_id:0}).sort({bestScore:-1}).limit(5).toArray(function(err, data){
                  app.io.emit('update leaderBoard data',data);
                });
              };
            });
          };
        };
      };
    });
  });

//Vérifie dans mongo si on retrouve la capital et le pays ensemble, si oui c'est une bonne réponse, sinon c'est faux.
  socket.on('check if i win', function(data){
    var answer = data.answer;
    var countryToGuess = players[socket.id].countryToGuess;
    db.connect('mongodb://localhost:27017/game', function(err){
      if(err){
        console.log(err);
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
              if(players[socket.id].score > players[socket.id].bestScore){
                players[socket.id].bestScore = players[socket.id].score;
              };
              app.io.emit('update score', {user: players[socket.id].user,score: players[socket.id].score, bestScore : players[socket.id].bestScore});
              socket.emit('next round',{user: players[socket.id].user, score : players[socket.id].score});
              socket.emit('correct answer');
            }else{
              socket.emit('wrong answer');
              players[socket.id].askedCountries.push(players[socket.id].countryToGuess);
              players[socket.id.countryToGuess] = [];
              socket.emit('next round',{user: players[socket.id].user, score : players[socket.id].score});
            };
          };
        });
      };
    });
  });

//gestion du bouton 'pass'
  socket.on('i pass', function(err,data){
      players[socket.id].askedCountries.push(players[socket.id].countryToGuess);
      players[socket.id].countryToGuess = [];
      socket.emit('next round',{user: players[socket.id].user, score : players[socket.id].score});
  });

/******************************************************************************
FIN DU JEU
******************************************************************************/

//a la fin du jeu on vérifie si le compte existe déjà, si non on propose à l'utilisateur d'enregistrer son score.
//si le compte existe déjà on vérifie s'il a amélioré son score et on affiche son classement.
  socket.on('end game', function(data){
    var collection = db.get().collection('players');
    var user = players[socket.id].user
    var score = players[socket.id].score
    var rank = 0;

    collection.find({user:user}).toArray(function(err, data){
      if (err){
        console.log(err);
      }else{
        if(data.length > 0){
          if(score> data[0].bestScore){
            collection.update({user:user}, {$set:{bestScore: score}});
            collection.find({bestScore: {$ne : 0}},{user:1,bestScore:1,_id:0}).sort({bestScore:-1}).limit(5).toArray(function(err, data){
              app.io.emit('update leaderBoard data',data);
              socket.emit('show results', {user: user, score: players[socket.id].score, rank: rank, message: 'Time is up !!! '});
            });
          }else{
            socket.emit('show results', {user: user, score: players[socket.id].score, rank: rank, message: 'Time is up !!! '});
          };
        }else{
          socket.emit('please register', {user: players[socket.id].user, score: players[socket.id].score, rank:rank})
        }
      };
    });


    collection.find({bestScore:{$gt:score}},{'_id':0,'bestScore':1}).toArray(function(err,data){
      if(err){
        console.log(err)
      }else{
        rank = data.length+1;
        return rank;
      };
    });
  });

//Gestion du bouton 'start again' qui met à jour pour tout le monde le tableau des meilleurs scores.
  socket.on('startAgain', function(){
    players[socket.id].score = 0;
    players[socket.id].guessedCountries = [];
    players[socket.id].askedCountries = [];
    socket.emit('resetValue', {'myCounter':0, 'myAnswer':''});
    app.io.emit('update score', {user: players[socket.id].user,score: players[socket.id].score, bestScore: players[socket.id].bestScore});
    socket.emit('next round', {user:  players[socket.id].user, score: players[socket.id].score, bestScore: players[socket.id].bestScore})
  });


/******************************************************************************
CREATION D'UN COMPTE DANS LA BASE
******************************************************************************/
    socket.on('register my account', function(data){

      var user = {user : data.user, mail: data.mail, pass_initial: data.passInitial, pass_check: data.pass_check} ;
      var errors = {containErrors: false}
      var collection = db.get().collection('players');

      collection.find({user:user}).toArray(function(err, results){
        if(err){
          console.log(err)
        }else{
          if (results > 0){
            console.log('le compte existe déjà, ne pas le créer')
          }else{
            if (checkEmail(user.mail)){

            }else{
              errors.containErrors = true;
              errors.mail = 'this email address is not valid !';
            };

            if(user.pass_initial.length < 6){
              errors.containErrors = true;
              errors.pass_initial = 'Your password must be 6 characters long, try again !';
            };

            if(user.pass_initial != user.pass_check){
              errors.containErrors = true;
              errors.pass_check = 'Passwords do not match ! ';
            };

            if(errors.containErrors == true){
              socket.emit('form invalid', {errors : errors});
              errors = {};
            }else{
              var newMongoPlayer = {'user':user.user, 'mail': user.mail, 'pwd':user.pass_initial, 'bestScore': players[socket.id].score};
              salt.addNewMongoPlayer(null, newMongoPlayer);
              socket.emit('account created', {user: user.user});
            };
         };
        }
      })
    });


    var checkUserName = function(username){
      var regUser = /^[a-zA-Z0-9_.-]*$/; //vérifie que le username est composé uniquement de lettres et de chiffres.
      return regUser.test(username);
    }

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

module.exports = app;
