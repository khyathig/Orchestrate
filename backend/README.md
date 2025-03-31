# 📚 Backend Setup and Usage Guide

## 🚀 Getting Started

### 1. Navigate to Backend and Install Dependencies
cd backend
npm install

### 2. Run the Backend
npm start
##  Server will run at http://localhost:5000



## 🛠️ Available Scripts
- npm start – Runs the backend server.
- npm run dev – Runs the server in development mode using nodemon for automatic reloads.

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
mongoimport --uri="your mongodb string" --collection=tasks --file=tasks.json --jsonArray
