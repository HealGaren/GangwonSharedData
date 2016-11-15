var express = require('express');
var mongo = require('../mongo');
var middleware = require('./middleware');
var router = express.Router();


router.get('', middleware.needToken(), middleware.parseParam.query([
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

    var result;
    //noinspection JSUnresolvedVariable
    mongo.Spot.findSpot(
        req.query.query, req.query.limit, req.query.skip,
        req.query.purpose, req.query.budget,
        req.query.longitude, req.query.latitude, req.query.maxDistance,
        req.query.minScore, req.query.address
    )
        .then(spots=>{
            result = spots;
            return mongo.Spot.countSpot(
                req.query.query,
                req.query.purpose, req.query.budget,
                req.query.longitude, req.query.latitude, req.query.maxDistance,
                req.query.minScore, req.query.address
            )
        })
        .then(count => {
            res.send({
                result: result,
                hasMore: count > req.query.skip + req.query.limit
            });
        })
        .catch(err => {
            res.status(err.statusCode).send(err.message);
        });
});


router.get('/:id', middleware.needToken(), (req, res) => {

    //noinspection JSUnresolvedVariable
    mongo.Spot.findById(req.params.id).populate({
        path:'stars',
        model:'stars',
        populate: {
            path:'owner',
            model:'users',
            select:'-salt -hash -token'
        }
    }).exec()
        .then(spot => {
            if(!spot) res.status(404).send('존재하지 않는 Spot입니다.');
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
    ['title', 'string'],
    ['content', 'string']
]), (req, res) => {

    var spotId;

    mongo.Spot.findById(req.params.id, {_id:1}).exec()
        .then(spot => {
            spotId = spot._id;
            if(!spot) throw {
                message: '존재하지 않는 Spot입니다.',
                statusCode: 404
            };
            else return mongo.Star.find({
                owner: req.user._id,
                spot: spot._id
            }).exec();
        })
        .then(star => {
            if(star.length > 0){
                return mongo.Star.updateStar(star[0]._id, req.body.score, req.body.title, req.body.content)
                    .then(newStar =>  mongo.Spot.findSpotAndUpdateStar(star[0], req.body.score));
            }
            else {
                return mongo.Star.newStar(req.body.score, req.body.title, req.body.content, req.user._id, spotId)
                    .then(star => mongo.Spot.findSpotAndAddStar(star));
            }
        })
        .then(() => {
            res.send('성공적으로 별점이 등록되었습니다.');
        })
        .catch(err => {
            res.status(err.statusCode).send(err.message);
        });
});



module.exports = router;