//Modules
var express = require('express');
var app = express();
var io      = require("socket.io");         // web socket external module
var easyrtc = require("easyrtc");           // EasyRTC external module

//Statically serve files in these directories  -easyRTC
app.use("/js", express.static(__dirname + '/easyrtc/js'));
app.use("/images", express.static(__dirname + '/easyrtc/images'));
app.use("/css", express.static(__dirname + '/easyrtc/css'));

//For my homepage
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use("/css", express.static(__dirname + '/public/css'));
app.use("/img", express.static(__dirname + '/public/img'));

// Needed to parse form data 
app.use(express.bodyParser());

//global variables
var loggedIn = false,
    password = 'test';

//Temporary home page
app.get('/', function (req, res) {
            //loggedIn = true;
    if (loggedIn == true) {
        //res.render('index', { title: "Chad is available to WebRTC" });
        res.render('index',
            { title: 'available', message: "Chad is available to WebRTC" }
        );
        console.log("homepage -logged in");
    }
    else {
        //res.render('index', { title: "Chad is NOT available to WebRTC", message: "not" });
        res.render('index',
            { title: 'not', message: "Chad is NOT available to WebRTC" }
        );
        console.log("homepage -not logged in");
    }

    //console.log(process.cwd());
});

//Serve a static login page if not logged in already
app.get('/login', function (req, res) {
    console.log('Login attempt');
    if (loggedIn == true) {
        res.sendfile(__dirname + '/easyrtc/demo_multiparty.html');
    }
    else {
        res.sendfile(__dirname + '/public/login.html');
    }
});

//Respond to POST from login form
app.post('/login', function (req, res) {
    if (loggedIn == true) {
        res.send("Already logged in.");
    }
    else {
        console.log("Posted data:" + JSON.stringify(req.body));
        if (req.body.pw == password) {
            loggedIn = true;
            res.send("logged in");
            console.log("Logged in");

            // Start EasyRTC server
            var easyrtcServer = easyrtc.listen(app, socketServer, {'apiEnable':'true'});

        }
        else { res.send("Incorrect password.") }
    }
});

//Serve a static logout page
app.get('/logout', function (req, res) {
    if (loggedIn == true) {
        res.sendfile(__dirname + '/public/logout.html');
        console.log("logout page");

    }
    else {
        res.send("Not logged in.")
    }
});

//Check the password to prevent unauthoried logouts
app.post('/logout', function (req, res) {
    console.log("Posted data:" + JSON.stringify(req.body));
    if (req.body.pw == password) {
        if (loggedIn == true) {
            loggedIn = false;
            res.send("Logged out");
            console.log("logged out");

            //Consider killing all active sessions here
            easyrtc.setOption('apiEnable', 'false');
        }
        else {
            res.send("You were already logged out");
            console.log("Attempt to logout when not logged in");
        }
    }
    else {
        console.log("Bad password attempt");
        res.send("Incorrect password");
    }
})

//Initiate a video call
app.get('/video', function(req, res){
    if (loggedIn == true) {
        res.sendfile(__dirname + '/easyrtc/demo_multiparty.html');
    }
    else {
        res.send("Chad is not available. Please try later.")
    }
});

//var webServer = app.listen(process.env.port || 8080); //original WebMatrix port
var webServer = app.listen(80);
console.log('Listening on port ' + 80);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer);