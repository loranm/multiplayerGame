var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('test', { title: 'test' });
});


// io.on ('connection', function(socket){
//   console.log(socket);
// });

// router.get('/game', function(req, res, next){
//   res.render('game')
// })

module.exports = router;
