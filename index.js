const axios = require('axios');
const FormData = require('form-data');

const prefix = '[badgr-api-client]';

class Client {

  constructor({ debug = false, endpoint, username, password } = {}) {
    this.debug = debug;
    this.endpoint = endpoint;
    this.username = username;
    this.password = password;
    if (this.debug) console.log(`${prefix} constructed Badgr API Client`);
  }

  log() {
    if (this.debug) console.log(`${prefix} this.endpoint: ${this.endpoint}`);
    if (this.debug) console.log(`${prefix} this.password: ${this.password}`);
    if (this.debug) console.log(`${prefix} this.username: ${this.username}`);
  }

  async initialize() {
    this.accessToken = await this.getAccessToken();
    if (this.debug) console.log(`${prefix} initialized`);
  }

  async getAccessToken({ endpoint, username, password } = {}) {
    try {
      if (this.debug) console.log(`${prefix} starting getAccessToken with`, { endpoint, username, password });
      endpoint = endpoint || this.endpoint;
      if (this.debug) console.log(`${prefix} endpoint: ${endpoint}`);
      password = password || this.password;
      if (this.debug) console.log(`${prefix} password: ${password}`);
      username = username || this.username;
      if (this.debug) console.log(`${prefix} username: ${username}`);

      const url = endpoint + '/o/token';

      const formData = new FormData();
      formData.append("grant_type", "password");
      formData.append("client_id", "public");
      formData.append("scope", "rw:backpack rw:issuer rw:profile");
      formData.append("username", username);
      formData.append("password", password);

      const headers = {
        ...formData.getHeaders(),
        "Content-Length": formData.getLengthSync()
      };

      const response = await axios
      .create({ headers })
      .post(url, formData);

      return response.data.access_token;
    } catch (error) {
      console.error("error:", error);
      throw new Error("failed to get access token");
    }
  }
}

module.exports = Client;
