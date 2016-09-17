/**
 * Created by 최예찬 on 2016-09-06.
 */

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    businessType: {
        type: Number,
        min:0,
        max:2
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
    }
});

schema.statics.findSpot = function (query, limit, skip, purpose, budget, longitude, latitude, maxDistance, minScore, address) {

    var queryObj = {};

    /* TODO
    query       yet
    limit       done
    skip        done
    budget      yet
    longitude   done
    latitude    done
    maxDistance done
    minScore    yet
    address     yet
     */

    if(longitude !== undefined && latitude !== undefined && maxDistance !== undefined) queryObj.location = {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance
        }
    };

    return this.find(queryObj).skip(skip).limit(limit).exec().catch(err => {
            throw {
                message: "오류가 발생했습니다: " + err.message,
                code: 500
            };
        });
};


/**
 * @param {mongoose.Schema.Types.ObjectId} spotId
 * @param {mongoose.Schema.Types.ObjectId} starId
 */
schema.statics.findSpotAndAddStar = function(spotId, starId){
    return this.findByIdAndUpdate(spotId, {$push: {stars: starId}}).exec();
};

var model = mongoose.model('spots', schema);


module.exports = model;