  // Module dependencies.
  var application_root = __dirname,
    express = require( 'express' ), //Web framework
    path = require( 'path' ), //Utilities for dealing with file paths
    mongoose = require( 'mongoose' ), //MongoDB integration
    socket = require('socket.io'),
    http = require('http');

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
      country: String,
      city: String,
      street: String,
      postcode: String,

  }, {_id: false})

  var Patient_profile = new mongoose.Schema({
      firstname: {type: String, required: true},
      lastname: {type: String, required: true},
      gender: {type: String, required: true},
      email: {type: String, required: true},
      phone: String,
      created_time: {type: Date, required: true, default: Date.now},
      address: [address]

  }, {_id: false})

  var Patient = new mongoose.Schema({
      patient_id: ObjectId,
      username: {type: String, required: true},
      password: {type: String, required: true},
      patient_profile: [Patient_profile]

  })

  var Doctor_profile = new mongoose.Schema({
      firstname: {type: String, required: true},
      lastname: {type: String, required: true},
      gender: {type: String, required: true},
      email: {type: String, required: true},
      phone: String,

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

  require('./app/js/libs/routes').routes(app);

  //socket connection
  io.sockets.on('connection', function (socket) {
    socket.on('msg', function (data) {
      console.log("from phone: " + data);
      socket.broadcast.emit('news', { hello: 'hello world!' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });
  });


