var http = require('http');
vm = require('vm');
var sha1 = require('sha1'); // sha1("message")
var async = require('async');
var secretKey = "";
var MongoClient = require('mongodb').MongoClient

var express = require('express'),
    app = express();

/*var server = http.createServer(function(req, res){
    console.log('connection from: ' + res.socket.remoteAddress);

    res.writeHead(200, ['Content-Type', 'text/plain']);
    res.write( "path is [" + req.url + "]");
    res.write( "method is [" + req.method + "]");
    res.end();
});*/
var MongoDbUrl = 'mongodb://127.0.0.1:27017/test';
app.get("/login", function(req, res){

    var username = req.query.username;
    var password = req.query.password;
    var rememberMe = req.query.rememberMe || "false";

   MongoClient.connect(MongoDbUrl, function(err, db){
      var users = db.collection('users');
       users.find({"username":username, "password" : sha1(sha1(password))}).toArray(function(err, results){
           console.log(["found users", results]);
           if ( results.length == 0 ){
               res.send("wrong username/password");
           } else if ( results.length == 1){
               var user = results[0];
               if ( rememberMe == "true"){
                    res.cookie('userid', user._id + sha1(user.username + "%%" + user.password), { maxAge: 9000000000000000 });
               }else{
                   res.cookie('guy','value');
               }
               res.send("welcome. you are logged in");
           } else {
               console.log("ERROR! We have an error!!!");
               res.send("internal error");
           }

       });
   });

});


//

app.get("/friends", function(req, res){

    var username = req.query.username;


    res.send("these are your friends");
});

app.get("/signup", function(req, res){

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

var port = '1222';
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