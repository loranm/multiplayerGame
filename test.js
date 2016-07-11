var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var chalk = require('chalk');

var routes = require('./routes/index');
var users = require('./routes/users');
var game = require('./routes/game_router');
var test = require('./routes/test');
var chat = require('./routes/chat');
var db = require('./bin/db.js')
// var pickFlag = require('./bin/game_mechanic.js')



var players = {};
var player = function(options) {
    this.user = options.user;
    this.mail = options.mail;
    this.bestScore = options.bestScore;
    this.askedCountries = [];
    this.guessedCountries = [];
    this.countryToGuess = '';
};

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

/*******************************************************************************
GESTION du WEBSOCKET
******************************************************************************/
app.io.on('connection', function(socket) { //connexion initiale au websocket
    console.log('connection établie')
    socket.emit('welcome', {
        message: 'bienvenue'
    });


    socket.on('new player', function(user) {
        var collection = db.get().collection('players');
        collection.find({
            'user': user
        }).toArray(function(err, data) {
            if (err) {
                throw err;
            } else {
                if (data.length > 0) {
                    players[socket.id] = new player({
                        user: data[0].user,
                        mail: data[0].mail,
                        bestScore: data[0].bestScore,
                        guessedCountries: data[0].guessedCountries
                    })
                    var newPlayer = players[socket.id];
                    socket.emit('createMyNewScoreBoard', {
                        players
                    });
                    socket.broadcast.emit('addNewPlayerToBoard', {
                        newPlayer
                    });
                    //ajouter la connexion avec un mot de passe
                } else {
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
    });

    /******************************************************************************
    MECANIQUE DU JEU
    *******************************************************************************/
    socket.on('Send me a new flag', function (data){
      var test = pickACountry(socket.id, players);
      console.log(test)
    });

    var maFonction = function(data, callback){
      console.log(data);
    }

    /*****************************************************************************
    GESTION DE LA DECONNEXION DU JOUEUR
    *****************************************************************************/
    socket.on('disconnect', function(data) {
        socket.broadcast.emit('leftTheGame', {
            message: 'parti',
            user: players[socket.id]
        });
        delete players[socket.id];

        //ajouter la proposition de créer un compte pour sauvegarder son score.
    })
});





/******************************************************************************
TIRAGE AU SORT PAYS
*****************************************************************************/
var randInt = function(min, max) {
    return Math.floor(Math.random() * max) + min
};
var pickACountry = function(id, players) {
    var doNotSendTheseCountries = [];
    db.connect('mongodb://localhost:27017/game', function(err) {
        if (err) {
            console.log('Impossible de se connecter à la base de données.');
            process.exit(1);
        } else {
            for (var i in players) {
                if (i == id) {
                    doNotSendTheseCountries.push.apply(doNotSendTheseCountries, players[i].askedCountries);
                    doNotSendTheseCountries.push.apply(doNotSendTheseCountries, players[i].guessedCountries);
                    var collection = db.get().collection('countries')
                    var myCursor = collection.find({'country': {$nin: doNotSendTheseCountries}}).toArray(function(err, data) {
                        if (err) {
                            console.log('ERREUR')
                        } else {
                            var max = (data.length);
                            var sendFlagNb = randInt(0, max);
                            players[i].countryToGuess = data[sendFlagNb].country;
                            return players[i].countryToGuess;
                        };
                    });
                };
            };
        };
    });
};




var maFonction = function(callback,data,id){
  var test = callback(id,data);
  console.log(test);
}

maFonction(pickACountry,players,1)


module.exports = app;
