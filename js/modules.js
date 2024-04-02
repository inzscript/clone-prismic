var Modules = {
  init: function () {
    require('./modules/module.slider')('#detail');
    require('./modules/module.collapse')('#detail');
    require('./modules/module.nav')();
    require('./modules/module.dataGrab')('#detail');
  }
};

module.exports = Modules;
