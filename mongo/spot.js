/**
 * Created by 최예찬 on 2016-09-06.
 */

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {
        type: String
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    oldAddress: {
        type: String
    },
    roadAddress: {
        type: String
    },
    phone: {
        type: [String]
    },
    businessType: {
        type: Number,
        min: 0,
        max: 2
        /*
         0 : 일반음식점
         1 : 관광명소
         2 : 숙박업소
         */
    },
    businessDetail: {
        type: String
    },
    stars: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'stars'
        }]
    },
    rating: {
        type: Number,
        default: 0
    }
});

schema.statics.findSpot = function (query, limit, skip, purpose, budget, longitude, latitude, maxDistance, minScore, address) {

    var queryObj = {};

    /* TODO
     query       done
     limit       done
     skip        done
     budget      yet
     longitude   done
     latitude    done
     maxDistance done
     minScore    done
     address     done
     */

    if (longitude !== undefined && latitude !== undefined && maxDistance !== undefined) queryObj.location = {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance
        }
    };

    if (minScore !== undefined) queryObj.rating = {
        $gte: minScore
    };

    if (query !== undefined) queryObj.name = {'$regex': query};
    if (address !== undefined) {
        queryObj.$or = [
            {oldAddress: {'$regex': address}},
            {roadAddress: {'$regex': address}}
        ]
    }

    return this.find(queryObj).skip(skip).limit(limit).populate({
        path: 'stars',
        model: 'stars',
        populate: {
            path: 'owner',
            model: 'users',
            select: '-salt -hash -token'
        }
    }).exec().catch(err => {
        throw {
            message: "오류가 발생했습니다: " + err.message,
            statusCode: 500
        };
    });
};


schema.statics.countSpot = function (query, purpose, budget, longitude, latitude, maxDistance, minScore, address) {

    var queryObj = {};

    /* TODO
     query       done
     limit       done
     skip        done
     budget      yet
     longitude   done
     latitude    done
     maxDistance done
     minScore    done
     address     done
     */

    if (longitude !== undefined && latitude !== undefined && maxDistance !== undefined) queryObj.location = {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance
        }
    };

    if (minScore !== undefined) queryObj.rating = {
        $gte: minScore
    };

    if (query !== undefined) queryObj.name = {'$regex': query};
    if (address !== undefined) {
        queryObj.$or = [
            {oldAddress: {'$regex': address}},
            {roadAddress: {'$regex': address}}
        ]
    }

    return this.count(queryObj).exec().catch(err => {
        throw {
            message: "오류가 발생했습니다: " + err.message,
            statusCode: 500
        };
    });
};


/**
 * @param {Object} star
 */
schema.statics.findSpotAndAddStar = function (star) {
    return this.findById(star.spot).exec().then(spot => {
        var sum = (spot.stars !== undefined) ? spot.rating * spot.stars.length : 0;
        sum += star.score;
        return this.findByIdAndUpdate(star.spot, {
            $set: {rating: sum / (spot.stars.length + 1)},
            $push: {stars: star._id}
        }).exec();
    });
};

/**
 * @param {Object} oldStar
 * @param {number} newScore
 *
 */
schema.statics.findSpotAndUpdateStar = function (oldStar, newScore) {
    return this.findById(oldStar.spot).exec().then(spot => {
        var sum = (spot.stars !== undefined) ? spot.rating * spot.stars.length : 0;
        sum -= oldStar.score;
        sum += newScore;
        return this.findByIdAndUpdate(oldStar.spot, {
            $set: {rating: sum / spot.stars.length}
        }).exec();

    });
};

schema.index({location: '2dsphere'});
var model = mongoose.model('spots', schema);


module.exports = model;