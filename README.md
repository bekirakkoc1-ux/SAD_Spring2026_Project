# Student Club Management System (SAD Project)

This project is a web-based CRUD application developed for the System Analysis and Design course. It is a system where users can create, read, update, and delete their own student clubs.

## Technologies Used
* **Frontend:** Vanilla Javascript (SPA), HTML, Bootstrap
* **Backend:** Node.js, Express.js
* **Database:** SQLite
* **Security:** JWT (JSON Web Token), bcryptjs
* **Testing:** Jest
* **Documentation:** Swagger UI

## Setup and Execution Steps

1. Download the project files to your local machine.
2. Open the terminal in the project directory and run the following command to install the required packages:
   \`npm install\`
3. Run the following command to start the server:
   \`node server.js\`
4. Open your browser and navigate to \`http://localhost:3000\` to use the application.

## API and Documentation
The system includes interactive API documentation using Swagger. To explore and test the API endpoints, start the server and navigate to:
* **Swagger UI:** \`http://localhost:3000/api-docs\`

## Project Requirements and Satisfied Criteria
* **JWT and Data Isolation:** The system includes a registration and login mechanism. Each user can only view and manage the clubs they have created.
* **Business Logic and Testing:** Database operations and business logic are separated into the Controller layer to establish a modular structure. A unit test is written using Jest (can be executed with \`npm test\`).
* **SPA:** The frontend operates entirely with Vanilla JS using asynchronous API calls (fetch API) without requiring full page reloads.