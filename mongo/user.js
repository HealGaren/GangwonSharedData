/**
 * Created by 최예찬 on 2016-08-20.
 */
var mongoose = require('mongoose');
var crypto = require('crypto');

var schema = new mongoose.Schema({
    isMale: {
        type: Boolean,
        require: true
    },
    age: {
        type: Number,
        require: true
    },
    purpose: {
        type: Number,
        require: true,
        min: 0,
        max: (1 << 8) - 1
        /*비트 연산용
         1 << 0 : 가족 여행
         1 << 1 : 관광
         1 << 2 : 낭만
         1 << 3 : 도심
         1 << 4 : 럭셔리
         1 << 5 : 레져
         1 << 6 : 비즈니스
         1 << 7 : 식도락
         */
    },

    budget: {
        type: Number,
        require: true,
        min: 0,
        max: 2
        /*
         0 : 저
         1 : 중
         2 : 고
         */
    },
    job: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    id: {
        type: String,
        require: true
    },
    salt: {
        type: String,
        require: true,
    },
    hash: {
        type: String,
        require: true
    },
    token: {
        type: String
    }
});

/**
 * @param {string} password
 */
schema.methods.equalsPassword = function (password) {
    var hash = crypto.createHash('sha512').update(password + this.salt).digest('hex');
    return hash == this.hash;
};

schema.methods.genToken = function(){
    return new Promise((resolved, reject)=>{
        crypto.randomBytes(48, (err, buffer) => {
            if(err) reject(err);
            this.token = this.id + buffer.toString('hex');
            resolved(this.save());
        });
    });
};

/**
 * @param {boolean} isMale
 * @param {number} age
 * @param {number} purpose
 * @param {number} budget
 * @param {string} job
 * @param {string} name
 * @param {string} id
 * @param {string} password
 */
schema.statics.register = function (isMale, age, purpose, budget, job, name, id, password) {

    return this.findOne({id:id}).exec()
        .then(user => {
            if (user) throw {
                message: "이미 존재하는 유저입니다.",
                statusCode: 409,
            };
            else {
                var salt = Math.round((new Date().valueOf() * Math.random())) + "";
                var hashedPass = crypto.createHash("sha512").update(password + salt).digest("hex");

                return new this({
                    isMale: isMale,
                    age: age,
                    purpose: purpose,
                    budget: budget,
                    job: job,
                    name: name,
                    id: id,
                    salt: salt,
                    hash: hashedPass
                }).save().then(user=>{
                    return user.genToken();
                })
            }
        }, err => {
            throw {
                message: "오류가 발생했습니다: " + err.message,
                statusCode: 500
            };
        });
};

/**
 * @param {string} id
 * @param {string} password
 */
schema.statics.login = function (id, password) {

    return this.findOne({id: id}).exec()
        .then(user => {
            if (!user) throw {
                message: "아이디가 존재하지 않습니다.",
                statusCode: 401
            };
            else {
                if (user.equalsPassword(password)) {
                    return user;
                }
                else throw {
                    message: "비밀번호가 일치하지 않습니다.",
                    statusCode: 401
                };
            }
        }, err => {
            throw {
                message: "오류가 발생했습니다: " + err.message,
                statusCode: 500
            };
        });
};

/**
 *
 * @param {string} token
 */
schema.statics.tokenLogin = function (token) {

    return this.findOne({token: token}).exec()
        .then(user => {
            if (!user) throw {
                message: "토큰이 유효하지 않습니다.",
                statusCode: 401
            };
            else return user;
        }, err => {
            throw {
                message: "오류가 발생했습니다: " + err.message,
                statusCode: 500
            };
        });
};

schema.statics.removeUser = function (id) {
    return this.findByIdAndRemove(id).exec();
};

var model = mongoose.model('users', schema);


module.exports = model;