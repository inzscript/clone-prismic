'use strict';
const imagesLoaded = require('imagesloaded');
const $ = require('jquery');
module.exports = function (el) {
  function getPages (Ids, pageNum, index, callback) {
    let updateSection = document.querySelector(`.accordion[index="${index}"]`);
    const xhr = new XMLHttpRequest();
    xhr.onload = (e) => {
      if (xhr.status === 200) {
        let templates = JSON.parse(xhr.responseText);
        callback(templates, updateSection);
      }
    };
    xhr.onerror = () => {
      console.log('error');
    };
    xhr.open('POST', '/get-new-page-data');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ ids: Ids, pageNum: pageNum, index: index }));
  }

  function updateDom (data, section) {
    const name = data.map((item, i) => {
      if (item.name === undefined || item.name.length === 0) {
        return '';
      } else if (item.name[0].text === '' || item.name[0].text === undefined) {
        return '';
      } else {
        return {
          text: item.name[0].text,
          show: true
        };
      }
    });
    const description = data.map((item, i) => {
      if (item.template_description === undefined || item.template_description.length === 0) {
        return '';
      } else if (item.template_description[0].text === '' || item.template_description[0].text === undefined) {
        return '';
      } else {
        return {
          text: item.template_description[0].text,
          show: true
        };
      }
    });
    const referenceNumber = data.map((item, i) => {
      if (item.referenceNumber === undefined || item.referenceNumber.length === 0) {
        return '';
      } else if (item.referenceNumber[0].text === '' || item.referenceNumber[0].text === undefined) {
        return '';
      } else {
        return {
          text: item.referenceNumber[0].text,
          show: true
        };
      }
    });
    const images = data.map((item, i) => {
      return item.template_images.map((items, j) => {
        return `<li>${items.image.url}</li>`;
      });
    });
    const list = data.map((item, i) => {
      // transform array into string and remove commas
      const imageList = images[i].join().replace(/,/g, '');
      return `<div class="template small-12 medium-6 large-3 column">
      <img class="placeholder" src="${item.image}" alt="">
      <div class="reference-num">${(referenceNumber[i].show) ? referenceNumber[i].text : ''}</div>
      <div class="title">${(name[i].show) ? name[i].text : ''}</div>
      <div class="more-colors">${(item.color === 'Yes') ? '<span>+</span> More Colors' : ''}</div>
      ${(description[i].show) ? `<div class="description">${description[i].text}</div>` : ''}
      <ul class="slider-holder">${imageList}</ul>
      </div>`;
    });
    let scroll = $(section).offset().top - 120;
    const scrollPosition = window.scrollY;
    const el = $(section).find('.container');
    el.html(list);
    setTimeout(() => {
      console.log(scroll);
      window.scrollTo({
        top: scroll
      });
    }, 200);

    if (scroll === scrollPosition || scroll > scrollPosition || Math.abs(scroll - scrollPosition) < 100) {
      setTimeout(() => {
        $(section).find('.con').removeClass('hid');
        el.css('height', '');
      }, 200);
    }
    window.addEventListener('scroll', function scrolled (e) {
      let scrollPosition = window.scrollY;
      // console.log($(section).offset().top - 120, scrollPosition);
      if (scroll >= scrollPosition) {
        el.css('height', '');
        setTimeout(() => {
          $(section).find('.con').removeClass('hid');
        }, 200);
        window.removeEventListener('scroll', scrolled);
      }
    });
    el.find('.template').on('click', function () {
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
          // console.log('fire');
          document.querySelector('body').classList.add('overflow-nav');
          // document.querySelector('html').classList.add('overflow-nav');
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
    // hide and show new page data
  }

  function tranEnd (elm, uid, pageNum, index, updateDom) {
    setTimeout(() => {
      getPages(uid, pageNum, index, updateDom);
      elm.removeEventListener('transitionend', tranEnd);
    }, 300);
  }

  if (document.querySelector(el)) {
    // IT ALL STARTS HERE!
    const paginationlinks = $('#pagination ul li');
    paginationlinks.on('click', function (e) {
      if ($(e.target).hasClass('active')) return;
      let container = $(this).closest('.accordion').find('.container');
      let villinaContainer = container.closest('.con')[0];
      let containerHeight = container.height();
      container.height(containerHeight);
      container.closest('.con').addClass('hid');
      $('#pagination').addClass('hid');
      $(this).parent().find('li').removeClass('active');
      $(this).addClass('active');
      // uid is the url. index is the section and pageNum is what was clicked.
      let uid = window.location.pathname.replace('/', '');
      let index = $(this).closest('.accordion').attr('index');
      let pageNum = $(this).text();
      // console.log(uid, index, pageNum);
      villinaContainer.addEventListener('transitionend', tranEnd(villinaContainer, uid, pageNum, index, updateDom));
    });
  }
};
