var bcrypt = require('bcrypt');
var db = require('./db.js')

const saltRounds = 10;


var addNewMongoPlayer = function(options) {
    db.connect('mongodb://localhost:27017/game', function(err) {
        if (err) {
            console.log(err);
        } else {
            var collection = db.get().collection('players');
            bcrypt.genSalt(saltRounds, function(err, salt) {
                if (err) {
                    console.log(err);
                } else {
                    bcrypt.hash(options.pwd, salt, function(err, hash) {
                        if (err) {
                            console.log(err)
                        } else {
                            options.pwd = hash
                            collection.insert(options, function(err, res) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('ok');
                                };
                            });
                        };
                    });
                };
            });
        };
    });
};

exports.addNewMongoPlayer = addNewMongoPlayer;
