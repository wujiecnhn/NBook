/**
 * @author wujie
 * @create by 2017-9-2 14:46:54
 * @description
 */
var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var api = require('../common/api.conf.js');

/**
 * 抓取书籍名字及code信息
 */
router.get('/grab-book', function(req, res, next) {

  res.render('index', {title: 'Vue'});
})

module.exports = router;
