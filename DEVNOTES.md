# Collections

## Schema:
```
gesenterprise  
    |--------employees
                |--------emp_num
                            |---String
                |--------name
                            |---String
                |--------role
                            |---String
                |--------email
                            |---Array of emails
                |--------phone_num
                            |---Arrays of phone numbers
                |--------vat_id
                    	    |---String
                |--------ss_num
                            |---String
                |--------active
                            |---Boolean
                            |---Do they still work at the company
                |--------company_id
                            |---ObjectID
                |--------perm_level
                            |---int
    |--------clock_in
                |-------employee_id
                            |---ObjectID
                |-------time
                            |---Date    
                |-------action
                            |---String
    |--------companies
                |------name
                            |---String
                |------nif
                            |---String
                |------ss_num
                            |---String
    |--------api
                |------emp_id
                            |---ObjectID
                |------key
                            |---String
                |------init_date
                            |---Date
```


## Permissions Levels
0: Super-Admin
1: Company Admin
2: Admin
3: Employee
4: View-Only