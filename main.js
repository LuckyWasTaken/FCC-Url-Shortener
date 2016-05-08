'use strict';

var express = require("express");
var http = require("http");
var app = express();
var shortid = require('shortid');
var validUrl = require('valid-url');
var mongo = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/urls";
var obj={
    origin:null,
    short:null
};

app.get("/new/*", function(req,res){
    var input = req.url.slice(5);
    if(validUrl.isUri(input)){
        obj.origin = input;
        obj.short = shortid.generate();
        mongo.connect(url, function(err, db) {
        if (err) throw err;
        var collection = db.collection('urls');
        collection.insert(obj, function(err, data) {
            if (err) throw err;
            db.close();
        });
        });
        res.end(JSON.stringify(obj));
    }
    else res.end("{error: 'Invalid URL'}");
});


app.get("*",function(req,res){
    var input = req.url.slice(1);
    mongo.connect(url, function(err, db) {
        if (err) throw err;
        var collection = db.collection('urls');
        collection.find({short:input}).toArray(function(arr,docs){
            if (err) throw err;
            db.close();
            var redirURL = docs[0].origin;
            //res.end(redirURL);
            res.writeHead(301,
                {Location: redirURL}
            );
            res.end();
        });
    });
});


http.createServer(app).listen(process.env.PORT);
