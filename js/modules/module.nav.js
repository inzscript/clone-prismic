'use strict';
module.exports = function () {
  const mobileBurger = document.querySelector('#menu-icon');
  const nav = document.querySelector('#nav-menu');
  const navContainer = document.querySelector('#fix-nav');
  mobileBurger.addEventListener('click', function () {
    mobileBurger.classList.toggle('show');
    navContainer.classList.toggle('open');
    nav.classList.toggle('show');
    document.querySelector('body').classList.toggle('overflow-nav');
  });
};
