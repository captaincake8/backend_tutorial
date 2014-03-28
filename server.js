var http = require('http');
var logger = require('log4js').getLogger('server');
vm = require('vm');
var sha1 = require('sha1'); // sha1("message")
var async = require('async');
var secretKey = "";
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient

var express = require('express'),
    app = express();

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({'secret':'7&pl&ieo=)j7rd=m8n+e@8a%l=5nm2q16h=%g@r7n6)==e429q'}));
app.use('/backend/user', function( req, res, next){
    var userid = req.session.userid;
    MongoClient.connect(MongoDbUrl, function(err, db){
        var users = db.collection('users');
        users.findOne({"_id": new mongodb.ObjectID(userid)}, function(err, obj){
            if ( !! err || !obj ){
                res.send(500, "user with id " + userid + " not found");
            }
            req.user = obj;
            next();
        })
    });
});
/*var server = http.createServer(function(req, res){
    console.log('connection from: ' + res.socket.remoteAddress);

    res.writeHead(200, ['Content-Type', 'text/plain']);
    res.write( "path is [" + req.url + "]");
    res.write( "method is [" + req.method + "]");
    res.end();
});*/
var MongoDbUrl = 'mongodb://127.0.0.1:27017/test';
app.get("/backend/login", function(req, res){
    console.log("doing login");
    var username = req.query.username;
    var password = req.query.password;
    var rememberMe = req.query.rememberMe || "false";

    console.log([username]);

   MongoClient.connect(MongoDbUrl, function(err, db){
      var users = db.collection('users');
       users.find({"username":username, "password" : sha1(sha1(password))}).toArray(function(err, results){
           console.log(["found users", results]);
           if ( results.length == 0 ){
               res.send("wrong username/password");
           } else if ( results.length == 1){
               var user = results[0];
                    req.session.userid = user._id.toString();
                res.send("welcome. you are logged in");
           } else {
               console.log("ERROR! We have an error!!!");
               res.send("internal error");
           }

       });
   });
});


app.post('/backend/leaderboard', function( req, res ){
    var params = req.body; // { "name" : "myName" , "score" : "scoreValue" }
    params.score = parseInt( params.score );
    MongoClient.connect(MongoDbUrl, function(err, db) {
        var leaderboard = db.collection('leaderboard');
        leaderboard.insert(params, function( err, result ){
            res.send(result);
        })
    })
});

app.get('/backend/leaderboard', function( req, res ){
    MongoClient.connect(MongoDbUrl, function(err, db) {
        var leaderboard = db.collection('leaderboard');
        leaderboard.find().sort({"score" : -1}).limit(10).toArray(function(err, results){
            res.send(results);
        });
    });
});

app.post('/backend/user/sendMessage', function(req, res){
    var data = req.body;
    var from = req.user;
    logger.info('saving message ', data);
    MongoClient.connect(MongoDbUrl, function(err, db){
        var messages = db.collection('messages');
        messages.insert({"from": from._id, "message" : data.message, "to" : new mongodb.ObjectID(data.to)}, function( err, result){
            res.send(result);
        })
    });
});

app.get('/backend/user/messages', function( req, res ){
    logger.info('getting messages');
    MongoClient.connect(MongoDbUrl, function(err, db){

        var messages = db.collection('messages');
        messages.find({'to': req.user._id}).toArray( function( err, results){
            logger.info('got messages' + results.length);
            res.send(results);
        })
    })
});

app.get('/backend/users', function( req, res ){
    MongoClient.connect(MongoDbUrl, function(err, db){
        var users = db.collection('users');
        users.find({}).toArray(function( err, results ){
            console.log(results);
            res.send(results);
        });
    });
});

String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};

app.post("/backend/user/cats", function(req, res){
        var user = req.user;
        var cat = req.body;
        console.log(cat.flufiness);
    if ( !cat.fluffiness || cat.fluffiness.trim().length == 0 ){
        res.send(500, 'must have fluffiness');
        return;
    }

    cat.userid = user._id;

        MongoClient.connect(MongoDbUrl, function(err, db){
           var cats = db.collection('cats');
            cats.insert(cat, function(err, result){
                if ( !!err ){
                    res.send(500, "error : " + err.message);
                }
                res.send(result);
            })
        });
});

app.get("/backend/user/cats", function(req,res){
    MongoClient.connect(MongoDbUrl, function(err, db){
        var cats = db.collection ("cats");
        cats.find({"userid": req.user._id}).toArray( function(err, result ){
            res.send(result);
        })
    });
});



//

app.get("/friends", function(req, res){

    var username = req.query.username;


    res.send("these are your friends");
});

app.get("/backend/signup", function(req, res){

    // save "username" , "password" , "passwordConfirm" to a variable
    var username = req.query.username;
    var password = req.query.password;
    var passwordConfirm = req.query.passwordConfirm;

    console.log("user %s is signing up", username);

    // connect with MongoClient to test


    MongoClient.connect(MongoDbUrl,function(err, db) {
        if(err) throw err;
        console.log("connected to db");
        var collection = db.collection('users');
        // insert user info into mongo { "username" : username, "password" : sha1(password) }
        collection.insert({"username" : username, "password" :sha1 (sha1 (password))},function(err, docs){
            console.log("user is saved!");
            // return ok to user
            res.send("you are now signed up!");

        });
        console.log("let me do something else.. ");
    });




});


app.get("/guy", function(req, res){
	var result = parseInt(req.query.answer);
	var evald = eval(req.query.exercise);
	if ( evald == result ){
		res.send("you are right!" );
	}else{
		res.send("no!!! "  + req.query.exercise + " = " + evald);
	}

});


//var MongoClient = require('mongodb').MongoClient
//    , format = require('util').format;
//
//  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
//    if(err) throw err;
//
//    var collection = db.collection('scores');
//    collection.insert({a:2}, function(err, docs) {
//
//      collection.count(function(err, count) {
//        console.log(format("count = %s", count));
//      });
//
//      // Locate all the entries using find
//      collection.find().toArray(function(err, results) {
//        console.dir(results);
//        // Let's close the db
//        db.close();
//      });
//    });
//  });

var port = '9000';
app.listen(port);
console.log("listening on port " + port );



//app.get("/login2", function(req, res){
//    var username = req.query.username;
//    var password = req.query.password;
//    var rememberMe = req.query.rememberMe || "false";
//
//    async.waterfall([
//        function(callback){
//
//
//            MongoClient.connect(MongoDbUrl, callback );
//
//        },
//        function(err,db, callback){
//                var users = db.collection('users');
//                users.find({"username":username, "password" : sha1(sha1(password))}).toArray(callback);
//        },
//        function(err, results, callback){
//                console.log(["found users", results]);
//                if ( results.length == 0 ){
//                    res.send("wrong username/password");
//                } else if ( results.length == 1){
//                    var user = results[0];
//                    if ( rememberMe == "true"){
//                        res.cookie('userid', user._id + sha1(user.username + "%%" + user.password), { maxAge: 9000000000000000 });
//                    }else{
//                        res.cookie('guy','value');
//                    }
//                    res.send("welcome. you are logged in");
//                } else {
//                    console.log("ERROR! We have an error!!!");
//                    res.send("internal error");
//                }
//
//        }
//    ]);
//
//});