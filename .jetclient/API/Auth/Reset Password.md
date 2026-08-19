```toml
name = 'Reset Password'
description = '{{baseUrl}}/api/v1/auth/reset-password'
method = 'POST'
url = '{{baseUrl}}/api/v1/auth/reset-password'
sortWeight = 6000000
id = 'abd2012f-6fa0-4e58-a0bd-1cf0bfe54708'

[auth]
type = 'NO_AUTH'

[body]
type = 'JSON'
raw = '''
{
    "token": "JYI37rUWYUBBlKg9VrQu5_BEzZD6eJhdz5mIE9JYBvU",
    "newPassword": "SecurePass123!"
}'''
```
