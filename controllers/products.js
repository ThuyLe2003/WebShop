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

module.exports = { getAllProducts };