```toml
name = 'Update Account'
description = '{{baseUrl}}/api/v1/accounts/{{accountId}}'
method = 'PATCH'
url = '{{baseUrl}}/api/v1/accounts/{{accountId}}'
sortWeight = 5000000
id = '20bf3926-765a-433d-b0b0-037f90258ff1'

[body]
type = 'JSON'
raw = '''
{
    "version": 0,
    "openingBalance": 800.65
}'''
```
