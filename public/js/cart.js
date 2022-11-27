const addToCart = productId => {
  // TODO 9.2
  // use addProductToCart(), available already from /public/js/utils.js
  // call updateProductAmount(productId) from this file
  addProductToCart(productId);
  updateProductAmount(productId);
};

const decreaseCount = productId => {
  // TODO 9.2
  // Decrease the amount of products in the cart, /public/js/utils.js provides decreaseProductCount()
  // Remove product from cart if amount is 0,  /public/js/utils.js provides removeElement = (containerId, elementId
  const count = decreaseProductCount(productId);
  updateProductAmount(productId);
  if (parseInt(count) === 0) { 
    removeElement('cart-container', productId); 
  }
};

const updateProductAmount = productId => {
  // TODO 9.2
  // - read the amount of products in the cart, /public/js/utils.js provides getProductCountFromCart(productId)
  // - change the amount of products shown in the right element's innerText
  const count = getProductCountFromCart(productId);
  const amountShow = document.querySelector(`#amount-${productId}`);
  amountShow.textContent = `${count}x`;
};

const placeOrder = async() => {
  // TODO 9.2
  // Get all products from the cart, /public/js/utils.js provides getAllProductsFromCart()
  // show the user a notification: /public/js/utils.js provides createNotification = (message, containerId, isSuccess = true)
  // for each of the products in the cart remove them, /public/js/utils.js provides removeElement(containerId, elementId)
  const allProducts = getAllProductsFromCart();
  createNotification("Successfully created an order!", "notifications-container");
  allProducts.map((product) => {
    let {name:id} = product;
    removeElement('cart-container', id);

  })
 
  clearCart();
};

(async() => {
  const cartContainer = document.querySelector("#cart-container");

  const products = await getJSON("/api/products");
  const productsFromCart = getAllProductsFromCart();

  const itemTemplate = document.querySelector("#cart-item-template");

  document.querySelector('#place-order-button').addEventListener('click', () => placeOrder());

  productsFromCart.map((product) =>  {
    let {name:id, amount} = product;
    if (amount === "NaN") amount = 0;
    const productInfo = products.find(product => product._id == id);
    const {price, name} = productInfo;
    
    const cart = itemTemplate.content.cloneNode(true);

    cart.querySelector('.item-row').id = id;
    cart.querySelector('h3').id = `name-${id}`;
    cart.querySelector('h3').textContent = name;
    cart.querySelector('.product-price').id = `price-${id}`;
    cart.querySelector('.product-price').textContent = price;
    cart.querySelector('.product-amount').id = `amount-${id}`;
    cart.querySelector('.product-amount').textContent = `${amount}x`;

    let buttons = cart.querySelectorAll('button');
    buttons.item(0).id = `plus-${id}`;
    buttons.item(0).addEventListener('click', () => addToCart(id));
    buttons.item(1).id = `minus-${id}`;
    buttons.item(1).addEventListener('click', () => decreaseCount(id));

    cartContainer.appendChild(cart);

  })
})();