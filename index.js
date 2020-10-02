const axios = require("axios");
const FormData = require("form-data");

const assign = (dest, src) =>
    Object.keys(src).forEach(k => {
        dest[k] = src[k];
    });
const pick = (obj, keys) =>
    keys.reduce((result, k) => ({ ...result, [k]: obj[k] }), {});

const prefix = "[badgr-api-client]";

const ACCESS_TOKEN_MISSING = `${prefix} access token must be set!`;

class Client {
    constructor({
        accessToken,
        debug = false,
        endpoint,
        username,
        password,
        admin = false,
    } = {}) {
        this.debug = debug;
        this.endpoint = endpoint;
        this.username = username;
        this.password = password;
        this.accessToken = accessToken;
        this.admin = admin;
        if (this.debug)
            console.log(
                `${prefix} constructed Badgr API Client `,
                JSON.stringify(this)
            );
        this.init =
            username && password
                ? this.getAccessToken()
                : accessToken
                ? Promise.resolve({ accessToken })
                : null;
    }

    log() {
        if (this.debug)
            console.log(`${prefix} this.endpoint: ${this.endpoint}`);
        if (this.debug)
            console.log(`${prefix} this.password: ${this.password}`);
        if (this.debug)
            console.log(`${prefix} this.username: ${this.username}`);
    }

    async getAccessToken({ endpoint, username, password, admin = false } = {}) {
        try {
            if (this.debug)
                console.log(`${prefix} starting getAccessToken with`, {
                    endpoint,
                    username,
                    password,
                });
            endpoint = endpoint || this.endpoint;
            if (this.debug) console.log(`${prefix} endpoint: ${endpoint}`);
            password = password || this.password;
            if (this.debug) console.log(`${prefix} password: ${password}`);
            username = username || this.username;
            if (this.debug) console.log(`${prefix} username: ${username}`);
            admin = admin || this.admin;
            if (this.debug) console.log(`${prefix} admin: ${admin}`);

            const url = endpoint + "/o/token";

            const scopes = ["rw:backpack", "rw:issuer", "rw:profile"];
            if (admin) scopes.push("rw:serverAdmin");

            const formData = new FormData();
            formData.append("grant_type", "password");
            formData.append("client_id", "public");
            formData.append("scope", scopes.join(" "));
            formData.append("username", username);
            formData.append("password", password);

            const headers = {};
            if (formData.getHeaders) {
                assign(headers, formData.getHeaders());
            }
            if (formData.getLengthSync) {
                headers["Content-Length"] = formData.getLengthSync();
            }

            const response = await axios
                .create({ headers })
                .post(url, formData);

            const { data } = response;

            const accessToken = data.access_token;
            const refreshToken = data.refresh_token;
            const expiresIn = data.expires_in;
            const currentDate = new Date();
            const expirationDate = new Date(
                currentDate.getTime() + expiresIn * 60 * 1000
            );
            return { accessToken, refreshToken, expiresIn, expirationDate };
        } catch (error) {
            console.error("error:", error);
            throw new Error("failed to get access token");
        }
    }

    async resetPassword({
        accessToken,
        endpoint = this.endpoint,
        token,
        newPassword,
    }) {
        if (!token) {
            throw new Error(
                "[badgr-api-client] can't reset the password without a verification token.  Run client.requestPasswordReset({ email })"
            );
        }
        const url = `${endpoint}/v2/auth/forgot-password`;
        const result = {};
        try {
            const formData = new FormData();
            formData.append("token", token);
            formData.append("password", newPassword);

            const headers = {};
            if (formData.getHeaders) {
                assign(headers, formData.getHeaders());
            }
            if (formData.getLengthSync) {
                headers["Content-Length"] = formData.getLengthSync();
            }
            const response = await axios.create({ headers }).put(url, formData);
            result.data = response.data || null;
            result.success = response.data?.status?.success || false;
        } catch (error) {
            result.success = false;
            result.data = error.response.data;
        }
        return result;
    }

    async requestPasswordReset({ email, endpoint = this.endpoint }) {
        if (!email)
            throw new Error(
                "[badgr-api-client] can't reset a password without an email!"
            );
        const url = `${endpoint}/v1/user/forgot-password`;

        const formData = new FormData();
        formData.append("email", email);

        const headers = {};
        if (formData.getHeaders) {
            assign(headers, formData.getHeaders());
        }
        if (formData.getLengthSync) {
            headers["Content-Length"] = formData.getLengthSync();
        }

        const response = await axios.create({ headers }).post(url, formData);

        const { data } = response;

        return JSON.stringify(data) === "{}";
    }

