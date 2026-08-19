```toml
name = 'Update Category'
description = '{{baseUrl}}/api/v1/categories/{{categoryId}}'
method = 'PATCH'
url = '{{baseUrl}}/api/v1/categories/{{categoryId}}'
sortWeight = 5000000
id = '8e315195-1101-49cd-8dfb-0f0cead74f3b'

[body]
type = 'JSON'
raw = '''
{
    "version": 0,
    "openingBalance": 800.65
}'''
```
