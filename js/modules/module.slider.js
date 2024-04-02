'use strict';
const $ = require('jquery');
const slick = require('slick-carousel');
module.exports = function (el) {
  if (document.querySelector(el)) {
    $('.template').on('click', function () {
      console.log('fire');
      let title = $(this).find('.title').html();
      let referenceNumber = $(this).find('.reference-num').html();
      let image = $(this).find('.slider-holder li');
      let imageNum = image.length;
      $('#title').text(title);
      $('.reference-num-container').text(referenceNumber);
      $(image).each(function (i, e) {
        $('.slider').append(`<div class="image"><img src="${this.innerText}" /></div>`);
      });

      let num = 0;
      $('#slider-box .image img').on('load', function () {
        num++;
        if (num === imageNum) {
          document.querySelector('body').classList.add('overflow-nav');
          document.querySelector('#slider-cont').classList.add('show');
          $('.slider').slick({
            dots: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            adaptiveHeight: true,
            appendDots: '#slider-box',
            touchThreshold: 10
          });
        }
      });
    });

    const xBox = document.querySelector('#x-box');
    xBox.addEventListener('click', function () {
      document.querySelector('body').classList.remove('overflow-nav');
      document.querySelector('html').classList.remove('overflow-nav');
      document.querySelector('#slider-cont').classList.remove('show');
      $('.slider').slick('unslick');
      $('.slider').empty();
      $('#prev').addClass('invisible');
    });

    $('#prev').click(function () {
      $('.slider').slick('slickPrev');
    });

    $('.slider').on('swipe', () => {
      $('#prev').removeClass('invisible');
    });

    $('.slider').on('click', function () {
      $('.slider').slick('slickNext');
    });

    $('.slider').on('init', function (event, slick, direction) {
      if (!($('.slider .slick-slide').length > 1)) {
        $('#next').addClass('hide');
      }
    });

    $('#next').click(function () {
      $('.slider').slick('slickNext');
      let currentIndex = $('.slick-current').attr('data-slick-index');
      currentIndex = parseInt(currentIndex);
      if (currentIndex === 1) {
        $('#prev').removeClass('invisible');
      }
    });
  }
};
