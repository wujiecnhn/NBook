/**
 * @author qianqing
 * @create by 16-4-23
 * @description
 */
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('./logger');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var session = require('express-session');
//var cookieSession = require('cookie-session');
var RedisStore = require('connect-redis')(session);
var ejs = require('ejs');
var index = require('./routes/index');
var book = require('./routes/book');
var grab = require('./routes/grab');

var app = express();
//设置跨域访问
app.all('*', function(req, res, next) {
  var origin = req.header('Origin');
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1');
  res.header("Content-Type", "application/json;charset=utf-8");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

// view engine setup
app.set('views', path.join(__dirname, './dist/module'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use(compression());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger.express);
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
app.use(cookieParser('myunweb_'));

app.use(session({
	store: new RedisStore({
		host: "127.0.0.1",
		port: 6379,
		db: 2
	}),
	secret: 'MYun 123!@# web',
	key: 'sid',
	cookie: {secure: false, maxAge: 3 * 24 * 3600 * 1000},
	resave: false,
	saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, './dist')));

app.use('/', index);
app.use('/book', book);
app.use('/grab', grab);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
