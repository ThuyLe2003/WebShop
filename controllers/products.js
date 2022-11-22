const Product = require('../models/product');
const responseUtils = require("../utils/responseUtils");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = async (response, request) => {
  try {
    const products = await Product.find({});
    const allProd = products.map((product) => ({
      _id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description
    }));
    return responseUtils.sendJson(response, allProd);
  } catch (err) {
    console.log(err);
  }
};

const viewProduct = async (response, id) => {
  const product = await Product.findById(id).exec();
  if (product === null) {
    return responseUtils.notFound(response);
  }

  return responseUtils.sendJson(response, product);
}

/**
 * Update product and send updated product as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} id
 * @param {Object} data JSON data from request body
 */
 const updateProduct = async(response, id, data) => {
  const product = await Product.findById(id).exec();
  if (product === null) {
    return responseUtils.notFound(response);
  }

  const {name, price, image, description} = data;
  if (name === " " || isNaN(price) || price === 0 || price <= 0) {
    return responseUtils.badRequest(response, "Bad request")
  }
  
  product.name = name;
  product.price = price;
  if (image !== undefined) {
    product.image = image;
  }
  
  if (description !== undefined) {
    product.description = description;
  }
  
  product.save();
  return responseUtils.sendJson(response, product);
};

/**
 * Delete product and send deleted product as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} id
 */

 const deleteProduct = async(response, id) => {
  const product = await Product.findById(id).exec();
  if (product === null) {
    return responseUtils.notFound(response);
  }

  await Product.deleteOne({ _id: id });
  return responseUtils.sendJson(response, product);
};

module.exports = { getAllProducts, viewProduct, updateProduct, deleteProduct };