# badgr-api-client
API Client for Accessing a Badgr Server

# install
```bash
npm install @geobadges/badgr-api-client
```

# usage
# initialization
```javascript
const API = require("@geobadges/badgr-api-client");

const client = new API({ endpoint, password, username });
```

# get access token
```javascript
const { accessToken, refreshToken } = await client.getAccessToken();
// accessToken is asdfasdyfbasbdif6basdf
```

# get assertions/claims to a badge 
```javascript
const entityId = '12asd8f7glasi8df7'; // badge id
const fields = ['entityId', 'recipient']; // fields to include in return
const assertions = await client.getBadgeAssertions({ entityId, fields });
```

# get all badges
```javascript
const fields = ['entityId', 'name', 'description']; // fields to include in return
const badges = await client.getBadgeClasses({ fields });
```

# get issuer details
```javascript
const entityId = '12378t12uy3gkj1h2b31';
const fields = ['entityId', 'name'];
const issuer = await client.getIssuer({ entityId, fields });
```

# support
Email the package author at daniel@geosurge.io or post an issue at https://github.com/GeoBadges/badgr-api-client
