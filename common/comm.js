'use strict';
var jsdom = require('jsdom');
var window = jsdom.jsdom().defaultView;
var $ = require('jquery')(window);
var unirest = require('unirest');

var sleep = function(sleepTime, cb) {
  var id = setInterval(function(){
    !!cb && cb(id);
  }, sleepTime);
}

var collect = {
  sleep
};

module.exports = collect;
