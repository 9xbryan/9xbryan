const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const path = require('path');
const https = require("https");

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'qwertv12345%',
	database : 'nodelogin'
});
// Requiring file system to use local files
const fs = require("fs");
// Parsing the form of body to take
// input from forms
const bodyParser = require("body-parser");

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// Configuring express to use body-parser
// as middle-ware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
});


// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				// response.redirect('/')
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		// response.send('Welcome back, ' + request.session.username + '!');
		// Sending index.html to the browser
    	// response.sendFile(__dirname + "/index.html");
		response.sendFile(path.join(__dirname + '/index.html'));
	} else {

		response.sendFile(path.join(__dirname + '/login.html'));
		// Not logged in
		response.send('Please login to view this page! bryan');
		response.redirect('/auth');
	}
	response.end();
});
// http://localhost:3000/home
app.get('/static', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		// response.send('Welcome back, ' + request.session.username + '!');
		// Sending index.html to the browser
    	// response.sendFile(__dirname + "/index.html");
		response.sendFile(path.join(__dirname + '/static/style.css'));
	} else {
		response.sendFile(path.join(__dirname + '/login.html'));
		// Not logged in
		response.send('Please login to view this page!');
		response.redirect('/auth');
	}
	response.end();
});

app.post("/mssg", function (request, response) {

    // Logging the form body
    console.log(request.body);
	console.log(JSON.stringify(request.body, null, 4));
// response.send('Welcome back, ' + request.session.username + '!');
    // Redirecting to the root
	if (request.body.message === 'home') {
		response.sendFile(path.join(__dirname + '/home/index.html'));
		// response.redirect('/home');
	} else if (request.body.message === 'static')
		response.sendFile(path.join(__dirname + '/static/index.html'));
		// response.redirect('/static');
	else
		response.sendFile(path.join(__dirname + '/index.html'));
    // response.redirect("/home/index.html");
	response.end();
});

app.post("/static", function (request, response) {


		response.sendFile(path.join(__dirname + '/static/style.css'));

	response.end();
});


// Creating object of key and certificate
// for SSL
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

// app.listen(3000);

// Creating https server by passing
// options and app object
https.createServer(options, app)
    .listen(3000, function (request, response) {
		// console.log(JSON.stringify(options,null,4));
        console.log("Server started at http://localhost:3000/");
    });
