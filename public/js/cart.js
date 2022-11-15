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
  // Remove product from cart if amount is 0,  /public/js/utils.js provides removeElement = (containerId, elementId)
  const count = decreaseProductCount(productId);
  if (count === 0) {
    removeElement("cart-container", productId);
    document.location.reload(true);
  } else {updateProductAmount(productId)};

};

const updateProductAmount = productId => {
  // TODO 9.2
  // - read the amount of products in the cart, /public/js/utils.js provides getProductCountFromCart(productId)
  // - change the amount of products shown in the right element's innerText
  let count = getProductCountFromCart(productId);
  document.getElementById(`amount-${productId}`).innerText = `${count}x`;

};

const placeOrder = async() => {
  // TODO 9.2
  // Get all products from the cart, /public/js/utils.js provides getAllProductsFromCart()
  // show the user a notification: /public/js/utils.js provides createNotification = (message, containerId, isSuccess = true)
  // for each of the products in the cart remove them, /public/js/utils.js provides removeElement(containerId, elementId)
  let products = getAllProductsFromCart();
  products.forEach(product => {
    removeElement("cart-container", product.id);
  })
  clearCart();
  createNotification("Successfully created an order!", "notifications-container");
}

document.getElementById("place-order-button").addEventListener("click", () => {
  placeOrder().then(document.location.reload());
});

(async() => {
  // TODO 9.2
  // - get the 'cart-container' element
  // - use getJSON(url) to get the available products
  // - get all products from cart
  // - get the 'cart-item-template' template
  // - for each item in the cart
  //    * copy the item information to the template
  //    * hint: add the product's ID to the created element's as its ID to 
  //        enable editing ith 
  //    * remember to add event listeners for cart-minus-plus-button
  //        cart-minus-plus-button elements. querySelectorAll() can be used 
  //        to select all elements with each of those classes, then its 
  //        just up to finding the right index.  querySelectorAll() can be 
  //        used on the clone of "product in the cart" template to get its two
  //        elements with the "cart-minus-plus-button" class. Of the resulting
  //        element array, one item could be given the ID of 
  //        `plus-${product_id`, and other `minus-${product_id}`. At the same
  //        time we can attach the event listeners to these elements. Something 
  //        like the following will likely work:
  //          clone.querySelector('button').id = `add-to-cart-${prodouctId}`;
  //          clone.querySelector('button').addEventListener('click', () => addToCart(productId, productName));
  //
  // - in the end remember to append the modified cart item to the cart
  const containerId = document.getElementById("cart-container");
  const template = document.getElementById("cart-item-template");

  // createNotification(getAllProductsFromCart()[1].id, "notifications-container");

  getJSON("/api/cart").then((listProd) => {
    const products = getAllProductsFromCart();
    
    products.forEach(item => {
      const prod = template.content.cloneNode(true);
      prod.id = item.id;

      const product = listProd.find(element => element._id === item.id);

      prod.querySelector('.product-name').textContent = product.name;
      prod.querySelector('.product-name').id = `name-${item.id}`;

      prod.querySelector('.product-price').innerText = product.price;
      prod.querySelector('.product-price').id = `price-${item.id}`;
    
      prod.querySelector('.product-amount').innerText = `${item.amount}x`;
      prod.querySelector('.product-amount').id = `amount-${item.id}`;

      prod.querySelectorAll('.cart-minus-plus-button')[0].id = `plus-${item.id}`;
      prod.querySelectorAll('.cart-minus-plus-button')[0].addEventListener('click', () => addToCart(item.id, product.name));

      prod.querySelectorAll('.cart-minus-plus-button')[1].id = `minus-${item.id}`;
      prod.querySelectorAll('.cart-minus-plus-button')[1].addEventListener('click', () => {decreaseCount(item.id, product.name)});

      containerId.appendChild(prod);
    }); 
  }); 
})();