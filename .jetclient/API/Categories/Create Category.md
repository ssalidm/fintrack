```toml
name = 'Create Category'
description = '{{baseUrl}}/api/v1/categories'
method = 'POST'
url = '{{baseUrl}}/api/v1/categories'
sortWeight = 1000000
id = 'eb921e57-8bce-48b3-923b-8ba67e457176'

[body]
type = 'JSON'
raw = '''
{
  "name": "Groceries",
  "categoryType": "EXPENSE",
  "displayOrder": 1
}'''
```
