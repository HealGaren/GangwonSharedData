/**
 * Created by 최예찬 on 2016-09-06.
 */

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    score: {
        type: Number,
        min: 1,
        max: 5,
        require: true
    },
    title: {
        type: String
    },
    content: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: true
    },
    spot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'spots',
        require: true
    }
});


/**
 * @param {number} score
 * @param {string} title
 * @param {string} content
 * @param {mongoose.Schema.Types.ObjectId} ownerId
 * @param {mongoose.Schema.Types.ObjectId} spotId
 */
schema.statics.newStar = function(score, title, content, ownerId, spotId){
    var obj = {};
    obj.score = score;
    if(title) obj.title = title;
    if(content) obj.content = content;
    obj.owner = ownerId;
    obj.spot = spotId;
    return new this(obj).save();
};

schema.statics.updateStar = function(starId, title, score, content){
    console.log(starId);
    return this.findByIdAndUpdate(starId, {$set:{score:score, title:title, content:content}}).exec();
};

var model = mongoose.model('stars', schema);

module.exports = model;