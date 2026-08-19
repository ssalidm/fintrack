```toml
name = 'Login User'
description = '{{baseUrl}}/api/v1/auth/login'
method = 'POST'
url = '{{baseUrl}}/api/v1/auth/login'
sortWeight = 2000000
id = 'f99d8bb1-2885-49dc-af5b-3c4df0b1c6ca'

[auth]
type = 'NO_AUTH'

[body]
type = 'JSON'
raw = '''
{
    "email": "Bushirah.Fintrack@example.com",
    "password": "SecurePass123!"
}'''
```

#### Post-response Script

```js
// Check if login was successful
if (jc.response.code === 200 || jc.response.code === 201) {
    
    // Parse the JSON response body
    const responseData = jc.response.json();

    // 1. Save tokens to Environment Variables
    if (responseData.result.accessToken) {
        // jc.collectionVariables.set("accessToken", responseData.result.accessToken);
        jc.environment.set("accessToken", responseData.result.accessToken);
    }

    if (responseData.result.refreshToken) {
        // jc.collectionVariables.set("refreshToken", responseData.result.refreshToken);
        jc.environment.set("refreshToken", responseData.result.refreshToken);
    }

    console.log("Access and Refresh tokens saved successfully!");
}
```
