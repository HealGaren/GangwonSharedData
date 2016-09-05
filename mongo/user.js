/**
 * Created by 최예찬 on 2016-08-20.
 */
var mongoose = require('mongoose');
var crypto = require('crypto');

var schema = new mongoose.Schema({
    createdDate: {
        type: Date,
        default: Date.now
    },
    localEmail: {
        type: String
    },
    localSalt: {
        type: String
    },
    localHash: {
        type: String
    },
    localExist: {
        type: Boolean,
        default: false
    },
    name: {
        type: String
    }
});

schema.methods.addLocalLogin = function (email, password, name) {
    var salt = Math.round((new Date().valueOf() * Math.random())) + "";
    var hashedPass = crypto.createHash("sha512").update(password + salt).digest("hex");

    this.localEmail = email;
    this.localSalt = salt;
    this.localHash = hashedPass;
    this.name = name;

    this.localExist = true;

    return this.save();
};

schema.methods.equalsPassword = function (password) {
    var hash = crypto.createHash('sha512').update(password + this.localSalt).digest('hex');
    return hash == this.localHash;
};

schema.statics.registerLocal = function (email, password, phoneNumber, name) {
    var that = this;
    return that.findOne({localEmail: email}).exec()
        .then(function (user) {
            if (!user) return new that().addLocalLogin(email, password, name)
                .then(function (user) {
                    return user.addPhoneNumber(phoneNumber);
                });
            else throw {
                message: "이미 존재하는 유저입니다.",
                isClient: true
            };
        });
};


schema.statics.loginLocal = function (email, password) {
    return this.findOne({localEmail: email}).exec()
        .then(function (user) {
            if (!user) throw {
                message: "이메일이 존재하지 않습니다.",
                isClient: true
            };
            else {
                if (user.equalsPassword(password)) return user;
                else throw {
                    message: "비밀번호가 일치하지 않습니다.",
                    isClient: true
                };
            }
        });
};

schema.statics.loginFacebook = function (id, email) {
    var that = this;
    return that.findOne({facebookID: id}).exec()
        .then(function (user) {
            if (user) return user;
            else return that.registerFacebook(id, email);
        });
};

schema.statics.removeUser = function (id) {
    return this.findByIdAndRemove(id).exec();
};

schema.statics.addFriend = function (id, friendId) {
    return this.findByIdAndUpdate(id, {$push: {friends: friendId}}).exec();
};

schema.statics.removeFriend = function (id, friendId) {
    return this.findByIdAndUpdate(id, {$pull: {friends: friendId}}).exec();
};


schema.statics.rename = function (id, name) {
    return this.findByIdAndUpdate(id, {name: name}).exec();
};


schema.statics.getUser = function (id) {
    var that = this;
    return that.findById(id).exec();
};



schema.statics.getFriendsIdArray = function (id) {
    var that = this;
    return that.findById(id).exec()
        .then(function (user) {
            return user.friends;
        });
};

schema.statics.getFriendsArray = function (id) {
    var that = this;
    return that.findById(id).exec()
        .then(function (user) {
            return that.find({
                '_id': {$in: user.friends}
            }).sort('name.last');
        });
};

schema.statics.getUsersArray = function (ids) {
    var that = this;
    return that.find({
        '_id': {$in: ids}
    }).sort('name.last').exec();
};

schema.statics.getGroupsIdArray = function (id) {
    var that = this;
    return that.findById(id).exec()
        .then(function (user) {
            return user.groups;
        });
};

schema.statics.updateLocation = function (id, longi, lati) {
    return this.findByIdAndUpdate(id, {lastLongi: longi, lastLati: lati}, {new:true}).exec();
};


schema.statics.addGroup = function (id, roomId) {
    return this.findByIdAndUpdate(id, {$push: {groups: roomId}}, {new:true}).exec();
};

var model = mongoose.model('users', schema);


module.exports = model;