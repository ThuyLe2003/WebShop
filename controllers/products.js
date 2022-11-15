const products = require('../products.json').map(product => ({...product }));
const responseUtils = require("../utils/responseUtils");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = async response => {
  responseUtils.sendJson(response, products);
};

module.exports = { getAllProducts };