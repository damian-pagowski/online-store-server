const fetch = require("node-fetch");
const BASE_URL = process.env.SERVER_URL;

const findCartItemByProductId = (cart, productId) => {
  return cart.items.find(item => item.productId == productId);
};
exports.findCartItemByProductId = findCartItemByProductId;

const addToCart = async (cart, productId, quantity) => {
  const productInCart = findCartItemByProductId(cart, productId);
  if (productInCart) {
    incrementProductQuantityAndCalculateSubtotal(productInCart, quantity);
  } else {
    const productFetched = await fetchProductById(productId);
    const product = { quantity: 0, productId, price: productFetched.price };
    cart.items.push(incrementProductQuantityAndCalculateSubtotal(product, quantity));
  }
  return updateTotalAndItemCount(cart);
};
exports.addToCart = addToCart;

const fetchProductById = async productId => {
  const url = `${BASE_URL}/products/${productId}`;
  console.log("Fetching: " + url);
  const product = await fetch(url).then(res => res.json());
  return product;
};
exports.fetchProductById = fetchProductById;

const incrementProductQuantityAndCalculateSubtotal = (product, quantity) => {
  const updatedItem = incrementQuantity(product, quantity);
  updatedItem.subTotal = calculateSubtotal(updatedItem.quantity, product.price);
  return updatedItem;
};
exports.incrementProductQuantityAndCalculateSubtotal = incrementProductQuantityAndCalculateSubtotal;

const setProductQuantityAndCalculateSubtotal = (product, quantity) => {
  const updatedItem = setQuantity(product, quantity);
  updatedItem.subTotal = calculateSubtotal(updatedItem.quantity, product.price);
  return updatedItem;
};
exports.setProductQuantityAndCalculateSubtotal = setProductQuantityAndCalculateSubtotal;

const incrementQuantity = (product, quantity) => {
  const tmp = { ...product };
  tmp.quantity = tmp.quantity ? tmp.quantity + quantity : quantity;
  return tmp;
}
exports.incrementQuantity=incrementQuantity;

const setQuantity = (product, quantity) => {
  const tmp = { ...product };
  tmp.quantity = quantity;
  return tmp;
}
exports.setQuantity=setQuantity;

const updateTotalAndItemCount = cart => {
  let itemsCount = 0;
  let total = 0.0;
  cart.items.forEach(element => {
    itemsCount += element.quantity;
    total += element.subTotal;
  });
  cart.total = round(total);
  cart.itemsCount = itemsCount;
  return cart;
};
exports.updateTotalAndItemCount = updateTotalAndItemCount;

const calculateSubtotal = (quantity, unitPrice) => {
  return round(quantity * unitPrice);
};
exports.calculateSubtotal = calculateSubtotal;

const round = function(num) {
  return +(Math.round(num + "e+2") + "e-2");
};
exports.round = round;

const removeFromCart = (cart, productId) => {
  const updatedCart = filterOutItem(cart, productId);
  return (updatedCart.items.length < cart.items.length) ? updateTotalAndItemCount(updatedCart): cart;
}
exports.removeFromCart = removeFromCart;

const filterOutItem = (cart, productId) => {
  const tmpCart = {...cart};
  tmpCart.items = tmpCart.items.filter(
    item => item.productId != productId
  );
  return tmpCart;
}
exports.filterOutItem = filterOutItem;

const replaceItem = async (cart, item) => {
  const tmpCart = {...cart};
  tmpCart.items = await tmpCart.items.filter(
    i => i.productId != item.productId
  ).push(item);
   return tmpCart
}
exports.replaceItem = replaceItem;

const updateCart = async (cart, productId,quantity) => {
  const item = findCartItemByProductId(cart, productId);
  const updatedItem =  setProductQuantityAndCalculateSubtotal(item, quantity);
  const updatedCart =  replaceItem(cart, updatedItem);
  return updateTotalAndItemCount(updatedCart);
}
exports.updateCart = updateCart;
