var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    MongoClient = require('mongodb');
var server = require("http").Server(app);
var io = require("socket.io").listen(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));  //  parser url
app.use(multer());

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//  connect to mongo
MongoClient.connect('mongodb://localhost:27017/sijishangdong', function (err, db) {
    if (err) throw err;
	console.log('connected to mongo');

    var ticketIdList = null;

    db.collection('idlist').find({'idlist': {$exists: 1}}).toArray(function (err, docs) {
        ticketIdList = docs[0]['idlist'];
    });

    socket.on('choujiang', onChoujiangHandler);
    socket.on('userInfo', onGetUserInfoHandler);

    function onChoujiangHandler (socket) {
        var result = '';

        console.log('someone join to this game');

        db.collection('visitedNumber').update({"visitedNumber": {$exists: 1}}, {$inc: {"visitedNumber": 1}});

        var visitedNumber = null;

        db.collection("visitedNumber").find({"visitedNumber": {$exists: 1}}).toArray(function (err, docs) {
            visitedNumber = docs[0]['visitedNumber'];

            if (visitedNumber > 2400) {
                //  return false
                console.log(visitedNumber  + ':' + 10086);
                result = 10086;
            } else {
                var isGetGift = false;

                for (var i = 0; i < ticketIdList.length; i++) {
                    //console.log(visitedNumber, ":::::" , ticketIdList[i]);
                    if (visitedNumber == ticketIdList[i]) {
                        isGetGift = true;
                        break;
                    }
                }

                if (isGetGift) {
                    console.log(visitedNumber  + ':' + 200);
                    result = 200;
                } else {
                    console.log(visitedNumber  + ':' + 10010);
                    result = 10010;
                }
            }

            //  return result
            socket.emit('gameResult', {"result": result});
        });
    }

    function onGetUserInfoHandler (data) {
        console.log("Some one post they info...:");
        var data = data;

        if (data.username || data.phone) {
            console.log('err');
        } else {
            console.log(data.username, data.phone);
            //  insert data to database
            db.collection('userInfo').insert(data, function (err, data) {

            });
        }

        socket.emit('storeInfoResult', {"result": true});
    }

    app.listen(88, "120.26.48.94");
    console.log('Server running at 120.26.48.94:88');
});

