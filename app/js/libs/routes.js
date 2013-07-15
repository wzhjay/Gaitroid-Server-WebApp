var util = require('util');
var PatientModel = require('../../../server').PatientModel;
var DoctorModel = require('../../../server').DoctorModel;
var Hashes = require('jshashes');
var SHA1 = new Hashes.SHA1;

console.log("SHA1 testing: " + SHA1.hex("Gaitroid"));

exports.routes = function (app) {
 	
	/*======================================= Site ===========================================*/
	// check the login status, redirect to login page if user haven't login in
	function checkAuth(req, res, next) {
	  if (!req.session.authenticated) {
	    res.send('You are not authorized to view this page');
	    res.redirect('/login');
	  } else {
	    next();
	  }
	}

	app.get('/', checkAuth, function (req, res, next) {
		console.log('request from: ' + req.connection.remoteAddress);
		res.sendfile('app/index.html');
	}); 

	app.get('/login', function(req, res) {
		console.log('request from: ' + req.connection.remoteAddress);
	    res.sendfile('app/html/login.html');
	});
 
	app.post('/login', function (req, res, next) {
		console.log('request from: ' + req.connection.remoteAddress);
 		if(req.body.username && req.body.password) {
 			console.log("login: username" + req.body.username + " password:" + req.body.password);
 			PatientModel.find({'username': req.body.username, 'password': req.body.password}, function(err, person) {
			  if(err) {
			    console.log(err);
			  }
			  else {
			    console.log("_id: " + person[0]._id);
			    if(person.length == 1) {
	 				req.session.authenticated = true;
	 				res.cookie('username', person[0].username, {expire: new Date() + 90000000, maxAge: 90000000});
	 				res.cookie('_id', person[0]._id, {expire: new Date() + 90000000, maxAge: 90000000});
	 				console.log("cookie", req.cookies._id);
					res.redirect('/');
	 			}
	 			else if(person.length > 1) {
	 				// toast message, more than one users found, same username
	 				res.redirect('/login');
	 			}
	 			else {
	 				// toast message, cannot find user
	 				res.redirect('/login');
	 			}
			  }
			})
 		}
 		else {
 			// toast message, fill in both username and password
 		}
	});
 	
 	app.get('/patient_signup', function(req, res) {
 		console.log('request from: ' + req.connection.remoteAddress);
	    res.sendfile('app/html/patient_signup.html');
	});
 
	app.post('/patient_signup', function (req, res, next) {
 		console.log('request from: ' + req.connection.remoteAddress);
 		var formContents = req.body;
 		console.log("get patient_signup data:" + JSON.stringify(req.body));

 		var Patient = new PatientModel({
 			username: formContents.username,
 			password: SHA1.hex(formContents.password),
 			patient_profile: [{
 				firstname: formContents.firstname,
 				lastname: formContents.lastname,
 				gender: formContents.gender,
 				email: formContents.email,
 				phone: formContents.phone,
 				address: [{
 					country: formContents.country,
 					city: formContents.city,
 					street: formContents.street,
 					postcode: formContents.postcode
 				}]
 			}]
		});
		Patient.save( function( err ) {
			if( !err ) {
				console.log( 'new patient created' );
				res.redirect('/login');
			} else {
				console.log( err );
				res.redirect('/patient_signup');
			}
		});
	});

	app.get('/logout', function (req, res, next) {
		console.log('request from: ' + req.connection.remoteAddress);
		delete req.session.authenticated;
		res.clearCookie('username');
		res.clearCookie('_id');
		res.redirect('/');
	});


	/*======================================== APIs ========================================*/

	app.get( '/api', function( request, response ) {
		response.send( 'Library API is running' );
	});

	//Get a list of all patients
	app.get('/api/Patients', checkAuth, function (req, res, next) {
		console.log('request from: ' + req.connection.remoteAddress);
		return PatientModel.find( function( err, Patients ) {
			if( !err ) {
				console.log(JSON.stringify(Patients));
				return res.send( Patients );
			} else {
				return console.log( err );
			}
		});
	});

	//Get a single Patient by id
	app.get( '/api/Patients/:id', checkAuth, function( request, response ) {
		console.log('request from: ' + req.connection.remoteAddress);
		return PatientModel.findById( request.params.id, function( err, Patient ) {
			if( !err ) {
				return response.send( Patient );
			} else {
				return console.log( err );
			}
		});
	});
};