# Online Store Server

Online store API developed with Node.js + Express.
User authorization handled with Passport.js
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

## API doc

### Products

#### Get Products

**URL:** /products/

**Method:** GET

**Success Response Code**: 200

**Sample response:**

```javaScript
[
  {
    "name": "Snake 3D",
    "image": "/images/products/snake.png",
    "description": "description",
    "rating": 4,
    "price": "99.99",
    "productId": 1,
    "category": "games",
    "subcategory": "ps4",
    "badges": [
      "Best Seller"
    ]
  },
...
]

```

#### Get Categories

**URL:** /products/categories

**Method:** GET

**Success Response Code**: 200

**Sample response:**

```javaScript
[
 {
  "computers": {
    "display": "Computers",
    "subcategories": {
      "laptops": "Laptops",
      "tablets": "Tablets",
      "peripherials": "Peripherials",
      "accessories": "Accessories"
    }
  }
...
]

```

#### Get Product by ID

**URL:** /products/:id

**Method:** GET

**URL Params:** id=[integer]

**Success Response Code**: 200

**Sample response:**

```javaScript

  {
    "name": "Snake 3D",
    "image": "/images/products/snake.png",
    "description": "ante sollicitudin",
    "rating": 4,
    "price": "99.99",
    "productId": 1,
    "category": "games",
    "subcategory": "ps4",
    "badges": [
      "Best Seller"
    ]
  }
```

### Users

#### Create User

**URL:** /users/register

**Method:** POST

**Request body:**

```javaScript
{
    "username": "test2",
    "email": "test2@test.com",
    "password": "secret"
}
```

**Success Response Code**: 201

### Cart

#### Add product to the Cart

**URL:** /cart/:userid

**Method:** POST

**Request body:**

```javaScript
{
  "productId": "1",
  "quantity": "1"
}
```

**Success Response Code**: 201

**Sample response:**

```javaScript
{
    "productId": 10,
    "username": "test2",
    "quantity": 1,
}
```

\*\*To remove product from cart - send a request with negative quantity. Example:

```javaScript
{
  "productId": 1,
  "quantity": -1
}
```

#### Clear cart

**URL:** /cart/:userid

**Method:** DELETE

**Success Response Code**: 200

#### Get Cart

**URL:** /cart/:userid

**Method:** GET

**Success Response Code**: 200

**Sample response:**

```javaScript
[
    {
        "productId": 1,
        "username": "test2",
        "quantity": 5,
    }
]
```

## Tests

### Integration tests

There are integration tests implemented for Online Store API using:

- Supertest

#### Running tests

When running tests with CI and XML report is expected run:

```bash
npm test
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
