# Passport Data Management Application

This is a simple web application for managing passport data built with Express.js and Node.js.

## Features

-   Client-side form for entering passport data (first name, last name, middle name, address, identification number, and photo)
-   Server-side API to handle CRUD operations (Create, Read, Update, Delete)
-   Data storage in both JSON and XML formats
-   Photo upload functionality
-   Data viewing in both JSON and XML formats

## Project Structure

```
passport-data-app/
├── public/                # Static files
│   ├── index.html         # Main HTML form
│   ├── css/
│   │   └── style.css      # CSS styles
│   ├── js/
│   │   └── main.js        # Client-side JavaScript
│   └── uploads/           # Uploaded photos storage
├── data/                  # Data storage
│   ├── passports.json     # JSON data file
│   └── passports.xml      # XML data file
├── routes/
│   └── api.js             # API routes
├── server.js              # Main server file
├── package.json           # Project dependencies
└── README.md              # This file
```

## Prerequisites

-   Node.js (v14.x or higher)
-   npm (v6.x or higher)

## Installation

1. Clone this repository or download the source code
2. Navigate to the project directory:
    ```
    cd passport-data-app
    ```
3. Install dependencies:
    ```
    npm install
    ```

## Usage

1. Start the server:

    ```
    npm start
    ```

    For development with auto-restart:

    ```
    npm run dev
    ```

2. Open your browser and navigate to:

    ```
    http://localhost:3000
    ```

3. Use the form to create, read, update, and delete passport records.

## API Endpoints

-   **GET /api/passports** - Get all passport records
-   **GET /api/passports/:id** - Get a specific passport record by ID
-   **GET /api/passports/format/:format** - Get all data in JSON or XML format
-   **POST /api/passports** - Create a new passport record
-   **PUT /api/passports/:id** - Update an existing passport record
-   **DELETE /api/passports/:id** - Delete a passport record

## Dependencies

-   express: Web server framework
-   multer: File upload handling
-   fs-extra: Enhanced file system methods
-   xml2js: XML parsing and building
-   uuid: Unique ID generation
-   cors: Cross-Origin Resource Sharing
-   nodemon (dev): Auto-restart during development
