const test = require('ava')
const API = require('./index.js')

const {
  BADGR_API_CLIENT_ENDPOINT,
  BADGR_API_CLIENT_PASSWORD,
  BADGR_API_CLIENT_USER,
  BADGR_API_ISSUER_ENTITY_ID,
  BADGR_API_BADGE_CLASS_ENTITY_ID
} = process.env

test('initialization', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })

  await api.initialize()

  const accessToken = api.accessToken
  const refreshToken = api.refreshToken

  t.true(accessToken.length > 10)
  t.true(refreshToken.length > 10)
})

test('getting accessToken', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT
  })

  const {
    accessToken,
    expirationDate,
    expiresIn,
    refreshToken
  } = await api.getAccessToken({
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })

  t.true(accessToken.length > 10)
  t.true(refreshToken.length > 10)
  t.true(expirationDate instanceof Date)
  t.is(typeof expiresIn, 'number')
})

// test('revoking accessToken', async t => {
//   const api = new API({
//     debug: true,
//     endpoint: BADGR_API_CLIENT_ENDPOINT,
//     password: BADGR_API_CLIENT_PASSWORD,
//     username: BADGR_API_CLIENT_USER
//   })

//   await api.initialize()

//   await api.revokeAccessToken()
// })

test('getting backpack for accessToken', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })
  const { accessToken } = await api.getAccessToken();

  const client = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    accessToken
  })

  const backpack = await client.getBackpack({ accessToken, fields: ['entityId', 'image'] })

  t.true(backpack.length >= 1)
  t.true(backpack[0].hasOwnProperty('entityId'))
  t.true(backpack[0].hasOwnProperty('image'))
})

test('getting user profile', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })

  await api.initialize()

  const fields = ['entityId', 'firstName', 'lastName'];
  const profile = await api.getUser({ fields });
  t.true(profile.firstName.length > 0);
  t.true(profile.lastName.length > 0);
  t.true(profile.entityId.length > 10);
  t.false(profile.hasOwnProperty('emails'));
});

test('getting backpack', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })

  await api.initialize()

  const fields = ['entityId', 'issuedOn']
  const badges = await api.getBackpack({ fields })

  t.true(badges.length >= 1)
  t.true(badges[0].hasOwnProperty('entityId'))
  t.true(badges[0].hasOwnProperty('issuedOn'))
  t.false(badges[0].hasOwnProperty('badgeclass'))
})

test('getting all the badge classes', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })

  await api.initialize()

  const badges = await api.getBadgeClasses({
    fields: ['entityId', 'name']
  })

  t.true(badges.length >= 5)
  t.true(badges[0].hasOwnProperty('entityId'))
  t.true(badges[0].hasOwnProperty('name'))

  // don't return createdBy unless explicitly ask for it
  t.false(badges[0].hasOwnProperty('createdBy'))
})

test('getting all the badge assertions', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })

  await api.initialize()

  const assertions = await api.getBadgeAssertions({
    entityId: BADGR_API_BADGE_CLASS_ENTITY_ID,
    fields: ['entityId', 'name']
  })

  t.true(assertions.length >= 1)
  t.true(assertions[0].hasOwnProperty('entityId'))

  // don't return recipient unless explicitly ask for it
  t.false(assertions[0].hasOwnProperty('recipient'))
})

test('getting all available issuers', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })

  await api.initialize()

  const issuers = await api.getIssuers({
    fields: ['name', 'entityId', 'description']
  })

  t.true(issuers.length >= 1);
  t.true(issuers[0].hasOwnProperty('name'));
  t.true(issuers[0].hasOwnProperty('description'));

  t.false(issuers[0].hasOwnProperty('staff'));
});

test('getting issuer by entity id', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })

  await api.initialize()

  const issuer = await api.getIssuer({
    entityId: BADGR_API_ISSUER_ENTITY_ID,
    fields: ['name', 'entityId', 'description']
  })

  t.true(issuer.hasOwnProperty('name'))
  t.true(issuer.name.length >= 3)
  t.true(issuer.hasOwnProperty('entityId'))
  t.true(issuer.entityId.length >= 10)
  t.true(issuer.hasOwnProperty('description'))
  t.true(issuer.description.length > 10)

  // make sure staff isn't included in the return
  t.false(issuer.hasOwnProperty('staff'))
})

test('getting badge by entity id', async t => {
  const api = new API({
    debug: false,
    endpoint: BADGR_API_CLIENT_ENDPOINT,
    password: BADGR_API_CLIENT_PASSWORD,
    username: BADGR_API_CLIENT_USER
  })

  await api.initialize()

  const badge = await api.getBadge({
    entityId: BADGR_API_BADGE_CLASS_ENTITY_ID,
    fields: ['name', 'entityId', 'criteriaNarrative', 'tags']
  })

  t.true(badge.hasOwnProperty('name'))
  t.true(badge.hasOwnProperty('entityId'))
  t.true(badge.hasOwnProperty('criteriaNarrative'))
  t.true(badge.hasOwnProperty('tags'))

  // make sure issuer isn't included in the return
  t.false(badge.hasOwnProperty('issuer'))
})

test('registering a new user', async t => {
  const data = {
    agreedToTermsOfService: true,
    email: Math.random().toString(36).slice(2) + "@example.org",
    firstName: 'First',
    lastName: 'Last',
    marketingOptIn: false,
    password: Math.random().toString(36).slice(2)
  };
  const api = new API({
    debug: true,
    endpoint: BADGR_API_CLIENT_ENDPOINT
  })

  const success = await api.register(data);
  t.true(success);
});
