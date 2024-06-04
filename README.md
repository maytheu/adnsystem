# AutoDepSystem

This is a monorepo app generated with Nx workspace

## Running the app
To run the app locally, run `npm install` to install dependency

Copy .sample.env to env in each apps dir to run the app

To run the whole app in one terminal run `npx nx run-many -t serve authentication user wallet payment notifications'

Check each service folder to run independently

## Dependency
 - ExpressJs - For managing nodejs server
 - Amqplib - Advance messaging queue protocol for managing rabbitmq
 - Joi - For validating user information
 - envalid - Validate env data
 - nodemailer - Mange email notification
 - prisma - Orm for postgredb
 - twilio - managing phone notification
 - jsonwebtoken - Authenticatin guser using beare token
 - bcryptjs - Hashing user password