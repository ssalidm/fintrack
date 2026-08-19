```toml
name = 'Logout User'
description = '{{baseUrl}}/api/v1/auth/logout'
method = 'POST'
url = '{{baseUrl}}/api/v1/auth/logout'
sortWeight = 3000000
id = '4d06a0c4-db4d-4665-846a-ef5ddc8eafc6'
```

#### Post-response Script

```js
// Check if the logout request was successful (HTTP status 200 or 204)
if (jc.response.code === 200 || jc.response.code === 204) {

    // 1. Clear from environment Variables
    jc.environment.unset("accessToken");
    jc.environment.unset("refreshToken");

    // 1. Clear from Collection Variables
    jc.collectionVariables.unset("accessToken");
    jc.collectionVariables.unset("refreshToken");

    // 3. Clear from Global Variables
    jc.globals.unset("accessToken");
    jc.globals.unset("refreshToken");

    console.log("JWT token successfully cleared from Postman");
}
```
