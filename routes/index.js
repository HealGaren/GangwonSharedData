var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var users = {};

/* GET home page. */
router.post('/register', function(req, res, next) {
  var id = req.body.id;
  var pw = req.body.pw;
  var name = req.body.name;

  if(users[id]) {
    res.json({
      success:false,
      message:"아이디가 이미 존재합니다!"
    });
  }
  else {
    users[id] = {
      pw: pw,
      name: name
    };
    res.json({
      success:true,
      message:"성공적으로 가입되었습니다."
    });
  }
});

router.post('/login', function(req, res, next) {
  var id = req.body.id;
  var pw = req.body.pw;
  if(!users[id]) {
    res.json({
      success:false,
      message:"아이디가 존재하지 않습니다!"
    });
  }
  else {
    if(users[id].pw != pw){
      res.json({
        success:false,
        message:"비밀번호가 일치하지 않습니다!"
      });
    }
    else {
      res.json({
        success:true,
        message:"성공적으로 로그인되었습니다."
      });
    }
  }
});

router.get('/name', function(req, res, next) {

  var id = req.query.id;
  if(!users[id]) {
    res.json({
      success:false,
      message:"아이디가 존재하지 않습니다!"
    });
  }
  else {
    res.json({
      success:true,
      result:users[id].name
    });
  }
});

module.exports = router;
