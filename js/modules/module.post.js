'use strict';
module.exports = function (url, payload, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = (e) => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let id = JSON.parse(xhr.responseText);
        callback(xhr, id);
      } else if (xhr.status === 400) {
        callback(xhr);
      }
    }
  };
  xhr.onerror = () => {
    console.log('error');
  };
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(payload));
};
