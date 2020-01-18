var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  
  console.log("session :" + JSON.stringify(req.session))
  res.render('index', { title: 'Express' });


});

module.exports = router;
