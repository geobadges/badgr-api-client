const axios = require('axios')
const FormData = require('form-data')

const assign = (dest, src) => Object.keys(src).forEach(k => { dest[k] = src[k] })
const pick = (obj, keys) => keys.reduce((result, k) => ({ ...result, [k]: obj[k] }), {})

const prefix = '[badgr-api-client]'

class Client {
  constructor ({ debug = false, endpoint, username, password, accessToken, admin = false } = {}) {
    this.debug = debug
    this.endpoint = endpoint
    this.username = username
    this.password = password
    this.accessToken = accessToken
    this.admin = admin
    if (this.debug) console.log(`${prefix} constructed Badgr API Client `, JSON.stringify(this))
  }

  log () {
    if (this.debug) console.log(`${prefix} this.endpoint: ${this.endpoint}`)
    if (this.debug) console.log(`${prefix} this.password: ${this.password}`)
    if (this.debug) console.log(`${prefix} this.username: ${this.username}`)
  }

  async initialize () {
    const {
      accessToken,
      expiresIn,
      expirationDate,
      refreshToken
    } = await this.getAccessToken()
    this.accessToken = accessToken
    this.expiresIn = expiresIn
    this.expirationDate = expirationDate
    this.refreshToken = refreshToken
    if (this.debug) console.log(`${prefix} initialized`)
  }

  async getAccessToken ({ endpoint, username, password, admin = false } = {}) {
    try {
      if (this.debug) console.log(`${prefix} starting getAccessToken with`, { endpoint, username, password })
      endpoint = endpoint || this.endpoint
      if (this.debug) console.log(`${prefix} endpoint: ${endpoint}`)
      password = password || this.password
      if (this.debug) console.log(`${prefix} password: ${password}`)
      username = username || this.username
      if (this.debug) console.log(`${prefix} username: ${username}`)
      admin = admin || this.admin
      if (this.debug) console.log(`${prefix} admin: ${admin}`)

      const url = endpoint + '/o/token'

      const scopes = ['rw:backpack', 'rw:issuer', 'rw:profile']
      if (admin) scopes.push('rw:serverAdmin')

      const formData = new FormData()
      formData.append('grant_type', 'password')
      formData.append('client_id', 'public')
      formData.append('scope', scopes.join(' '))
      formData.append('username', username)
      formData.append('password', password)

      const headers = {}
      if (formData.getHeaders) {
        assign(headers, formData.getHeaders())
      }
      if (formData.getLengthSync) {
        headers['Content-Length'] = formData.getLengthSync()
      }

      const response = await axios
        .create({ headers })
        .post(url, formData)

      const { data } = response

      const accessToken = data.access_token
      const refreshToken = data.refresh_token
      const expiresIn = data.expires_in
      const currentDate = new Date()
      const expirationDate = new Date(currentDate.getTime() + expiresIn * 60 * 1000)
      return { accessToken, refreshToken, expiresIn, expirationDate }
    } catch (error) {
      console.error('error:', error)
      throw new Error('failed to get access token')
    }
  }

  async register ({
    agreedToTermsOfService = false,
    endpoint = this.endpoint,
    email,
    firstName,
    lastName,
    optedInToMarketing,
    password
  }) {
    const url = `${endpoint}/v1/user/profile`
    console.log('url:', url)

    // if unsuccessful, it will throw an error
    await axios({
      url,
      method: 'POST',
      data: {
        agreed_terms_service: agreedToTermsOfService,
        email,
        first_name: firstName,
        last_name: lastName,
        marketing_opt_in: optedInToMarketing,
        password
      }
    })

    // returns true if successful
    return true
  }

  // async revokeAccessToken ({ endpoint, accessToken } = {}) {
  //   if (this.debug) console.log(`${prefix} starting revokeAccessToken with`, { endpoint, accessToken })
  //   endpoint = endpoint || this.endpoint
  //   if (this.debug) console.log(`${prefix} endpoint: ${endpoint}`)
  //   const revokeThisAccessToken = accessToken || this.accessToken
  //   if (this.debug) console.log(`${prefix} revokeThisAccessToken: ${revokeThisAccessToken}`)

  //   const entityId =
  //   const url = `${endpoint}/v2/auth/tokens/${entityId}?access_token=${this.accessToken}`;
  //   console.log("url:", url);
  //   const response = await axios.delete(url)
  //   console.log("response:", response);
  // }

  async getBadgeAssertions ({ accessToken = this.accessToken, endpoint = this.endpoint, entityId, fields = ['entityId'] }) {
    const response = await axios({
      params: { access_token: accessToken },
      method: 'GET',
      url: `${endpoint}/v2/badgeclasses/${entityId}/assertions`
    })
    return response.data.result.map(assertion => pick(assertion, fields))
  }

  async getBackpack ({
    accessToken = this.accessToken,
    endpoint = this.endpoint,
    fields = ['entityId', 'badgeclass']
  } = {
    accessToken: this.accessToken,
    endpoint: this.endpoint,
    fields: ['entityId', 'badgeclass']
  }) {
    const response = await axios({
      params: { access_token: accessToken },
      method: 'GET',
      url: `${endpoint}/v2/backpack/assertions`
    })
    return response.data.result.map(assertion => pick(assertion, fields))
  }

  async getBadgeClasses ({ accessToken = this.accessToken, endpoint = this.endpoint, fields = ['entityId'] }) {
    const response = await axios({
      params: { access_token: accessToken },
      method: 'GET',
      url: `${endpoint}/v2/badgeclasses`
    })
    return response.data.result.map(badgeClass => pick(badgeClass, fields))
  }

  async getIssuers ({ accessToken = this.accessToken, endpoint = this.endpoint, fields = ['entityId', 'name'] }) {
    if (!accessToken) throw new Error('Access Token must be set')
    const response = await axios({
      params: { access_token: accessToken },
      method: 'GET',
      url: `${endpoint}/v2/issuers`
    })
    return response.data.result.map(issuer => pick(issuer, fields))
  }

  async getIssuer ({ accessToken = this.accessToken, endpoint = this.endpoint, entityId, fields = ['entityId', 'name'] }) {
    if (!entityId) throw new Error('You must supply an entityId')
    if (!accessToken) throw new Error('Access Token must be set')
    const response = await axios({
      params: { access_token: accessToken },
      method: 'GET',
      url: `${endpoint}/v2/issuers/${entityId}`
    })
    return pick(response.data.result[0], fields)
  }

  async getBadge ({
    accessToken = this.accessToken,
    endpoint = this.endpoint,
    entityId,
    fields = [
      'criteriaNarrative',
      'criteriaUrl',
      'description',
      'entityId',
      'expires',
      'image',
      'issuer',
      'name',
      'tags'
    ]
  }) {
    if (!entityId) throw new Error('You must supply an entityId')
    if (!accessToken) throw new Error('Access Token must be set')
    const response = await axios({
      params: { access_token: accessToken },
      method: 'GET',
      url: `${endpoint}/v2/badgeclasses/${entityId}`
    })
    return pick(response.data.result[0], fields)
  }

  async getUser ({
    accessToken = this.accessToken,
    endpoint = this.endpoint,
    entityId = 'self',
    fields = [
      'emails',
      'entityId',
      'firstName',
      'lastName'
    ]
  }) {
    if (!accessToken) throw new Error('Access Token must be set')
    const response = await axios({
      params: { access_token: accessToken },
      method: 'GET',
      url: `${endpoint}/v2/users/${entityId}`
    })
    const user = response.data.result[0]
    return pick(user, fields)
  }
}

module.exports = Client
