var express = require('express');
var mongo = require('../mongo');
var middleware = require('./middleware');
var router = express.Router();

var multer = require('multer');
var upload = multer({dest: './public/uploads/'});
var fs = require('fs');


router.post('', middleware.parseParam.body([
    ['isMale', 'boolean', true],
    ['age', 'number', true],
    ['purpose', 'number', true],
    ['budget', 'number', true],
    ['job', 'string', true],
    ['name', 'string', true],
    ['id', 'string', true],
    ['password', 'string', true]
]), (req, res) => {

    //noinspection JSUnresolvedVariable
    mongo.User.register(
        req.body.isMale, req.body.age, req.body.purpose, req.body.budget, req.body.job, req.body.name,
        req.body.id, req.body.password
    )
        .then(user => {
            user = user.toObject();
            delete user.salt;
            delete user.hash;
            res.send(user);
        })
        .catch(err => {
            res.status(err.statusCode).send(err.message);
        });

});


router.post('/login', middleware.parseParam.body([
    ['id', 'string'],
    ['password', 'string']
]), (req, res) => {

    //noinspection JSUnresolvedVariable
    mongo.User.login(req.body.id, req.body.password)
        .then(user => {
            user = user.toObject();
            delete user.salt;
            delete user.hash;
            res.send(user);
        })
        .catch(err => {
            res.status(err.statusCode).send(err.message);
        });
});


router.get('/me', middleware.needToken(), (req, res) => {
    res.send(req.user);
});


router.post('/me/image', middleware.needToken(), upload.single('file'), (req, res) => {
    if(!req.file) res.status(400).send('파일이 존재하지 않습니다.');
    else {
        var path = req.file.path;
        var outPath = 'public/users/image/' + req.user._id + '.png';
        fs.rename(path, outPath, function(err){
            if(err) res.status(500).send('오류가 발생했습니다 : ' + err.message);
            else res.status(200).send('성공적으로 업로드되었습니다.');
        });
    }
});

module.exports = router;