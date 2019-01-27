var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var deviceRouter = require('./routes/device');
var searchRouter = require('./routes/search');
var googleRouter = require('./routes/google');
var slaveUtils = require('./utils/slave-utils');
var googleDriveUtils = require('./utils/google-drive-utils');
require("./discovery");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/device', deviceRouter);
app.use('/search', searchRouter);
app.use('/google', googleRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

setInterval(function() {
    console.log("Partial sync google drive started ");
    googleDriveUtils.fetchGoogleDriveData();
}, 10000);

setInterval(function() {
    console.log("Partial sync slaves started ");
    slaveUtils.syncPartialData();
  }, 10000);
setInterval(function() {
    console.log("Ping Slave started ");
    slaveUtils.pingSlave();}, 5000);


module.exports = app;
