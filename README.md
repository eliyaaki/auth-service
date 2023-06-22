# Auth Application

This readme provides an overview of the Auth application that manages users, refresh and sign tokens. The application is written in TypeScript and is fully unit tested with Jest. It utilizes MongoDB as the database to store user and session data. Additionally, it includes a mailer functionality to send emails to users for verification and password reset.

## Features

The Auth application offers the following features:

1. User Management: The application allows users to register, log in, and manage their profiles.
2. Token Generation: It provides token generation functionality for user authentication and authorization.
3. Refresh Tokens: The application supports refresh tokens to extend user sessions.
4. Verification Emails: Users receive verification emails upon registration to verify their email addresses.
5. Password Reset Emails: Users can request password reset emails to reset their passwords securely.

## Technologies Used

The Auth application utilizes the following technologies and libraries:

- TypeScript: The application is written in TypeScript, providing type safety and enhanced developer experience.
- MongoDB: The database stores user and session data.
- Jest: The application is fully unit tested using the Jest testing framework.
- Nodemailer: Used for sending verification and password reset emails.
- Express.js: Provides the backend infrastructure and routing capabilities.
- JSON Web Tokens (JWT): Used for user authentication and authorization.

## Setup Instructions

To set up and run the Auth application, follow these steps:

1. Clone the repository from the GitHub repository URL.
2. Install the necessary dependencies by running `npm install`.
3. Configure the MongoDB connection by providing the appropriate connection string and credentials in the configuration files.
4. Set up the SMTP configuration in the `.env` file. Add the following SMTP-related environment variables:
   - `SMTP_HOST`: The SMTP server host address.
   - `SMTP_PORT`: The SMTP server port number.
   - `SMTP_SECURE`: Set it to `true` if the SMTP server requires a secure connection (e.g., for TLS/SSL). Set it to `false` if the server does not require a secure connection.
   - `SMTP_USER`: The username or email address used for authentication with the SMTP server.
   - `SMTP_PASS`: The password associated with the SMTP user.
   - _(Optional)_ Add any other SMTP-related environment variables required by your specific SMTP provider.
5. Run the application using the command `npm run dev`.


## Mail Providers

The Auth application supports various mail providers for sending emails. By configuring the SMTP settings in the `.env` file as mentioned above, you can use different mail providers. Some popular mail providers include:

- **SendGrid**: A cloud-based email delivery platform that provides a reliable and scalable solution for sending emails. Visit the SendGrid website (https://sendgrid.com) to create an account and obtain SMTP credentials.
- **Mailgun**: A powerful email API service that allows you to send, receive, and track emails effortlessly. Visit the Mailgun website (https://www.mailgun.com) to sign up for an account and obtain SMTP credentials.
- **SMTP2GO**: A global SMTP service that ensures reliable email delivery. Visit the SMTP2GO website (https://www.smtp2go.com) to create an account and obtain SMTP credentials.


## Testing

The Auth application includes comprehensive unit tests to ensure code quality and reliability. The tests are written using Jest, a popular JavaScript testing framework. To run the tests, use the command `npm test`. The test suite will execute and provide feedback on the test coverage and results.
