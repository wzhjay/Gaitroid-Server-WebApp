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
  var fs = require('fs');

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
      phone: String,
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
      country: {type: String, default: "Singapore"},
      city: {type: String, default: "Singapore"},
      address: {type: String, default: "Unknow"},
      postcode: {type: Number, default: 000000}
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

  var Test = new mongoose.Schema({
      test_id: ObjectId,
      userid: {type: String, required: true},
      created_time: {type: Date, required: true, default: Date.now},
      due_time: {type: Date, requred: true},
      content: {type: String, required: true},
      speed: {type: String, required: true}
  })

  var PatientModel = mongoose.model('Patient', Patient);
  var DoctorModel = mongoose.model('Doctor', Doctor);
  var TestModel = mongoose.model('Test', Test)

  exports.PatientModel = PatientModel;
  exports.DoctorModel = DoctorModel;
  exports.TestModel = TestModel;

  // PatientModel.findOne({'username': "wzhjay"}, function(err, person) {
  //   if(err) {
  //     console.log("shit");
  //   }
  //   else {
  //     console.log("%s", person.username);
  //   }
  // })

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
      res.cookie('username', "");
      res.cookie('_id', "");
      res.cookie('lastname', "");
      res.cookie('firstname', "");
      res.cookie('role', "");
      res.redirect('/doctor_login');
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

  app.get('/patient_login', function(req, res) {
    console.log('request from: ' + req.connection.remoteAddress);
      res.sendfile('app/html/patient_login.html');
  });
  
  app.get('/doctor_login', function(req, res) {
    console.log('request from: ' + req.connection.remoteAddress);
      res.sendfile('app/html/doctor_login.html');
  });

  app.post('/patient_login', function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    if(req.body.username && req.body.password) {
      console.log("patient_login: username:" + req.body.username + " password:" + req.body.password);
      PatientModel.find({'username': req.body.username, 'password': SHA1.hex(req.body.password)}, function(err, person) {
        if(err) {
          console.log(err);
        }
        else {
          if(person.length == 1) {
            console.log("_id: " + person[0]._id);
            console.log("name: " + person[0].patient_profile[0].lastname);
            req.session.authenticated = true;
            res.cookie('username', person[0].username, {expire: new Date() + 90000000, maxAge: 90000000});
            res.cookie('_id', person[0]._id, {expire: new Date() + 90000000, maxAge: 90000000});
            res.cookie('firstname', person[0].patient_profile[0].firstname);
            res.cookie('lastname', person[0].patient_profile[0].lastname);
            res.cookie('role', 'patient');
            console.log("cookie", req.cookies._id);
            res.redirect('/');
          }
          else if(person.length > 1) {
            // toast message, more than one users found, same username
            res.redirect('/patient_login');
          }
          else {
            // toast message, cannot find user
            res.redirect('/patient_login');
          }
        }
      })
    }
    else {
      // toast message, fill in both username and password
    }
  });

  app.post('/doctor_login', function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    if(req.body.username && req.body.password) {
      console.log("doctor_login: username:" + req.body.username + " password:" + req.body.password);
      console.log("doctor_login: SHA password:" + SHA1.hex(req.body.password));
      DoctorModel.find({'username': req.body.username, 'password': SHA1.hex(req.body.password)}, function(err, person) {
        if(err) {
          console.log(err);
        }
        else {
          if(person.length == 1) {
            console.log("_id: " + person[0]._id);
            console.log("name: " + person[0].doctor_profile[0].lastname);
            req.session.authenticated = true;
            res.cookie('username', person[0].username, {expire: new Date() + 90000000, maxAge: 90000000});
            res.cookie('_id', person[0]._id, {expire: new Date() + 90000000, maxAge: 90000000});
            res.cookie('firstname', person[0].doctor_profile[0].firstname);
            res.cookie('lastname', person[0].doctor_profile[0].lastname);
            res.cookie('role', 'doctor');
            console.log("cookie", req.cookies._id);
            res.redirect('/');
          }
          else if(person.length > 1) {
            // toast message, more than one users found, same username
            res.redirect('/doctor_login');
          }
          else {
            // toast message, cannot find user
            res.redirect('/doctor_login');
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
        res.redirect('/patient_login');
      } else {
        console.log( err );
        res.redirect('/patient_signup');
      }
    });
  });

  app.post('/doctor_signup', function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    var formContents = req.body;
    console.log("get doctor_signup data:" + JSON.stringify(req.body));

    var Doctor = new DoctorModel({
      username: formContents.username,
      password: SHA1.hex(formContents.password),
      doctor_profile: [{
        firstname: formContents.firstname,
        lastname: formContents.lastname,
        gender: formContents.gender,
        email: formContents.email,
        phone: formContents.phone,
        age: formContents.age,
        hospital: [{
          name: formContents.hospital_name,
          country: formContents.hospital_country,
          city: formContents.hospital_city,
          address: formContents.hospital_addr,
          postcode: formContents.hospital_postcode
        }]
      }]
    });
    Doctor.save( function( err ) {
      if( !err ) {
        console.log( 'new doctor created' );
        res.redirect('/doctor_login');
      } else {
        console.log( err );
        res.redirect('/doctor_signup');
      }
    });
  });

  app.get('/logout', function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    delete req.session.authenticated;
    res.clearCookie('username');
    res.clearCookie('_id');
    res.clearCookie('firstname');
    res.clearCookie('lastname');
    res.clearCookie('name');
    res.clearCookie('role');
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

  //Get a single Patient by username
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

  //Get a list of all patients
  app.get('/api/Doctors', checkAuth, function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    return DoctorModel.find( function( err, Doctors ) {
      if( !err ) {
        console.log(JSON.stringify(Doctors));
        return res.send( Doctors );
      } else {
        return console.log( err );
      }
    });
  });

  //Get a single Doctor by username
  app.get( '/api/Doctors/:username', checkAuth, function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    return DoctorModel.find( {'username': req.params.username}, function(err, Doctor) {
      if( !err ) {
        console.log(JSON.stringify(Doctor));

        io.sockets.on('connection', function (socket) {
            socket.emit('doctor', {Doctor: JSON.stringify(Doctor)});
        });
        res.sendfile('app/html/doctor_home.html'); 
        //return res.send( Doctor );
      } else {
        return console.log( err );
      }
    });
  });

  /*======================================== Android APIs ========================================*/

  //Get a single Patient by username
  app.get( '/api/patient/:username/:password', function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    if(req.params.username && req.params.password) {
      console.log("patient_api_login: username:" + req.params.username + " password:" + req.params.password);
      console.log("patient_api_login: SHA password:" + SHA1.hex(req.params.password));
      PatientModel.find({'username': req.params.username, 'password': SHA1.hex(req.params.password)}, function(err, person) {
        if(err) {
          console.log(err);
        }
        else {
          if(person.length == 1) {
            console.log("_id: " + person[0]._id);
            console.log("name: " + person[0].patient_profile[0].lastname);

            res.send(person);
          }
          else {
            // toast message, cannot find user
            res.send(null);
          }
        }
      })
    }
    else {
      // toast message, fill in both username and password
    }
  });

  //Get sensor data from android phone
  app.get( '/gaitroid_data', checkAuth, function (req, res, next) {
    console.log('request fro m: ' + req.connection.remoteAddress);
    //socket connection
    io.sockets.on('connection', function (socket) {
      socket.on('gaitroid_data_0', function (data) {
        console.log("gaitroid_data_0: " + data);
        socket.broadcast.emit('gaitroid_data_0', data);
      });

      socket.on('gaitroid_data_1', function (data) {
        console.log("gaitroid_data_1: " + data);
        socket.broadcast.emit('gaitroid_data_1', data);
      });
    });
    res.sendfile('app/html/gaitroid_data.html'); 
  });

  // data file upload
  app.post('/api/dataFileUpload/:userid', function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    console.log(__dirname);
    console.log(req.files);
    fs.readFile(req.files.uploadedfile.path, function (err, data) {
      var newPath = __dirname + "/uploads/" + req.params.userid + "/" + req.files.uploadedfile.name;

      if (path.existsSync(__dirname + "/uploads/" + req.params.userid)) { 
        console.log('Directory existed');

        fs.writeFile(newPath, data, function (err) {
        if (err) throw err;
          res.redirect("back");
        });
      }
      else {
        fs.mkdir(__dirname + "/uploads/" + req.params.userid, 0777, function (err) {
          if (err) {
              console.log(err);
          } else {
              console.log('Directory created');

              fs.writeFile(newPath, data, function (err) {
              if (err) throw err;
                res.redirect("back");
              });
            }
        });
      }
    });
  });

  // send data from web to phone app
  app.post('/api/sendPatientsTest', function (req, res, next) {
    console.log('request from: ' + req.connection.remoteAddress);
    var formContents = req.body;
    var users = formContents.selected_patients;
    var speed = formContents.checkSpeed;
    var content = formContents.send_text;
    var due_time = formContents.due_date;

    console.log("testing: " + formContents.selected_patients);
    console.log("testing: " + formContents.due_date);
    console.log("testing: " + formContents.send_text);
    console.log("testing: " + formContents.checkSpeed);

    res.send({status:0});

    for(var i=0; i < users.length; i++) {
      // var d = new Date(due_time.substring(6, 10), due_time.substring(0 ,2), due_time.substring(3, 5));
      // var localTime =  d.getTime() + 28800000;
      var Test = new TestModel({
        userid: users[i],
        content:content,
        speed:speed,
        due_time:due_time
      });

      Test.save( function( err ) {
        if( !err ) {
          console.log( 'new test created' );
          //res.redirect('/patient_login');
        } else {
          console.log( err );
          //res.redirect('/patient_signup');
        }
      });
    }
  });


  // get patients test tasks from db
  app.get('/api/getPatientTest/:userid', function (req, res, next){
    console.log('request from: ' + req.connection.remoteAddress);
    if(req.params.userid) {
      console.log('patient_api_getTest: _id: ' + req.params.userid);
      TestModel.find({'userid': req.params.userid}, function(err, test){
        if(err) {
          console.log(err);
        }
        else{
          if(test.length > 0) {

            for(var i=0; i<test.length; i++) {
              var due_time = test[i].due_time;
                console.log(due_time);
                console.log(Date.now());
                console.log(Date.parse(due_time) + 28800000); // 28800000 is 8 hr
                var due = Date.parse(due_time) + 28800000;
                if(Date.now() > due) {
                    // overdue, delete
                    TestModel.remove({_id:test[i]._id}, function(err, test){
                      if (!err) {
                        console.log(test + " removed!");
                      }
                      else {
                        console.log(err);
                      }
                    });

                    delete test[i];
                }       
            }

            res.send(test);
          }
          else{
            res.send(null);
          }
        }
      })
    }
    else {
      // toast message, invalid userid, cannot find user
    }
  });

