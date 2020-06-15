const axios = require('axios')
const FormData = require('form-data')
const assign = require('lodash.assign')
const pick = require('lodash.pick')

const prefix = '[badgr-api-client]'

class Client {
  constructor ({ debug = false, endpoint, username, password, accessToken } = {}) {
    this.debug = debug
    this.endpoint = endpoint
    this.username = username
    this.password = password
    this.accessToken = accessToken
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

  async getAccessToken ({ endpoint, username, password } = {}) {
    try {
      if (this.debug) console.log(`${prefix} starting getAccessToken with`, { endpoint, username, password })
      endpoint = endpoint || this.endpoint
      if (this.debug) console.log(`${prefix} endpoint: ${endpoint}`)
      password = password || this.password
      if (this.debug) console.log(`${prefix} password: ${password}`)
      username = username || this.username
      if (this.debug) console.log(`${prefix} username: ${username}`)

      const url = endpoint + '/o/token'

      const formData = new FormData()
      formData.append('grant_type', 'password')
      formData.append('client_id', 'public')
      formData.append('scope', 'rw:backpack rw:issuer rw:profile')
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
}

module.exports = Client
