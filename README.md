## Importing MongoDB Data Manually
To import the provided JSON data into MongoDB, follow these steps:

### Prerequisites
- Ensure MongoDB is running locally.
- Open PowerShell or any command line interface.

### Import Commands
Run the following commands to import the collections:

```powershell
mongoimport --uri="your mongodb string" --collection=events --file=events.json --jsonArray
mongoimport --uri="your mongodb string" --collection=employee --file=employees.json --jsonArray

