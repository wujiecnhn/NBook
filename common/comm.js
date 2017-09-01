'use strict';

var sleep = function(sleepTime) {
  for(var start = +new Date; +new Date - start <= sleepTime; ) { }
}

var config = {
  sleep
};

module.exports = config;
