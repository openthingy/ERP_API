# Collections

## Schema:
`employees` table
| _id                | empNum          | empIdent                                  | companyId           | name      | role          | email          | phoneNum              | password                                   | vatId           | ssNum                    | active                            | type             |  
|--------------------|-----------------|-------------------------------------------|---------------------|-----------|---------------|----------------|-----------------------|--------------------------------------------|-----------------|--------------------------|-----------------------------------|------------------|  
| ObjectId           | int             | String                                    | ObjectId            | String    | String        | String         | String                | String                                     | String          | String                   | Boolean                           | String/Int       |  
| MongoDB default id | Employee Number | Like a username<br>CompanyLetter + empNum | Company Document ID | Full name | Employee role | Employee email | Employee phone number | Employee password<br>Based on SHA-256+Salt | Employee VAT Id | Employee Social Security | Is employee still in the company? | Type/Permissions |  
  
`empMovements` table
| _id | empId | time | action |
|-----|-------|------|--------|

`company` table
| _id | codeLetter | name | legalName | nif | ssNum | location |
|-----|------------|------|-----------|-----|-------|----------|

`logs`
| _id | empId | action | time | ip |
|-----|-------|--------|------|----|



## Type/Permissions Levels
`admin`: 
* Company Admin  

`hr`: 
* HR employees (allow salary and user management)

`accounting`: 
* Accounting/Treasury employees (allow finance movements)

`employee`:
* Employee page only
* Can edit:
    * Email, password
* Can see:
    * All financial documents and their dates (salaries, bonus, etc)
    * a
* Can request:
    * Vacations
    * Legal Documents

____________________________________________
# Routes
* /employee/*
    * Employee related stuff such as editing email password and checking the documents (salaries, etc)
* /accounting/*
    * Send invoices and accounting stuff (banking, etc)
* /hr/*
    * Salaries, approval of vacations, etc
