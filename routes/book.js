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
 * 首页
 */
router.post('/index', function(req, res, next) {

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

/**
 * 书籍信息,最新章节
 */
router.post('/info', function(req, res, next) {

  var data = {body: {}, status: false};
  var bCode = req.body.bCode;
  unirest.get('http://m.xs.la'+bCode)
    .end(function(response) {
      var html = response.body;
      if(!html) {
        data.msg = '请求异常';
        res.send(data);
        return false;
      }
      var beginIndex = html.indexOf('<body>');
      var endIndex = html.indexOf('</body>');
      var $html = $(html.substring(beginIndex, endIndex)); // 全部节点
      var $detail = $html.find('.synopsisArea_detail'); // 详情
      var $detail_p = $detail.children('p'); // 详情
      var $review = $html.find('.review').remove('a'); // 简介
      var $chapterlist = $html.find('#chapterlist'); //

      var detail = {};
      detail.bookName = $html.find('.title').html();
      detail.author = $detail.find('.author').html();
      detail.type = $detail.find('.sort').html();
      detail.status = $detail_p.eq(1).html();
      detail.upTime = $detail_p.eq(2).html();
      detail.detail = $review.html();

      //
      var list = [];
      var $pArr = $chapterlist.children('p');
      $.each($pArr || [], function(i, v) {
        var $v = $(v);
        var obj = {};
        obj.code = $v.find('a').attr('href');
        obj.title = $v.text();
        list.push(obj);
      });
      data.body.list = list;
      data.body.detail = detail;
      data.status = true;
      res.send(data);
    });
})

/**
 * 书籍目录
 */
router.post('/section', function(req, res, next) {

  var data = {body: {}, status: false};
  var bCode = req.body.bCode;
  unirest.get('http://m.xs.la'+bCode+'all.html')
    .end(function(response) {
      var html = response.body;
      if(!html) {
        data.msg = '请求异常';
        res.send(data);
        return false;
      }
      var beginIndex = html.indexOf('<div id="chapterlist"');
      var endIndex = html.indexOf('<script>hf2()</script>');
      var $html = $(html.substring(beginIndex, endIndex));

      var list = [];
      // 书籍目录
      var $pArr = $html.children('p');
      //
      $.each($pArr || [], function(i, v) {
        var $v = $(v);
        var obj = {};
        obj.code = $v.find('a').attr('href');
        obj.title = $v.text();
        list.push(obj);
      });
      data.body.list = list;
      data.status = true;
      res.send(data);
    });
})

/**
 * 章节内容
 */
router.post('/details', function(req, res, next) {

  var data = {body: {}, status: false};
  var code = req.body.code;
  unirest.get('http://m.xs.la'+code)
    .end(function(response) {
      var html = response.body;
      if(!html) {
        data.msg = '请求异常';
        res.send(data);
        return false;
      }
      var beginIndex = html.indexOf('<body>');
      var endIndex = html.indexOf('</body>');
      var $html = $(html.substring(beginIndex, endIndex)); // 全部节点
      var pb_prev = $html.find('#pb_prev').attr('href');
      var pb_next = $html.find('#pb_next').attr('href');

      var beginIndex2 = html.indexOf('<div id="chaptercontent"');
      var endIndex2 = html.indexOf('<script language="javascript">getset()</script>');
      var $html2 = $(html.substring(beginIndex2, endIndex2));
      var content = $html2.html();

      data.body.data = content;
      data.body.pb_prev = pb_prev;
      data.body.pb_next = pb_next;
      data.status = true;
      res.send(data);
    });
})

/**
 * 书籍分类
 */
router.post('/type', function(req, res, next) {

  var data = {body: {}, status: false};
  var type = req.body.type;
  unirest.get('http://m.xs.la/newclass/'+type+'/1.html')
    .end(function(response) {
      var html = response.body;
      if(!html) {
        data.msg = '请求异常';
        res.send(data);
        return false;
      }
      var beginIndex = html.indexOf('<body>');
      var endIndex = html.indexOf('</body>');
      var $html = $(html.substring(beginIndex, endIndex)); // 全部节点
      var $mainDiv = $html.find('#main').children('div');

      var list = [];
      $.each($mainDiv || [], function(i, v) {
        var $v = $(v);
        var obj = {};
        obj.bCode = $v.children('a').attr('href');
        obj.title = $v.find('.title').html();
        obj.author = $v.find('.author').html();
        list.push(obj);
      });

      data.body.list = list;
      data.status = true;
      res.send(data);
    });
})

/**
 * 书籍搜索
 */
router.post('/search', function(req, res, next) {

  var data = {body: {}, status: false};
  var name = req.body.name || '';
  name = name || '都市言情';
  unirest.get('http://zhannei.baidu.com/cse/search?q='+encodeURI(name)+'&click=1&s=1393206249994657467')
    .end(function(response) {
      var html = response.body;
      if(!html) {
        data.msg = '请求异常';
        res.send(data);
        return false;
      }
      var beginIndex = html.indexOf('<body>');
      var endIndex = html.indexOf('</body>');
      var $html = $(html.substring(beginIndex, endIndex)); // 全部节点
      var $mainDiv = $html.find('.result-list').children('div');

      var list = [];
      $.each($mainDiv || [], function(i, v) {
        var $v = $(v);
        var $result_detail = $v.find('.result-game-item-detail');
        var $result_info = $v.find('.result-game-item-info-tag');
        var href = $result_detail.children('h3').children('a').attr('href');
        var title = $result_detail.children('h3').children('a').attr('title');

        var obj = {};
        obj.bCode = href.replace('http://www.xs.la', '');
        obj.title = title;
        obj.author = $result_info.eq(0).text();
        obj.type = $result_info.eq(1).text();
        obj.upTime = $result_info.eq(2).text();
        obj.upChapter = $result_info.eq(3).text();
        list.push(obj);
      });

      data.body.list = list;
      data.status = true;
      res.send(data);
    });
})

module.exports = router;
