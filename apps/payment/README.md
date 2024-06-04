# payment

It manages / process user payment

copy .sample.env to env in this dir

## Running the App

`npx nx serve payment`

## API 

The service have four api route

- [Post] /api/payment/credit 
    payload { amount: number}
    User must be authenticated to access this resource

- [Post] /api/payment/debit
    payload { amount: number}
    User must be authenticated to access this resource
    This api simulate the insufficient fund notification when balance is too low

- [Post] /api/payment/webhook
    This api is an expose for third party webhook to manage user wallet

- [Get] /api/payment/verify/:ref
    Test the webhook in dev mode