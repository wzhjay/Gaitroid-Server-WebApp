  // Module dependencies.
  var application_root = __dirname,
    express = require( 'express' ), //Web framework
    path = require( 'path' ), //Utilities for dealing with file paths
    mongoose = require( 'mongoose' ), //MongoDB integration
    socket = require('socket.io'),
    http = require('http');
  
  var util = require('util');
  var Hashes = require('jshashes');
  var SHA1 = new Hashes.SHA1;
  
  //Create server
  var app = express();
  var server = http.createServer(app).listen((3000), function(){
    console.log("Express server on)");
  });
  var io = socket.listen(server);

  //Connect to database
  mongoose.connect( 'mongodb://localhost/gaitroid_database' );
  var db = mongoose.connection;
  var ObjectId = mongoose.Schema.ObjectId;

  var address = new mongoose.Schema({
      country: {type: String, default: "Singapore"},
      city: {type: String, default: "Singapore"},
      street: String,
      postcode: String,

  }, {_id: false})

  var Patient_profile = new mongoose.Schema({
      firstname: {type: String, required: true},
      lastname: {type: String, required: true},
      gender: {type: String, required: true, default: "male"},
      email: {type: String, required: true},
      phone: Number,
      age: {type: Number, required: true, min: 1, max: 100},
      created_time: {type: Date, required: true, default: Date.now},
      address: [address]

  }, {_id: false})

  var Patient = new mongoose.Schema({
      patient_id: ObjectId,
      username: {type: String, required: true},
      password: {type: String, required: true},
      patient_profile: [Patient_profile]

  })

  var Hospital = new mongoose.Schema({
      name: {type: String, default: "Unknow"},
      address: {type: String, default: "Unknow"},
      postcode: {type: Number, default: "Unknow"}
  }, {_id: false})

  var Doctor_profile = new mongoose.Schema({
      firstname: {type: String, required: true},
      lastname: {type: String, required: true},
      gender: {type: String, required: true, default: "male"},
      email: {type: String, required: true},
      phone: Number,
      age: {type: Number, required: true, min: 1, max: 100},
      created_time: {type: Date, required: true, default: Date.now},
      hospital: [Hospital]

  }, {_id: false})

  var Doctor = new mongoose.Schema({
      doctor_id: ObjectId,
      username: {type: String, required: true},
      password: {type: String, required: true},
      doctor_profile: [Doctor_profile]
  })

  var PatientModel = mongoose.model('Patient', Patient);
  var DoctorModel = mongoose.model('Doctor', Doctor);

  exports.PatientModel = PatientModel;
  exports.DoctorModel = DoctorModel;

  PatientModel.findOne({'username': "wzhjay"}, function(err, person) {
    if(err) {
      console.log("shit");
    }
    else {
      console.log("%s", person.username);
    }
  })

  // Configure server
  app.configure( function() {

    app.use(express.cookieParser('That is a secret'));
    app.use(express.session({ secret: 'That is a secret' }));

    app.use( express.bodyParser() );

    //checks request.body for HTTP method overrides
    app.use( express.methodOverride() );

    //perform route lookup based on url and HTTP method
    app.use( app.router );

    //Where to serve static content
    app.use( express.static( path.join( application_root, '/app') ) );

    //Show all errors in development
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));

  });

  //require('./app/js/libs/routes').routes(app);

  //socket connection
  // io.sockets.on('connection', function (socket) {
  //   socket.on('msg', function (data) {
  //     console.log("from phone: " + data);
  //     socket.broadcast.emit('news', { hello: 'hello world!' });
  //     socket.on('my other event', function (data) {
  //       console.log(data);
  //     });
  //   });
  // });



  /////////////////////////////////////////////// routers ///////////////////////////////////////////////

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

  app.get('/', function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    res.sendfile('app/index.html');
  }); 

  app.get('/Patients', checkAuth, function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    res.sendfile('app/html/patients.html');
  }); 

  app.get('/Doctors', checkAuth, function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    res.sendfile('app/html/doctors.html');
  });

  app.get('/Waves', function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    res.sendfile('app/html/waves.html');
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
          if(person.length == 1) {
          console.log("_id: " + person[0]._id);
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

  app.get('/doctor_signup', function(req, res) {
    console.log('request from: ' + req.connection.remoteAddress);
      res.sendfile('app/html/doctor_signup.html');
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
        age: formContents.age,
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
  app.get( '/api/Patients/:username', checkAuth, function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    return PatientModel.find( {'username': req.params.username}, function(err, Patient) {
      if( !err ) {
        console.log(JSON.stringify(Patient));

        io.sockets.on('connection', function (socket) {
            socket.emit('patient', {Patient: JSON.stringify(Patient)});
        });
        res.sendfile('app/html/patient_home.html'); 
        //return res.send( Patient );
      } else {
        return console.log( err );
      }
    });
  });