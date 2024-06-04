# User

This service manages user data

Don't forget to copy the .sample.env to env

## Running the App

`npx nx serve user `

## API

The api have two protected rout which can only be access by bearer token

- [Get] /api/user/profile
    Returns user prole and current wallet balance

- [Put] /api/user/profile
    Update user profile