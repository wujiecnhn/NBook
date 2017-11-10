/**
 * @author wujie
 * @create by 2017-9-2 14:46:54
 * @description
 */
var express = require('express');
var router = express.Router();
var jsdom = require('jsdom');
var window = jsdom.jsdom().defaultView;
var $ = require('jquery')(window);
var unirest = require('unirest');
var api = require('../common/api.conf.js');

/**
 * 抓取书籍名字及code信息
 */
router.get('/index', function(req, res, next) {

  var data = {body: {}, status: false};

  unirest.get('http://m.xs.la/')
    .end(function(response) {
      var html = response.body;
      if(!html) {
        data.msg = '请求异常';
        res.send(data);
        return false;
      }
      var beginIndex = html.indexOf('<header class="Index_Header">');
      var endIndex = html.indexOf('<script>dp()</script>');
      var $html = $(html.substring(beginIndex, endIndex));

      var body = {};
      body.qt = []; // 强推
      body.xhqh = [] // 玄幻奇幻
      body.wxxx = [] // 武侠仙侠
      body.dsyq = [] // 都市言情
      body.lsjs = [] // 历史军事
      // 书籍类别
      var $types = $html.find('.slide-item.index_sort1');
      //
      var $qt = $html.find('.slide-item.index_hot1 .hot_sale');
      $.each($qt || [], function(i, v) {
        var $v = $(v);
        var obj = {};
        obj.bCode = $v.find('a').attr('href');
        obj.title = $v.find('.title').text();
        obj.author = $v.find('.author').text();
        /*obj.review = $v.find('.review').text();
        obj.imgUrl = $v.find('img').attr('src');*/
        body.qt.push(obj);
      });
      // 玄幻奇幻
      $.each($types.eq(0).find('a') || [], function(i, v) {
        var $v = $(v);
        var obj = {};
        obj.bCode = $v.attr('href');
        obj.title = $v.find('.title').text();
        body.xhqh.push(obj);
      });
      // 武侠仙侠
      $.each($types.eq(1).find('a') || [], function(i, v) {
        var $v = $(v);
        var obj = {};
        obj.bCode = $v.attr('href');
        obj.title = $v.find('.title').text();
        body.wxxx.push(obj);
      });
      // 都市言情
      $.each($types.eq(2).find('a') || [], function(i, v) {
        var $v = $(v);
        var obj = {};
        obj.bCode = $v.attr('href');
        obj.title = $v.find('.title').text();
        body.dsyq.push(obj);
      });
      // 历史军事
      $.each($types.eq(3).find('a') || [], function(i, v) {
        var $v = $(v);
        var obj = {};
        obj.bCode = $v.attr('href');
        obj.title = $v.find('.title').text();
        body.lsjs.push(obj);
      });
      data.body = body;
      data.status = true;
      res.send(data);
    });
})

module.exports = router;
