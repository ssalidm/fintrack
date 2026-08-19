```toml
name = 'Register User'
description = '{{baseUrl}}/api/v1/auth/register'
method = 'POST'
url = '{{baseUrl}}/api/v1/auth/register'
sortWeight = 1000000
id = '0149365f-e72d-47a1-9e85-171a9192309a'

[auth]
type = 'NO_AUTH'

[body]
type = 'JSON'
raw = '''
{
    "email": "Bushirah.Fintrack@example.com",
    "password": "SecurePass123!",
    "firstName": "Bushirah",
    "lastName": "Nantale"
}'''
```
