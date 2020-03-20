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
    "description": "bla bla",
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
#### Register new User
**URL:** /users/register

**Method:** POST

**Request body:**
```javaScript
{
  email: "joe@doe.com",
  password: "P@ssw0rd",
  displayName: "Joe Doe",
  defaultProject: "bugs"
}
```

**Success Response Code**: 201

**Sample response:**

```javaScript

{
  "email": "joe@doe.com",
  "id": "#######"
}
```
#### User Login
**URL:** /users/login

**Method:** POST

**Request body:**
```javaScript
{
  email: "joe@doe.com",
  password: "P@ssw0rd",
}
```

**Success Response Code**: 200

**Sample response:**

```javaScript

{
  "email": "joe@doe.com",
  "id": "#######"
}
```

#### User Logout
**URL:** /users/logout

**Method:** GET

**Success Response Code**: 200

**Sample response:**

```javaScript
{
  "message": "logout successful"
}
```

### Cart
#### Add product to the Cart

**URL:** /cart/add

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
  "items": [
    {
      "name": "Snake 3D",
      "image": "/images/products/snake.png",
      "description": "blah",
      "rating": 4,
      "price": "99.99",
      "productId": 1,
      "category": "games",
      "subcategory": "ps4",
      "badges": [
        "Best Seller"
      ],
      "quantity": "1",
      "subTotal": 99.99
    }
 ],
  "customerId": "######",
  "sessionId": "######",
  "paid": false,
  "created": "2020-03-20T09:40:45.026Z",
  "total": 99.99,
  "currency": "EUR",
  "itemsCount": "1"
}
```

#### Update Cart

**URL:** /cart/edit

**Method:** POST

**Request body:**
```javaScript
{
  "productId": "1",
  "quantity": "2"
}
```

**Success Response Code**: 200

**Sample response:**

```javaScript
{
  "items": [
    {
      "name": "Snake 3D",
      "image": "/images/products/snake.png",
      "description": "blah",
      "rating": 4,
      "price": "99.99",
      "productId": 1,
      "category": "games",
      "subcategory": "ps4",
      "badges": [
        "Best Seller"
      ],
      "quantity": 2,
      "subTotal": 199.98
    }
 ],
  "customerId": "########",
  "sessionId": "########",
  "paid": false,
  "created": "2020-03-20T09:40:45.026Z",
  "total": 199.98,
  "currency": "EUR",
  "itemsCount": "2"
}
```

#### Get Cart Details
**URL:** /users/details

**Method:** GET

**Success Response Code**: 200

**Sample response:**

```javaScript
{
  "items": [
    {
      "name": "Snake 3D",
      "image": "/images/products/snake.png",
      "description": "blah",
      "rating": 4,
      "price": "99.99",
      "productId": 1,
      "category": "games",
      "subcategory": "ps4",
      "badges": [
        "Best Seller"
      ],
      "quantity": 1,
      "subTotal": 99.99
    }
  ],
  "customerId": "#######",
  "sessionId": null,
  "paid": false,
  "created": "2020-03-20T09:56:47.146Z",
  "total": 99.99,
  "currency": "EUR",
  "itemsCount": 1
}
```

#### Remove item from Cart

**URL:** /cart/remove

**Method:** POST

**Request body:**
```javaScript
{
  "productId": "1"
}
```

**Success Response Code**: 200

**Sample response:**

```javaScript
{
  "items": [],
  "customerId": "#######",
  "sessionId": null,
  "paid": false,
  "created": "2020-03-20T09:56:47.146Z",
  "total": 0,
  "currency": "EUR",
  "itemsCount": 0
}
```
#### Send checkout event to payment provider

**URL:** /cart/charge

**Method:** GET


**Success Response Code**: 200

**Sample response:**

```javaScript
{
  "session": {
    "id": "############",
    "object": "checkout.session",
    "billing_address_collection": null,
    "cancel_url": "http://localhost:3030/cart/payment-failed",
    "client_reference_id": null,
    "customer": null,
    "customer_email": null,
    "display_items": [
      {
        "amount": 1,
        "currency": "eur",
        "custom": {
          "description": "blah",
          "images": [
            "http://localhost:3030/images/products/snake.png"
          ],
          "name": "Snake 3D"
        },
        "quantity": 1,
        "type": "custom"
      }
    ],
    "livemode": false,
    "locale": null,
    "metadata": {},
    "mode": "payment",
    "payment_intent": "############",
    "payment_method_types": [
      "card"
    ],
    "setup_intent": null,
    "shipping": null,
    "shipping_address_collection": null,
    "submit_type": null,
    "subscription": null,
    "success_url": "http://localhost:3030/cart/payment-success"
  },
  "error": {}
}
```

## Tests

### Integration tests

There are integration tests implemented for Online Store API using:
- Mocha
- Chai
- Chai-http

#### Running tests

When running tests with CI and XML report is expected run:
```bash
npm run test-api
```
To get HTML report use:
```bash
npm run test-api-local
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)