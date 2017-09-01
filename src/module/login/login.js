import Vue from 'vue';
import app from './login.vue';

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
