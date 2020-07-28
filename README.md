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

# get a specific badge
```javascript
const entityId = '12asd8f7glasi8df7'; // badge id
const fields = ['name', 'entityId', 'criteriaNarrative', 'tags'];
const badge = await api.getBadge({
    entityId,
    fields
})
```

# get a specific user
If you don't supply an entityId, it automatically returns the user
that you used to initialize the api client.
```javascript
/*
    The following fields are available:
    entityType, entityId, firstName, lastName, emails, url,
    telephone, agreedTermsVersion, hasAgreedToLatestTermsVersion,
    marketingOptIn, badgrDomain, hasPasswordSet, and recipient
*/
const fields = ['emails', 'entityId', 'firstName', 'lastName'];
const user = await api.getUser({
    entityId,
    fields
})
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

# get backpack
```javascript
const fields = ['entityId', 'image'];
const badges = await client.getBackpack({ fields });
// badges is an array of badges
```

# enable admin access
```javascript
const client = new API({ endpoint, password, username, admin: true });
```

# support
Email the package author at daniel@geosurge.io or post an issue at https://github.com/GeoBadges/badgr-api-client
