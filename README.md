# e-commerce-backend

## Project Description

A study in creating the back-end for an e-commerce site, reconfiguring a working Express.js API to interact with a MySQL database using Sequelize.

## Contents

- [Introduction](#introduction)
- [Problem](#problem)
- [Solution](#solution)
- [Deployment](#deployment)
- [Collaborators](#collaborators)
- [Resources](#resources)
- [License](#License)

## Introduction

For this project, I set out to refactor an existing codebase I was given to allow for MySQL database manipulation by utilizing Express routes, Sequelize, and a Node server. While not required, I added extra functionality for CLI logging the output from Sequelize, as I prefer to have a more legible visual to track database changes than the default JSON responses. I also utilized Insomnia for route testing and database interaction.

## Problem

I was given the starter code for this project in the following state:

- Basic Express structure was complete, API route paths were also defined
- Connection/index files were complete, save for Sequelize implementation
- Project lacked Sequelize implementation for the server, models and routes

I was also given the following requirements to fulfill:

```md
GIVEN a functional Express.js API

WHEN I add my database name, MySQL username, and MySQL password to an environment variable file
THEN I am able to connect to a database using Sequelize

WHEN I enter schema and seed commands
THEN a development database is created and is seeded with test data

WHEN I enter the command to invoke the application
THEN my server is started and the Sequelize models are synced to the MySQL database

WHEN I open API GET routes in Insomnia for categories, products, or tags
THEN the data for each of these routes is displayed in a formatted JSON

WHEN I test API POST, PUT, and DELETE routes in Insomnia
THEN I am able to successfully create, update, and delete data in my database
```

## Solution

I addressed the above problems in the following way:

- Developed functionality for Sequelize sync and model definition/relationships
- Developed functionality for Express routes to interact with Sequelize
- Added extra functionality for database interaction logging & output styles for server response legibility
- Added extra functionality for JSON response formatting, again mainly for legibility and personal preference
- Developed and utilized output formatting helper functions, to de-clutter route code and improve code reusability

## Deployment

Click the demo link below to see a short example of the project's functionality:

[Demo video link](#)

[Link to the GitHub repo for this project](https://github.com/Aoliva96/e-commerce-backend)

## Collaborators

I collaborated with my classmate George Schultz, as well as my instructors John Young and Nick Gambino, to assist with a major Sequelize validation issue that turned out to have a simple solution. After rectifying the issue in the Product model, I went back and refactored all route files to clean up each route's code and ensure overall consistency. I utilized GitHub Copilot for syntax suggestions and experimentation with console output.

## Resources

See the links below to see some of the resources I used for this project:

[Performing CRUD with Sequelize - DEV Community](https://dev.to/nedsoft/performing-crud-with-sequelize-29cf)

[The console.table() static method | MDN](https://developer.mozilla.org/en-US/docs/Web/API/console/table_static)

[BulkCreateOptions | Documentation](https://sequelize.org/api/v7/interfaces/_sequelize_core.index.bulkcreateoptions)

[Extending Data Types | Sequelize](https://sequelize.org/docs/v6/other-topics/extending-data-types/)

[Promise.all() - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project utilizes the standard MIT License.
