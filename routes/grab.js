/**
 * @author wujie
 * @create by 2017-9-2 14:46:54
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
var grabService = require('../service/grabService.js');
var url = require('url');

/**
 * 抓取书籍名字及code信息
 */
router.get('/grab-book', function(req, res, next) {

  var arg1=url.parse(req.url,true).query;
  var cateId = arg1.cateId;
  var page = 1;
  comm.sleep(1000*60, function() {
    console.log('抓取第 ' + page + ' 次...');
    page ++;
    grabService.getBook(1);
    grabService.getBook(2);
    grabService.getBook(3);
    grabService.getBook(4);
    grabService.getBook(5);
    grabService.getBook(6);
    grabService.getBook(7);
  })
  res.render('index', {title: '抓取书籍名字及code信息'});
})

/**
 * 抓取书籍章节
 */
router.get('/grab-caption', function(req, res, next) {

  grabService.getCaption();

  /*comm.sleep(60000, function() {
   console.log('抓取第 ' + page + ' 次...');
   page ++;
   grabService.getBook(1);
   })*/

  res.render('index', {title: '抓取书籍章节'});
})

/**
 * 抓取书籍章节内容
 */
router.get('/grab-details', function(req, res, next) {

  res.render('index', {title: '抓取书籍章节内容'});
})

module.exports = router;
