var db = require('./db.js');
var chalk = require ('chalk');
/*
  1 sortir les pays déjà proposés et répondus de la base de donnnées
  2 faire un random dans ce qui reste
  3 renvoyer un pays

*/

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
                    var myCursor = collection.find({
                        'country': {
                            $nin: doNotSendTheseCountries
                        }
                    }).toArray(function(err, data) {
                        if (err) {
                            console.log('ERREUR')
                        } else {
                            console.log(doNotSendTheseCountries)
                            var max = (data.length);
                            var sendFlagNb = randInt(0, max);
                            players[i].countryToGuess = data[sendFlagNb].country
                            console.log(chalk.red(players[i].countryToGuess));
                        };
                    });
                };
            };
        };
    });
};

exports.pickCountry = pickACountry;
