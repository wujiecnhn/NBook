import Vue from 'vue';
import app from './app.vue';

var vm = new Vue({
  el: 'html',
  data: {
    title: "index"
  },
  components: {
    'app': app
  },
  ready: function () {
  }
});
