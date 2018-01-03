const axios = require('axios')
const { Base64 } = require('js-base64')
const path = require('path')
const querystring = require('querystring')

class RingCentral {
  constructor (clientId, clientSecret, server) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.server = server
    this._token = undefined
    this._timeout = undefined
    this.autoRefresh = true
  }

  token (_token) {
    if (arguments.length === 0) { // get
      return this._token
    }
    this._token = _token
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = null
    }
    if (this.autoRefresh && _token) {
      this._timeout = setTimeout(() => {
        this.refresh()
      }, _token.expires_in - 120000)
    }
  }

  async authorize ({ username, extension, password, code, redirect_uri }) {
    let data = null
    if (code) {
      data = querystring.stringify({ grant_type: 'authorization_code', code, redirect_uri })
    } else {
      data = querystring.stringify({ grant_type: 'password', username, extension, password })
    }
    const r = await axios({
      method: 'post',
      url: path.join(this.server, '/restapi/oauth/token'),
      data,
      headers: this._basicAuthorizationHeader()
    })
    this.token(r.data)
  }

  async refresh () {
    if (this._token === undefined) {
      return
    }
    const r = await axios({
      method: 'post',
      url: path.join(this.server, '/restapi/oauth/token'),
      data: querystring.stringify({ grant_type: 'refresh_token', refresh_token: this._token.refresh_token }),
      headers: this._basicAuthorizationHeader()
    })
    this.token(r.data)
  }

  async revoke () {
    if (this._token === undefined) {
      return
    }
    await axios({
      method: 'post',
      url: path.join(this.server, '/restapi/oauth/revoke'),
      data: querystring.stringify({ token: this._token.access_token }),
      headers: this._basicAuthorizationHeader()
    })
    this.token(undefined)
  }

  _basicAuthorizationHeader () {
    return { Authorization: `Basic ${Base64.encode(`${this.clientId}:${this.clientSecret}`)}` }
  }

  _bearerAuthorizationHeader () {
    return { Authorization: `Basic ${this._token.access_token}` }
  }
}

module.exports = RingCentral
