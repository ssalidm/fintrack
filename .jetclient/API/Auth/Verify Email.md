```toml
name = 'Verify Email'
description = '{{baseUrl}}/api/v1/auth/verify-email'
method = 'POST'
url = '{{baseUrl}}/api/v1/auth/verify-email'
sortWeight = 4000000
id = 'a441f0dd-bb6f-4462-91f8-6c6ed9518f8e'

[auth]
type = 'NO_AUTH'

[body]
type = 'JSON'
raw = '''
{
    "token": "bIvT3NtrDJlrBsJ1XVJdUB-rsKYpIYviO0SVwVgc250"
}'''
```
