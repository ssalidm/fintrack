```toml
name = 'Resend Verification'
description = '{{baseUrl}}/api/v1/auth/resend-verification'
method = 'POST'
url = '{{baseUrl}}/api/v1/auth/resend-verification'
sortWeight = 7000000
id = '508c706e-c107-41a2-a8ec-418550dcc522'

[auth]
type = 'NO_AUTH'

[body]
type = 'JSON'
raw = '''
{
    "email": "Chantal.Fintrack@example.com"
}'''
```