    async register({
        agreedToTermsOfService = false,
        endpoint = this.endpoint,
        email,
        firstName,
        lastName,
        optedInToMarketing,
        password,
    }) {
        const url = `${endpoint}/v1/user/profile`;

        // if unsuccessful, it will throw an error
        await axios({
            url,
            method: "POST",
            data: {
                agreed_terms_service: agreedToTermsOfService,
                email,
                first_name: firstName,
                last_name: lastName,
                marketing_opt_in: optedInToMarketing,
                password,
            },
        });

        // returns true if successful
        return true;
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

    async getBadgeAssertions({
        accessToken,
        endpoint = this.endpoint,
        entityId,
        fields = ["entityId"],
    }) {
        if (!accessToken && this.init)
            accessToken = (await this.init).accessToken;
        if (!accessToken) throw new Error(ACCESS_TOKEN_MISSING);
        const response = await axios({
            params: {
                access_token: accessToken,
            },
            method: "GET",
            url: `${endpoint}/v2/badgeclasses/${entityId}/assertions`,
        });
        return response.data.result.map(assertion => pick(assertion, fields));
    }

    async getBackpack(
        {
            accessToken,
            endpoint = this.endpoint,
            fields = ["entityId", "badgeclass"],
        } = {
            endpoint: this.endpoint,
            fields: ["entityId", "badgeclass"],
        }
    ) {
        if (!accessToken && this.init)
            accessToken = (await this.init).accessToken;
        if (!accessToken) throw new Error(ACCESS_TOKEN_MISSING);
        const response = await axios({
            params: { access_token: accessToken },
            method: "GET",
            url: `${endpoint}/v2/backpack/assertions`,
        });
        return response.data.result.map(assertion => pick(assertion, fields));
    }

    async getBadgeClasses({
        accessToken,
        endpoint = this.endpoint,
        fields = ["entityId"],
    }) {
        if (!accessToken && this.init)
            accessToken = (await this.init).accessToken;
        if (!accessToken) throw new Error(ACCESS_TOKEN_MISSING);
        const response = await axios({
            params: { access_token: accessToken },
            method: "GET",
            url: `${endpoint}/v2/badgeclasses`,
        });
        return response.data.result.map(badgeClass => pick(badgeClass, fields));
    }

    async getIssuers({
        accessToken,
        endpoint = this.endpoint,
        fields = ["entityId", "name"],
    }) {
        if (!accessToken && this.init)
            accessToken = (await this.init).accessToken;
        if (!accessToken) throw new Error(ACCESS_TOKEN_MISSING);
        const response = await axios({
            params: { access_token: accessToken },
            method: "GET",
            url: `${endpoint}/v2/issuers`,
        });
        return response.data.result.map(issuer => pick(issuer, fields));
    }

    async getIssuer({
        accessToken,
        endpoint = this.endpoint,
        entityId,
        fields = ["entityId", "name"],
    }) {
        if (!entityId) throw new Error("You must supply an entityId");
        if (!accessToken && this.init)
            accessToken = (await this.init).accessToken;
        if (!accessToken) throw new Error(ACCESS_TOKEN_MISSING);
        const response = await axios({
            params: { access_token: accessToken },
            method: "GET",
            url: `${endpoint}/v2/issuers/${entityId}`,
        });
        return pick(response.data.result[0], fields);
    }

    async grant({
        accessToken,
        endpoint = this.endpoint,
        badgeClassEntityId,
        createNotification = false,
        debug = this.debug,
        email,
        evidence = [],
        issuerEntityId,
        narrative = "",
    }) {
        try {
            if (!accessToken && this.init)
                accessToken = (await this.init).accessToken;
            if (!accessToken) throw new Error(ACCESS_TOKEN_MISSING);
            if (!badgeClassEntityId)
                throw new Error("You must supply a badgeClassEntityId");
            if (!issuerEntityId)
                throw new Error("You must supply a issuerEntityId");
            if (!email)
                throw new Error(
                    "You must supply an email to grant the badge to"
                );

            const response = await axios({
                headers: { Authorization: `Bearer ${accessToken}` },
                method: "POST",
                url: `${endpoint}/v1/issuer/issuers/${issuerEntityId}/badges/${badgeClassEntityId}/assertions`,
                data: {
                    badge_class: badgeClassEntityId,
                    create_notification: createNotification,
                    evidence_items: evidence,
                    issuer: issuerEntityId,
                    narrative,
                    recipient_identifier: email,
                    recipient_type: "email",
                },
            });
            if (debug)
                console.log(
                    "[badgr-api-client.grant] response.status:",
                    response.status
                );
            if (debug)
                console.log(
                    "[badgr-api-client.grant] response.revoked :",
                    response.revoked
                );
            // eslint-disable-next-line no-prototype-builtins
            if (
                !response.hasOwnProperty("revoked") ||
                response.revoked === false
            ) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log("error:", error);
            console.log("error.data:", error.data);
            return false;
        }
    }

    async getBadge({
        accessToken,
        endpoint = this.endpoint,
        entityId,
        fields = [
            "criteriaNarrative",
            "criteriaUrl",
            "description",
            "entityId",
            "expires",
            "image",
            "issuer",
            "name",
            "tags",
        ],
    }) {
        if (!accessToken && this.init)
            accessToken = (await this.init).accessToken;
        if (!accessToken) throw new Error(ACCESS_TOKEN_MISSING);
        if (!entityId) throw new Error("You must supply an entityId");
        const response = await axios({
            params: { access_token: accessToken },
            method: "GET",
            url: `${endpoint}/v2/badgeclasses/${entityId}`,
        });
        return pick(response.data.result[0], fields);
    }

    async getUser({
        accessToken,
        endpoint = this.endpoint,
        entityId = "self",
        fields = ["emails", "entityId", "firstName", "lastName"],
    }) {
        if (!accessToken && this.init)
            accessToken = (await this.init).accessToken;
        if (!accessToken) throw new Error(ACCESS_TOKEN_MISSING);
        const response = await axios({
            params: { access_token: accessToken },
            method: "GET",
            url: `${endpoint}/v2/users/${entityId}`,
        });
        const user = response.data.result[0];
        return pick(user, fields);
    }
}

module.exports = Client;
