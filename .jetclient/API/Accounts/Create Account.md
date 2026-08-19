```toml
name = 'Create Account'
description = '{{baseUrl}}/api/v1/accounts'
method = 'POST'
url = '{{baseUrl}}/api/v1/accounts'
sortWeight = 1000000
id = '8489360c-9c30-4410-8d2c-a7b6a73c90ed'

[body]
type = 'JSON'
raw = '''
{
    "name": "Nedbank Current Account",
    "accountType": "CURRENT",
    "currencyCode": "ZAR",
    "openingBalance": 5700.68,
    "includeInNetWorth": true
}'''
```
