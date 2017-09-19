'use strict';
var jsdom = require('jsdom');
var window = jsdom.jsdom().defaultView;
var $ = require('jquery')(window);
var unirest = require('unirest');
var comm = require('../common/comm.js');

/**
 * 抓取书籍
 * @param cateId
 */
var getBook = function(cateId) {

  var page = 1;
  unirest.get('http://www.xs.la/newclass/'+cateId+'/1.html')
    .end(function(response) {
      console.log('我进来了' + cateId);
      var html = response.body;
      if(!html) return false;
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
        var code = href ? href.substr(1, href.length - 2) : '';
        var authorStr = $dv.children('dl').children('dt').children('span').text();
        var author = authorStr.substr(authorStr.indexOf('：') + 1);
        var review = $dv.children('dl').children('dd').text();
        // 存储code数组
        codeArr.push(code);

        // 构建对象集合
        var book = {};
        book.code = code;
        book.name = title ? title.replace(/[\r\n]/g, '') : ''; // 去掉回车换行;
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
        var code = href ? href.substr(1, href.length - 2) : '';
        var author = $dv.children('.s4').text();
        var review = '';
        // 存储code数组
        codeArr.push(code);
        // 构建对象集合
        var book = {};
        book.code = code;
        book.name = title ? title.replace(/[\r\n]/g, '') : ''; // 去掉回车换行;
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
        var code = href ? href.substr(1, href.length - 2) : '';
        var author = $dv.children('.s5').text();
        var review = '';
        // 存储code数组
        codeArr.push(code);
        // 构建对象集合
        var book = {};
        book.code = code;
        book.name = title ? title.replace(/[\r\n]/g, '') : ''; // 去掉回车换行;
        book.author = author;
        book.brief = review;
        book.url = img;
        book.cateId = cateId;
        bookArr.push(book);
      }

      if (!codeArr.length) {
        console.log('-------------- 没有抓取到数据... --------------');
        return false;
      }

      var code_params = {};
      code_params.codes = codeArr.join(',');
      unirest.post('http://localhost:8080/grab/getByCodes')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(code_params)
        .end(function(response) {
          var body = response.body;
          console.log('总条数: ' + codeArr.length + '-------------- 重复条数: ' + body.data.count + ' --------------');
          if (body.data.count >= codeArr.length) {
            // 停止拉取 已经重复
            console.log('-------------- 停止拉取 已经重复... --------------');
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

          if(!rBookArr.length) {
            return false;
          }
          // 请求存储接口
          var params = {};
          params.books = JSON.stringify(rBookArr);
          unirest.post('http://localhost:8080/grab/save')
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(params)
            .end(function(response) {
              var body = response.body;
              if (!body || !body.status) {
                console.log(JSON.stringify(body));
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

/**
 * 抓取章节标题及Code信息
 */
var getCaption = function() {

  // 查询所有书籍
  var params = {};
  unirest.post('http://localhost:8080/grab/list')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .send(params)
    .end(function(response) {
      var body = response.body;
      if (!body || !body.status) {
        console.log(JSON.stringify(body));
        return false;
      }

      var list = body.data;
      var listLen = list.length;
      var index = 0;
      // 轮询拉取书籍章节
      comm.sleep(1000*5, function(id) {
        if(index >= listLen) {
          window.clearInterval(id);
          console.log('书籍遍历拉取章节结束');
          return false;
        }
        var book = list[index];
        index ++;
        var bookCode = book.code;
        var pageArr = [];
        var codeArr = [];
        unirest.get('http://m.xs.la/'+bookCode+'/all.html')
          .end(function(response) {
            var html = response.body;
            if(!html) {
              saveBookLog(bookCode, 1, 'html为空 请求异常');
              return false;
            }
            var beginIndex = html.indexOf('<div  id="chapterlist"');
            var endIndex = html.indexOf('<script>hf2()</script>');
            // console.log(html);
            var $html = $(html.substring(beginIndex, endIndex));

            var $p = $html.children('p');
            if(!$p || !$p.length || $p.length < 2) {
              saveBookLog(bookCode, 1, 'p标签null 没有抓取到数据');
              return false;
            }
            var pLen = $p.length;
            for(var i=1; i<pLen; i++) {
              var $a = $p.eq(i).children('a');
              var href = $a.attr('href');
              if(!href || href.split('/').length < 3) continue;
              var title = $a.text();
              var hrefArr = href.split('/');
              var code = hrefArr[2].substr(0, hrefArr[2].indexOf('.'))
              // 存储code数组
              codeArr.push(code);

              var page = {};
              page.bookCode = bookCode;
              page.name = title;
              page.code = code;
              pageArr.push(page);
            }

            if (!codeArr.length) {
              saveBookLog(bookCode, 1, '没有抓取到数据...');
              return false;
            }

            /** 检查重复 */
            var code_params = {};
            code_params.codes = codeArr.join(',');
            code_params.bookCode = bookCode;
            unirest.post('http://localhost:8080/grab/getPageByCodes')
              .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
              .send(code_params)
              .end(function(response) {
                var body = response.body;
                console.log('code: ' + bookCode + ' -------------- 总条数: ' + codeArr.length + '-------------- 重复条数: ' + body.data.count + ' --------------' + index);
                if (body.data.count >= codeArr.length) {
                  // 停止拉取 已经重复
                  console.log('-------------- 停止拉取 已经重复... --------------');
                  // response.render('index', {title: '停止拉取 已经重复...'});
                  return false;
                }

                // 重复记录
                var rCodeArr = JSON.parse(body.data.rCodeArr);
                var rCodeMap = {};
                for (var ri = 0; ri < rCodeArr.length; ri++) {
                  rCodeMap[rCodeArr[ri]] = rCodeArr[ri];
                }
                // 获取有效数据
                var rPageArr = [];
                for (var bi = 0; bi < pageArr.length; bi++) {
                  if (!rCodeMap[pageArr[bi]['code']]) {
                    rPageArr.push(pageArr[bi]);
                  }
                }

                if (!rPageArr.length) {
                  return false;
                }

                // 保存单本书籍章节集合
                var params = {};
                params.pageArr = JSON.stringify(rPageArr);
                unirest.post('http://localhost:8080/grab/savePage')
                  .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                  .send(params)
                  .end(function(response) {
                    var body = response.body;
                    if (!body || !body.status) {
                      console.log(JSON.stringify(body));
                      return false;
                    }
                    page++;
                    console.log('ok');
                  })
              });
          });
      })
    })
}

/**
 * 抓取章节标题及Code信息
 */
var getCaptionDesc = function() {

  // 查询所有书籍
  var params = {};
  unirest.post('http://localhost:8080/grab/listDesc')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .send(params)
    .end(function(response) {
      var body = response.body;
      if (!body || !body.status) {
        console.log(JSON.stringify(body));
        return false;
      }

      var list = body.data;
      var listLen = list.length;
      var index = 0;
      // 轮询拉取书籍章节
      comm.sleep(1000*5, function(id) {
        if(index >= listLen) {
          window.clearInterval(id);
          console.log('书籍遍历拉取章节结束');
          return false;
        }
        var book = list[index];
        index ++;
        var bookCode = book.code;
        var pageArr = [];
        var codeArr = [];
        unirest.get('http://m.xs.la/'+bookCode+'/all.html')
          .end(function(response) {
            var html = response.body;
            if(!html) {
              saveBookLog(bookCode, 1, 'html为空 请求异常');
              return false;
            }
            var beginIndex = html.indexOf('<div  id="chapterlist"');
            var endIndex = html.indexOf('<script>hf2()</script>');
            // console.log(html);
            var $html = $(html.substring(beginIndex, endIndex));

            var $p = $html.children('p');
            if(!$p || !$p.length || $p.length < 2) {
              saveBookLog(bookCode, 1, 'p标签null 没有抓取到数据');
              return false;
            }
            var pLen = $p.length;
            for(var i=1; i<pLen; i++) {
              var $a = $p.eq(i).children('a');
              var href = $a.attr('href');
              if(!href || href.split('/').length < 3) continue;
              var title = $a.text();
              var hrefArr = href.split('/');
              var code = hrefArr[2].substr(0, hrefArr[2].indexOf('.'))
              // 存储code数组
              codeArr.push(code);

              var page = {};
              page.bookCode = bookCode;
              page.name = title;
              page.code = code;
              pageArr.push(page);
            }

            if (!codeArr.length) {
              saveBookLog(bookCode, 1, '没有抓取到数据...');
              return false;
            }

            /** 检查重复 */
            var code_params = {};
            code_params.codes = codeArr.join(',');
            code_params.bookCode = bookCode;
            unirest.post('http://localhost:8080/grab/getPageByCodes')
              .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
              .send(code_params)
              .end(function(response) {
                var body = response.body;
                console.log('code: ' + bookCode + ' -------------- 总条数: ' + codeArr.length + '-------------- 重复条数: ' + body.data.count + ' --------------' + index);
                if (body.data.count >= codeArr.length) {
                  // 停止拉取 已经重复
                  console.log('-------------- 停止拉取 已经重复... --------------');
                  // response.render('index', {title: '停止拉取 已经重复...'});
                  return false;
                }

                // 重复记录
                var rCodeArr = JSON.parse(body.data.rCodeArr);
                var rCodeMap = {};
                for (var ri = 0; ri < rCodeArr.length; ri++) {
                  rCodeMap[rCodeArr[ri]] = rCodeArr[ri];
                }
                // 获取有效数据
                var rPageArr = [];
                for (var bi = 0; bi < pageArr.length; bi++) {
                  if (!rCodeMap[pageArr[bi]['code']]) {
                    rPageArr.push(pageArr[bi]);
                  }
                }

                if (!rPageArr.length) {
                  return false;
                }

                // 保存单本书籍章节集合
                var params = {};
                params.pageArr = JSON.stringify(rPageArr);
                unirest.post('http://localhost:8080/grab/savePage')
                  .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                  .send(params)
                  .end(function(response) {
                    var body = response.body;
                    if (!body || !body.status) {
                      console.log(JSON.stringify(body));
                      return false;
                    }
                    page++;
                    console.log('ok');
                  })
              });
          });
      })
    })
}

/**
 * 书籍抓取异常的code
 * @param code
 * @param type
 */
var saveBookLog = function (code, type, msg) {

  var params = {code: code, type: type, msg: msg};
  unirest.post('http://localhost:8080/grab/saveBookErrLog')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .send(params)
    .end(function(response) {
      var body = response.body;
      if (!body || !body.status) {
        console.log(JSON.stringify(body));
        return false;
      }
    });
}

/**
 * 章节抓取异常的code
 * @param code
 * @param type
 */
var savePagesLog = function (bookCode, code, type, msg) {

  var params = {bookCode: bookCode, code: code, type: type, msg: msg};
  unirest.post('http://localhost:8080/grab/savePagesErrLog')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .send(params)
    .end(function(response) {
      var body = response.body;
      if (!body || !body.status) {
        console.log(JSON.stringify(body));
        return false;
      }
    });
}

/**
 * 抓取小说详情
 */
var grabDetails = function () {
  // 查询所有书籍
  var params = {};
  unirest.post('http://localhost:8080/grab/list')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .send(params)
    .end(function(response) {
      var body = response.body;
      if (!body || !body.status) {
        console.log(JSON.stringify(body));
        return false;
      }
      var list = body.data;
      if(!list || !list.length){
        return ;
      }
      var list = body.data;
      var listLen = list.length;
      // 应该开启多线程
      loopPages(list);
    });
}

/**
 * 根据书记code查询该书本所有内容为空章节
 * @param bookCode
 */
var loopPages = function (bookList) {

  var count = 3598;
  var falg = true;
  comm.sleep(1000*10, function(id) { // 10秒请求一次
    if(count == bookList.length) {
      window.clearInterval(id);
      console.log('所有书籍拉取完成');
      return ;
    }
    if(falg) {
      falg = false;
      console.log('-------------书本计数: ' + (count+1));
      // 查询书籍所有空章节
      var params = {bookCode: bookList[count]['code']};
      unirest.post('http://localhost:8080/grab/getNullPagesByCode')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(params)
        .end(function(response) {
          var body = response.body;
          if (!body || !body.status) {
            console.log(JSON.stringify(body));
            falg = true;
            return false;
          }
          var list = body.data;
          if(!list || !list.length){
            falg = true;
            return ;
          }
          var listLen = list.length;
          var index = 0;
          comm.sleep(1000*10, function(id) { // 10秒请求一次
            if(index >= listLen) {
              window.clearInterval(id);
              falg = true;
              index = 0;
              console.log(bookList[count]['code'] + ' 拉取结束');
              return false;
            }
            var pages = list[index];
            index ++;
            grabContent(pages.bookCode, pages.code);
          });
        });

    }
    count ++;
  });

}

/**
 * 抓取内容
 * @param bookCode
 * @param code
 */
var grabContent = function (bookCode, code) {

  unirest.get('http://m.xs.la/'+bookCode+'/'+code+'.html')
    .end(function(response) {
      var html = response.body;
      if (!html) {
        savePagesLog(bookCode, code, 2, 'html为空 请求异常');
        return false;
      }

      var beginIndex = html.indexOf('<div id="chaptercontent"');
      var endIndex = html.indexOf('<script language="javascript">getset()</script>');
      var $html = $(html.substring(beginIndex, endIndex));
      var content = $html.html();
      var params = {bookCode: bookCode, code: code, content: content};
      unirest.post('http://localhost:8080/grab/updatePagesContent')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send(params)
        .end(function(response) {
          var body = response.body;
          if (!body || !body.status) {
            savePagesLog(bookCode, code, 2, '更新失败');
            return false;
          }
        });
      });
}

var collect = {
  getBook, getCaption, getCaptionDesc, grabDetails
};

module.exports = collect;
