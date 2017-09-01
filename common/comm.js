'use strict';
var jsdom = require('jsdom');
var window = jsdom.jsdom().defaultView;
var $ = require('jquery')(window);
var unirest = require('unirest');


var sleep = function(sleepTime, cb) {
  for(var start = +new Date; +new Date - start <= sleepTime; ) { }
  !!cb && cb();
}

var getBook = function(cateId) {

  console.log('类别ID' + cateId);
  var bool = true;
  var page = 1;
  console.log(1);
  unirest.get('http://www.xs.la/newclass/'+cateId+'/1.html')
    .end(function(response) {
      console.log('我进来了');
      var html = response.body;
      // console.log(html);
      var $html = $(html);
      var $main = $html.children('#main');
      var $hotcontent = $main.children('#hotcontent').children('.ll').children('.item'); // 热门
      var $newscontent = $main.children('#newscontent').children('.l').children('ul').children('li'); // 新书
      var $clickph = $main.children('#newscontent').children('.r').children('ul').children('li'); // 点击排行

      var bookArr = [];
      var codeArr = [];

      /** 热门 1 */
      for (var i = 0; i < $hotcontent.length; i++) {
        var $dv = $hotcontent.eq(i);
        var $a = $dv.children('.image').children('a');

        // 获取数据
        var img = 'http://www.xs.la' + $a.children('img').attr('src');
        var title = $a.children('img').attr('alt');
        var href = $a.attr('href');
        var code = href.substr(1, href.length - 2);
        var authorStr = $dv.children('dl').children('dt').children('span').text();
        var author = authorStr.substr(authorStr.indexOf('：') + 1);
        var review = $dv.children('dl').children('dd').text();
        // 存储code数组
        codeArr.push(code);

        // 构建对象集合
        var book = {};
        book.code = code;
        book.name = title.replace(/[\r\n]/g, '') // 去掉回车换行;
        book.author = author;
        book.brief = review;
        book.url = img;
        book.cateId = cateId;
        bookArr.push(book);
      }

      /** 热门 2 */
      for (var i = 0; i < $newscontent.length; i++) {
        var $dv = $newscontent.eq(i);
        var $a = $dv.children('.s2').children('a');
        // 获取数据
        var img = '';
        var title = $a.text();
        var href = $a.attr('href');
        var code = href.substr(1, href.length - 2);
        var author = $dv.children('.s4').text();
        var review = '';
        // 存储code数组
        codeArr.push(code);
        // 构建对象集合
        var book = {};
        book.code = code;
        book.name = title.replace(/[\r\n]/g, ''); // 去掉回车换行;
        book.author = author;
        book.brief = review;
        book.url = img;
        book.cateId = cateId;
        bookArr.push(book);
      }
      /** 点击排行 3 */
      for (var i = 0; i < $clickph.length; i++) {
        var $dv = $clickph.eq(i);
        var $a = $dv.children('.s2').children('a');
        // 获取数据
        var img = '';
        var title = $a.text();
        var href = $a.attr('href');
        var code = href.substr(1, href.length - 2);
        var author = $dv.children('.s5').text();
        var review = '';
        // 存储code数组
        codeArr.push(code);
        // 构建对象集合
        var book = {};
        book.code = code;
        book.name = title.replace(/[\r\n]/g, ''); // 去掉回车换行;
        book.author = author;
        book.brief = review;
        book.url = img;
        book.cateId = cateId;
        bookArr.push(book);
      }

      /* for(var i=0; i<$main.length; i++) {
       var $dv = $main.eq(i);
       var $a = $dv.children('a');
       var img = $a.children('img').attr('data-original');
       var title = $a.children('.title').text();
       var href = $a.attr('href');
       var code = href.substr(1, href.length-2);
       var authorStr = $a.children('.author').text();
       var author = authorStr.substr(authorStr.indexOf('：')+1);
       var reviewStr = $dv.children('.review').text();
       var review = reviewStr.substr(reviewStr.indexOf('简介：')+3);
       /!*console.log('第'+(i+1)+'本书籍: ' + title + '       作者: ' + author + '       code: ' + code + '       简介: ' + review);*!/

       // 存储code数组
       codeArr.push(code);

       // 构建对象集合
       var book = {};
       book.code = code;
       book.name = title.replace(/[\r\n]/g, ""); //去掉回车换行;
       book.author = author;
       book.brief = review;
       book.url = img;
       book.cateId = 1;
       bookArr.push(book);
       }*/

      if (!codeArr.length) {
        bool = false;
        console.log('-------------- 没有抓取到数据... --------------');
        return false;
      }

      var code_params = {};
      code_params.codes = codeArr.join(',');
      unirest.post('http://localhost:8080/book/getByCodes')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(code_params)
        .end(function(response) {
          var body = response.body;
          console.log('总条数: ' + codeArr.length + '-------------- 重复条数: ' + body.data.count + ' --------------');
          if (body.data.count >= codeArr.length) {
            // 停止拉取 已经重复
            console.log('-------------- 停止拉取 已经重复... --------------');
            bool = false;
            // response.render('index', {title: '停止拉取 已经重复...'});
            return false;
          }

          // 重复记录
          var rCodeArr = JSON.parse(body.data.rCodeArr);
          var rCodeMap = {};
          for(var ri=0; ri<rCodeArr.length; ri++) {
            rCodeMap[rCodeArr[ri]] = rCodeArr[ri];
          }
          // 获取有效数据
          var rBookArr = [];
          for(var bi=0; bi<bookArr.length; bi++) {
            if(!rCodeMap[bookArr[bi]['code']]) {
              rBookArr.push(bookArr[bi]);
            }
          }

          // 请求存储接口
          var params = {};
          params.books = JSON.stringify(rBookArr);
          unirest.post('http://localhost:8080/book/save')
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(params)
            .end(function(response) {
              var body = response.body;
              if (!body.status) {
                console.log(body.msg);
                // response.render('index', {title: body.msg});
                return false;
              }
              page++;
              console.log('ok');
              // response.render('index', {title: '成功'});
            })
        })
    })
}

var config = {
  sleep, getBook
};

module.exports = config;
