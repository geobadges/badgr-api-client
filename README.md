# badgr-api-client
API Client for Accessing a Badgr Server

# install
```bash
npm install @geobadges/badgr-api-client
```

# contributing
Your contributions are welcomed!  This repo is open to issues and pull requests. 

# usage
# initialization
```javascript
const API = require("@geobadges/badgr-api-client");

const client = new API({ endpoint, password, username });
```

# get access token
```javascript
const {
    accessToken,
    expirationDate,
    refreshToken
} = await client.getAccessToken();
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

# register a user
```javascript
const data = {
    agreedToTermsOfService: true,
    email: "first.last@example.org",
    firstName: "First Name",
    lastName: "Last Name",
    optedInToMarketing: false,
    password: "acomplexpassword",
};
const sucessful = await client.register(data);
// sucessful is true
```

# request a password reset
```javascript
const data = {
    email: "first.last@example.org"
};
const successful = await client.requestPasswordReset(data);
// successful is true if HTTP request, requesting a reset, returned successfully
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

# get available issuers
This returns issuers that the current authenticated user has access to unless you pass in an accessToken
```javascript
const fields = ['entityId', 'name'];
const issuers = await client.getIssuers({ fields });
// an array of issuer objects
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

# grant a badge to a user
```javascript
const status = await client.grant({
    badgeClassEntityId: "asl8dyb712tyev6tvdsafasdf",
    createNotification: false,
    email: "person@example.org",
    evidence = [],
    issuerEntityId: "adsfiubashfv7asgdfasdf",
    narrative = "This person earned the badge by creating a JavaScript Notebook that..."
})
```

# enable admin access
Passing in `admin: true` will basically add the `rw:serverAdmin` scope to all requests.
```javascript
const client = new API({ endpoint, password, username, admin: true });
```

# support
Email the package author at daniel@geosurge.io or post an issue at https://github.com/GeoBadges/badgr-api-client
