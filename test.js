const test = require('ava');
const API = require('./index.js');

const {
  BADGR_API_CLIENT_ENDPOINT,
  BADGR_API_CLIENT_PASSWORD,
  BADGR_API_CLIENT_USER
} = process.env;

test('initialization', async t => {

  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  });

  await api.initialize();

  const accessToken = api.accessToken;

  t.true(accessToken.length > 10);

});

test('getting accessToken', async t => {

  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT
  });

  const accessToken = await api.getAccessToken({
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  });

  t.true(accessToken.length > 10);

});
