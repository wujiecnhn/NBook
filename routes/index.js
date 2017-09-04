/**
 * @author wujie
 * @create by 2017-9-2 15:39:09
 * @description
 */
var express = require('express');
var router = express.Router();
var logger = require('../logger');
var jsdom = require('jsdom');
var window = jsdom.jsdom().defaultView;
var $ = require('jquery')(window);
var unirest = require('unirest');
var api = require('../common/api.conf.js');
var comm = require('../common/comm.js');
var url = require('url');


router.get('/index', function(req, res, next) {
  /* logger.system.info('router index');
  logger.system.debug('router index');
  logger.system.warn('router index');
  logger.system.error('router index');
  logger.system.fatal('router index');*/

  var arg1=url.parse(req.url,true).query;
  var cateId = arg1.cateId;
  /*var page = 1;
  comm.sleep(60000, function() {
    console.log('抓取第 ' + page + ' 次...');
    page ++;
    comm.getBook(1);
    comm.getBook(2);
    comm.getBook(3);
    comm.getBook(4);
    comm.getBook(5);
    comm.getBook(6);
    comm.getBook(7);
  })*/
  res.render('index', {title: 'Vue'});
})

router.get('/login', function(req, res, next) {
  logger.system.info('router login');
  var $p = $('<p></p>');
  $p.html('123');
  $p.append('<b>111</b>');
  console.log($p.html());
  res.send($p.html());
  /* res.render('login', {title: 'Login in...'});*/
})

module.exports = router;
