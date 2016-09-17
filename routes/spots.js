var express = require('express');
var mongo = require('../mongo');
var middleware = require('./middleware');
var router = express.Router();


router.get('', middleware.needToken(), middleware.parseParam.params([
    ['query', 'string'],

    ['limit', 'number', false, 10],
    ['skip', 'number', false, 0],

    ['purpose', 'number'],
    ['budget', 'number'],

    ['longitude', 'number'],
    ['latitude', 'number'],
    ['maxDistance', 'number'],

    ['minScore', 'number'],
    ['address', 'string'],
]), (req, res) => {

    //noinspection JSUnresolvedVariable
    mongo.Spot.findSpot(
        req.params.query, req.params.limit, req.params.skip,
        req.params.purpose, req.params.budget,
        req.params.longitude, req.params.latitude, req.params.maxDistance,
        req.params.minScore, req.params.address
    )
        .then(spots => {
            res.send(spots);
        })
        .catch(err => {
            res.status(err.statusCode).send(err.message);
        });
});


router.get('/:id', middleware.needToken(), (req, res) => {

    //noinspection JSUnresolvedVariable
    mongo.Spot.findById(req.params.id).exec()
        .then(spot => {
            if(!spot) res.status(404).send('존재하지 않는 Spot입니다.')
            else res.send(spot);
        })
        .catch(err => {
            res.status(500).send('오류가 발생했습니다 : ' + err.message);
        });
});

router.get('/:id/stars', middleware.needToken(), (req, res) => {

    //noinspection JSUnresolvedVariable
    mongo.Spot.findById(req.params.id, {stars:1}).populate('stars').exec()
        .then(spot => {
            if(!spot) res.status(404).send('존재하지 않는 Spot입니다.');
            else res.send(spot.stars);
        })
        .catch(err => {
            res.status(500).send('오류가 발생했습니다 : ' + err.message);
        });
});

router.post('/:id/stars', middleware.needToken(), middleware.parseParam.body([
    ['score', 'number', true],
    ['content', 'string']
]), (req, res) => {

    mongo.Spot.findById(req.params.id, {_id:1}).exec()
        .then(spot => {
            if(!spot) res.status(404).send('존재하지 않는 Spot입니다.');
            else return mongo.Star.newStar(req.body.score, req.body.content, req.user._id, spot._id);
        })
        .then(star => {
            return mongo.Spot.findSpotAndAddStar(star.owner, star._id);
        })
        .then(() => {
            res.send('성공적으로 별점이 등록되었습니다.');
        })
        .catch(err => {
            res.status(500).send('오류가 발생했습니다 : ' + err.message);
        });
});



module.exports = router;