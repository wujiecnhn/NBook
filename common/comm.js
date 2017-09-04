'use strict';
var jsdom = require('jsdom');
var window = jsdom.jsdom().defaultView;
var $ = require('jquery')(window);
var unirest = require('unirest');

var sleep = function(sleepTime, cb) {
  setInterval(function(){
    !!cb && cb();
  }, sleepTime);
}

var collect = {
  sleep
};

module.exports = collect;