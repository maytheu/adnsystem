# Authenticate service

Copy .sample.env to env in the main directory

Default port is 5000

## Run the App

`npx nx serve authicate`

## API

This service have two routes

 - [Post] /api/auth/login
    payload {mail and password}
    It returns token

- [Post] /api/auth/signup
    payload {
        email
        password
        name
        phone (11 digits xter long)
        verificationType (EmaiPhone)
    }
    It returns a token
