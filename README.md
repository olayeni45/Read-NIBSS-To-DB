
# Read NIBSS Files To SQL DB

This is a backend Node.js application that reads in a json file containing an array of Nigeria Inter-Bank Settlement System Plc (NIBSS) files and inserts them into a Microsoft SQL Server Management Studio database (SSMS).
## Authors

- [@Olayeni Anifowose](https://github.com/olayeni45)


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`SQL_SERVER_NAME`

`DB_USER`

`DB_USER_PASSWORD`

`DB_NAME`

`DB_TABLE_NAME`

`NIBSS_JSON_FILE_PATH`



## Example of NIBSS File Array
```
[
    {
    "Product": "NIP",
    "Direction": "Inward",
    "File": "<Absolute File Path>"
    },
     {
    "Product": "NIP",
    "Direction": "Outward",
    "File": "<Absolute File Path>"
    },
]
```
## Usage/Examples

```javascript
> git clone <project>

> cd <project>

> cd app

> node index.js
```


## Acronyms

* **NIBSS**: Nigeria Inter-Bank Settlement System Plc

* **SSMS**: SQL Server Management Studio
