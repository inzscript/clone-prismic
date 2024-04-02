'use strict';
module.exports = function (el) {
  let w = window;
  let windowWidth = w.innerWidth;
  let accordion = document.querySelectorAll('.accordion');
  let accordionContainer = document.querySelectorAll('.container');
  let collapseBtn = document.querySelectorAll('.section-headline');
  function add () {
    accordion[0].classList.add('open');
    accordion[0].previousElementSibling.classList.add('open');
    for (let i = 0; i < accordionContainer.length; i++) {
      accordionContainer[i].classList.add('hidden');
    }

    // Add click event to each headline section
    for (let i = 0; i < collapseBtn.length; i++) {
      collapseBtn[i].addEventListener('click', addClick);
    }
  }

  function remove () {
    for (let i = 0; i < accordionContainer.length; i++) {
      // Remove hidden Class on desk/tablet size
      accordionContainer[i].classList.remove('hidden');
      // Remove unneeded class on desk/tablet size
      accordion[i].classList.remove('open');
      accordion[i].previousElementSibling.classList.remove('open');
      // Remove click event on desk/tablet size
      for (let i = 0; i < collapseBtn.length; i++) {
        collapseBtn[i].removeEventListener('click', addClick);
      }
    }
  }

  function toggle (active) {
    if (active.classList.contains('open')) {
      active.classList.remove('open');
    } else {
      for (let i = 0; i < accordion.length; i++) {
        if (accordion[i].classList.contains('open')) {
          accordion[i].classList.remove('open');
        }
      }
      active.classList.add('open');
    }
  }

  function accordionResize () {
    windowWidth = w.innerWidth;
    (windowWidth <= 639) ? add() : remove();
  }

  function addClick () {
    let choosen = this.getAttribute('index');
    let current = document.querySelector(`.accordion[index="${choosen}"]`);
    // if ()
    if (current.previousElementSibling.classList.contains('top-section')) {
      current.previousElementSibling.classList.toggle('open');
    }
    toggle(current);
  }

  if (document.querySelector(el)) {
    accordionResize();
    w.addEventListener('resize', accordionResize);
    // Setup index attributes
    for (let i = 0; i < accordion.length; i++) {
      accordion[i].setAttribute('index', i);
      collapseBtn[i].setAttribute('index', i);
    }
  }
};
