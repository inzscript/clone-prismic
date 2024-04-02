'use strict';
const modules = require('./modules');

(function app () {
  function ready () {
    modules.init();
  }
  document.addEventListener('DOMContentLoaded', ready);
})();
