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
  "id": "5e748ace065caf49a08ea637"
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
  "id": "5e748ace065caf49a08ea637"
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
  "customerId": "5e748b92065caf49a08ea638",
  "sessionId": "hYJp7ebIFKEzAoxg6_ciGJC82UfrYhtD",
  "paid": false,
  "created": "2020-03-20T09:40:45.026Z",
  "total": 99.99,
  "currency": "EUR",
  "itemsCount": "1"
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)