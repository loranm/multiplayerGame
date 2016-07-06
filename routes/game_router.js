var express = require('express');
var router = express.Router();
var db = require('../bin/db.js')

/* GET game page. */
router.get('/', function(req, res, next){
  var collection = db.get().collection('countries');
  collection.find().toArray(function(err,data){
    if (err){
      console.log('erreur de connexion à la base')
    }else{
      res.render('game', {data});
    }
  });
});

db.connect('mongodb://localhost:27017/game', function(err){
  if(err){
    console.log('connexion à la base de données impossible');
  }else{
    console.log('connexion à mongodb effectuée')
  }
});



module.exports = router;
