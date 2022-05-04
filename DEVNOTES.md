# Collections

## Schema:
`employees` table
| _id | empId | companyId | name | role | email | phoneNum | password | vatId | ssNum | active | permissions |
|-----|-------|-----------|------|------|-------|----------|----------|-------|-------|--------|-------------|
  
`empMovements` table
| _id | empId | time | action |
|-----|-------|------|--------|

`company` table
| _id | name | legalName | nif | ssNum | location |
|-----|------|-----------|-----|-------|----------|

`logs`
| _id | empId | action | time | ip |
|-----|-------|--------|------|----|

## Permissions Levels
`admin`: Company Admin
`hr`: HR employees (allow salary and user management)
`accounting`: Accounting/Treasury employees (allow finance movements)
`employee`: Employee page only