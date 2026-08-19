```toml
name = 'Forgot Password'
description = '{{baseUrl}}/api/v1/auth/forgot-password'
method = 'POST'
url = '{{baseUrl}}/api/v1/auth/forgot-password'
sortWeight = 5000000
id = 'c73bd423-8e13-494d-b05b-0924ed10fe16'

[auth]
type = 'NO_AUTH'

[body]
type = 'JSON'
raw = '''
{
    "email": "David.Fintrack@example.com"
}'''
```
