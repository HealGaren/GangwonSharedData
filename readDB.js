/**
 * Created by 최예찬 on 2016-09-20.
 */

var mongo = require('./mongo');
var jsonfile = require('jsonfile');

jsonfile.spaces = 4;

var files = {
    chinafood: './dbdata/array/chinafood.json',
    fastfood: './dbdata/array/fastfood.json',
    koreanfood: './dbdata/array/koreanfood.json',
    minbak: './dbdata/array/minbak.json',
    trip: './dbdata/array/trip.json'
};

var result = processFood(files.chinafood, '중식')
    .concat(processFood(files.fastfood, '패스트푸드'))
    .concat(processFood(files.koreanfood, '한식'))
    .concat(processMinbak())
    .concat(processTrip());

console.log('파일 쓰기 중...');
jsonfile.writeFileSync('./dbdata/resultdb.json', result);
console.log('파일 쓰기 완료!');
process.exit();

function phoneStrToArray(str){
    return str.replace(/[/\-X]+/g).split(/\s+/).filter(str=>str);
}


function processFood(path, foodName) {
    console.log(foodName + ' (' + path + ') 파일 읽는 중...');
    var foodArray = jsonfile.readFileSync(path);
    console.log(foodName + ' 파일을 모두 읽었습니다. 처리 중..');

    var count = 0;
    var foodLength = foodArray.length;
    var filteredFood = foodArray.map((food) => {
        var obj = {
            name: food.BIZPLC_NM,
            oldAddress: food.LOCPLC_LOTNO_ADDR,
            roadAddress: food.LOCPLC_ROADNM_ADDR,

            businessType: 0,
            businessDetail: foodName,
        };

        if (food.LNG != '' && food.LAT != '') {
            obj.location = {
                type: 'Point',
                coordinates: [food.LNG, food.LAT]
            };
        }

        count++;
        if (count % 100 == 0) console.log(foodName + ' 처리 ' + count + ' / ' + foodLength + ' 완료...');
        return obj;
    });

    console.log(foodName + ' 처리 완료!');

    return filteredFood;
}

function processMinbak(){
    console.log('민박 (' + files.minbak + ') 파일 읽는 중...');
    var minbakArray = jsonfile.readFileSync(files.minbak);
    console.log('민박 파일을 모두 읽었습니다. 처리 중..');


    var count = 0;
    var minbakLength = minbakArray.length;
    var filteredMinbak = minbakArray.map((minbak) => {
        var obj = {
            name: minbak.COMP_NM,
            oldAddress: minbak.LOCPLC_LOTNO_ADDR,
            roadAddress: minbak.LOCPLC_ROADNM_ADDR,

            phone: phoneStrToArray(minbak.CONTACT),
            businessType: 2,
        };

        if (minbak.LNG != '' && minbak.LAT != '') {
            obj.location = {
                type: 'Point',
                coordinates: [minbak.LNG, minbak.LAT]
            };
        }

        count++;
        if (count % 100 == 0) console.log('민박 처리 ' + count + ' / ' + minbakLength + ' 완료...');
        return obj;
    });

    console.log('민박 처리 완료!');

    return filteredMinbak;
}

function processTrip(){
    console.log('관광명소 (' + files.trip + ') 파일 읽는 중...');
    var tripArray = jsonfile.readFileSync(files.trip);
    console.log('관광명소 파일을 모두 읽었습니다. 처리 중..');


    var count = 0;
    var tripLength = tripArray.length;

    var checkObj = {};

    var filteredTrip = tripArray.map((trip) => {

        var obj;
        if(!checkObj[trip.TOUR]) {
            checkObj[trip.TOUR] = true;
            obj = {
                name: trip.TOUR,
                businessType: 1,
            };

            if (trip.LNG != '' && trip.LAT != '') {
                obj.location = {
                    type: 'Point',
                    coordinates: [trip.LNG, trip.LAT]
                };
            }
        }
        else obj = false;
        count++;
        if (count % 100 == 0) console.log('관광명소 처리 ' + count + ' / ' + tripLength + ' 완료...');
        return obj;
    }).filter(trip => trip);

    console.log('관광명소 처리 완료!');

    return filteredTrip;
}