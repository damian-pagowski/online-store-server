# Online Store Server

Online store API developed with Node.js + Express.
Integrated with Stripe for handling payments. 
Products data is stored in Mongo DB.


## Installation


Requires specific environment variables to run:


```bash
MONGOLAB_URI=
SERVER_PORT=
STRIPE_SECRET_KEY=
CLIENT_URL=
```

Installing dependencies:

```bash
npm install
```

## Usage

For production run:
```bash
npm start
```
For development it can be also run with script:

```bash
npm run dev
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)