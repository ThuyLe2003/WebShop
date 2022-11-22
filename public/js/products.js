const addToCart = (productId, productName) => {
  // TODO 9.2
  // you can use addProductToCart(), available already from /public/js/utils.js
  // for showing a notification of the product's creation, /public/js/utils.js  includes createNotification() function
  addProductToCart(productId);
  createNotification(`Added ${productName} to cart!`, "notifications-container");
};

(async() => {
  // DONE 9.2 
  // - get the 'products-container' element from the /products.html
  // - get the 'product-template' element from the /products.html
  // - save the response from await getJSON(url) to get all the products. getJSON(url) is available to this script in products.html, as "js/utils.js" script has been added to products.html before this script file 
  // - then, loop throug the products in the response, and for each of the products:
  //    * clone the template
  //    * add product information to the template clone
  //    * remember to add an event listener for the button's 'click' event, and call addToCart() in the event listener's callback
  // - remember to add the products to the the page
  const container = document.getElementById("products-container");
  const template = document.getElementById("product-template");

  getJSON("/api/products").then((products) => {
    products.forEach(product => {
      const prod = template.content.cloneNode(true);

      prod.querySelector('.product-name').textContent = product.name;
      prod.querySelector('.product-name').id = `name-${product._id}`;

      prod.querySelector('.product-description').innerText = product.description;
      prod.querySelector('.product-description').id = `description-${product._id}`;

      prod.querySelector('.product-price').innerText = product.price;
      prod.querySelector('.product-price').id = `price-${product._id}`;

      prod.id = product._id;

      prod.querySelector("button").id = `add-to-cart-${product._id}`;
      prod.querySelector("button").addEventListener('click', () => {
        addToCart(product._id, product.name);
      })
      
      container.appendChild(prod);
    });
      
    })

})();
