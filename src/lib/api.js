const R = require('ramda');
const fetch = require('node-fetch');

const callGet = function callGet(endpoint, params = {}) {
  let headers = {};
  if (!R.isEmpty(params)) {
    headers = params;
  }
  return fetch(endpoint,
    {
      method: 'GET',
      headers,
    })
    .then((response) => {
      if (R.prop('ok', response)) {
        return response.json();
      }
      return null;
    });
};

const callPost = function callPost(endpoint, body, params = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (!R.isEmpty(params)) {
    Object.assign(headers, params);
  }
  return fetch(endpoint,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    .then((response) => {
      if (R.prop('ok', response)) {
        return response;
      }
      return null;
    });
};

module.exports = {
  callGet,
  callPost,
};
