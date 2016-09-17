/**
 * Created by 최예찬 on 2016-09-16.
 */
/**
 * @param {Array.<Array.<string|boolean>>} paramPairs
 * @param {Object} params
 * @returns {boolean}
 */
function parseParam(paramPairs, params) {
    return paramPairs.every(pair=> {
        var key = pair[0], typename = pair[1], require = pair[2];

        if (!params.hasOwnProperty(key)) {
            if(require) throw {
                statusCode: 400,
                message: key + ' 값이 존재하지 않습니다.'
            };
            else {
                if(pair.length == 4) params[key] = pair[3];
                return true;
            }
        }
        if (typename === 'string') return true;

        var value = params[key];
        try {
            var result = JSON.parse(value);
        } catch (err){
            throw {
                statusCode: 400,
                message: key + ' 값 ' + value + "을(를) " + typename + ' 형식으로 파싱하지 못했습니다. ' + err.message
            };
        }
        var currentType = typeof result;
        if (currentType !== typename) throw {
            statusCode: 400,
            message: key + ' 값 ' + value + '은(는) ' + currentType + " 형식입니다. " + typename + ' 형식이 아닙니다.'
        };
        params[key] = value;
        return true;
    });
}

/**
 *@enum {number}
 */
var ParamsEnum = {
    BODY: 0,
    PARAMS: 1
};

/**
 *
 * @param {Array.<Array.<string>>} paramPairs
 * @param {ParamsEnum} paramsType
 * @returns {function(*, *, *)}
 */
function bindParseParam(paramPairs, paramsType) {
    return (req, res, next) => {
        var params;
        switch (paramsType) {
            case ParamsEnum.BODY:
                params = req.body;
                break;
            case ParamsEnum.PARAMS:
                params = req.params;
                break;
        }
        try {
            parseParam(paramPairs, params);
            next();
        } catch (err) {
            res.status(400).send(err.message);
        }
    }
}


exports.parseParam = {
    /**
     * @param {Array.<Array.<string>>} paramPairs
     */
    body: (paramPairs) => bindParseParam(paramPairs, ParamsEnum.BODY),
    /**
     * @param {Array.<Array.<string>>} paramPairs
     */
    params: (paramPairs) => bindParseParam(paramPairs, ParamsEnum.PARAMS)
};


function needToken(req, res, next) {
    if (req.user) next();
    else res.status(401).send('토큰이 필요합니다.');
}

exports.needToken = () => {
    return needToken;
};