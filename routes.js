const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const { getAllUsers, registerUser, deleteUser, viewUser, updateUser } = require('./controllers/users');
const { getAllProducts, viewProduct, updateProduct, deleteProduct } = require('./controllers/products');

const http = require("http");
const Order = require('./models/order');
const Product = require('./models/product');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET', 'PUT', 'DELETE'],
  '/api/products': ['GET', 'PUT', 'POST', 'DELETE'],
  '/api/orders' : ['POST', 'GET']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response response of server
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type,Accept'
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix prefix of the url
 * @returns {boolean} if the url match the pattern or not
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = '[0-9a-z]{8,24}';
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} if the url match the pattern or not
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
};

/**
 * Does the URL match /api/products/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} if the url match the pattern or not
 */
const matchProductId = url => {
  return matchIdRoute(url, 'products');
};

/**
 * Does the URL match /api/orders/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} if the url match the pattern or not
 */
const matchOrderId = url => {
  return matchIdRoute(url, 'orders');
};


/**
 * Check if the user is authorized and valid in the database
 *
 * @param {http.ServerRequest} request  The incoming request with user information
 * @param {http.ServerResponse} response The response that will be eddited and send to user
 * @param {boolean} checkCustomer flag to see if checking the customer is needed
 * @returns {http.ServerResponse} Base on the request, the user receive the equivalent response.
 */
const checkHeader = async (request, response, checkCustomer) => {
  const authorizationHeader = request.headers.authorization;
  const currentUser = await getCurrentUser(request);
  
  // response with basic auth challenge & 401 Unauthorized if auth header is missing
  if (!authorizationHeader) {
    response.setHeader("WWW-Authenticate", "Basic");
    return responseUtils.unauthorized(response);
  }
  if (authorizationHeader === undefined || authorizationHeader === "") {
    // response with basic auth challenge if auth header is missing/empty
    return responseUtils.basicAuthChallenge(response);
  }

  if (currentUser === null) {
    // response with basic auth challenge if credentials are incorrect
    return responseUtils.basicAuthChallenge(response);
  }

  // check if the auth header is properly encoded
  const credentials = authorizationHeader.split(" ")[1];
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  // response with basic auth challenge if auth header is not properly encoded
  if (!base64regex.test(credentials)) {
    return responseUtils.basicAuthChallenge(response);
  }

  if (checkCustomer && currentUser.role === "customer") {
    return responseUtils.forbidden(response);
  }

  return null;
};

const handleRequest = async(request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;
  const id = url.split("/")[3];

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === 'OPTIONS') {
    return sendOptions(filePath, response);
  }
  
  const currentUser = await getCurrentUser(request);
  
  let simplifiedFilePath = "";
  const slashCount = [...filePath].filter((char) => char === "/").length;
  if (slashCount === 2) {
    simplifiedFilePath = filePath;
  } else if (slashCount === 3) {
    const removeDetailArr = filePath.split("/");
    removeDetailArr.pop();
    removeDetailArr.shift();
    removeDetailArr.forEach((str) => (simplifiedFilePath += `/${str}`));
  }

  // Default to 404 Not Found if unknown url
  if (!(simplifiedFilePath in allowedMethods)) {
    return responseUtils.notFound(response);
  }
  
  // Check for allowable methods
  if (!allowedMethods[simplifiedFilePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }


  // Require a correct accept header (require 'application/json' or '*/*')
  const acceptHeader = headers["accept"];
  if (acceptHeader === undefined || !acceptHeader.split("/").includes("json")) {
    // There are 2 special cases in put user and put product that need following if
    if (
      method.toUpperCase() === "PUT" &&
      headers["authorization"] === undefined
    ) {
      return responseUtils.basicAuthChallenge(response);
    }
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // Working related to User

  if (matchUserId(filePath)) {
    const headerCheck = await checkHeader(request, response, true);
    if (headerCheck !== null) {
      return headerCheck;
    }

    if (method.toUpperCase() === 'GET') {
      return viewUser(response, id, currentUser);
        
    } else if (method.toUpperCase() === 'PUT') {
      const userData = await parseBodyJson(request);
      return updateUser(response, id, currentUser, userData);
          
    } else if (method.toUpperCase() === 'DELETE') {
      return deleteUser(response, id, currentUser);
          
    } else if (method.toUpperCase() === "OPTIONS") {
      return sendOptions(filePath, response);
    }
  }
    
  
  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // GET all users
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    // Add authentication (only allowed to users with role "admin")
    const headerCheck = await checkHeader(request, response, true);
    if (headerCheck !== null) {
      return headerCheck;
    }
  
    if (currentUser.role === "admin") {
      return getAllUsers(response);
    }
  }  

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // Implement registration
    // You can use parseBodyJson(request) method from utils/requestUtils.js to parse request body.
    const userData = await parseBodyJson(request);
    return registerUser(response, userData);
    
  }


  // Working related to products

  if (matchProductId(filePath)) {
    const headerCheck = await checkHeader(request, response, false);
    if (headerCheck !== null) {
      return headerCheck;
    }

    if (method.toUpperCase() === 'GET') {
      return viewProduct(response, id);
        
    } else if (method.toUpperCase() === 'PUT') {
      const productData = await parseBodyJson(request);
      
      if (currentUser.role === "customer") {
        return responseUtils.forbidden(response);
      }
      return updateProduct(response, id, productData);
          
    } else if (method.toUpperCase() === 'DELETE') {
      if (currentUser.role === "customer") {
        return responseUtils.forbidden(response);
      }
      return deleteProduct(response, id);
          
    } else if (method.toUpperCase() === "OPTIONS") {
      return sendOptions(filePath, response);
    }
  }

  if (filePath === '/api/products') {
    const headerCheck = await checkHeader(request, response, false);
    if (headerCheck !== null) {
      return headerCheck;
    }

    // Get all products
    if (method.toUpperCase() === "GET") {
      return getAllProducts(response);
    }

    // Create new product
    if (method.toUpperCase() === "POST") {
      if (currentUser.role !== "admin") {
        return responseUtils.forbidden(response);
      }

      if (!isJson(request)) {
        return responseUtils.badRequest(response, "Bad request");
      }

      const data = await parseBodyJson(request);
      if (data.name === undefined || data.price === undefined) {
        return responseUtils.badRequest(response, "Bad request");
      }

      const productData = {
        name: data.name,
        price: data.price,
        image: data.image,
        description: data.description
      };

      const newProd = new Product(productData);
      await newProd.save();
      return responseUtils.createdResource(response, newProd);
    }
  }

  // Work with orders 
  
  if (filePath === '/api/orders') {
    const headerCheck = await checkHeader(request, response, false);
    if (headerCheck !== null) {
      return headerCheck;
    }

    // Get all orders
    if (method.toUpperCase() === "GET") {
      if (currentUser.role === "admin") {
        const adOrd = await Order.find({});
        return responseUtils.sendJson(response, adOrd);
      }
  
      const cusOrd = await Order.find({customerId: currentUser._id});
      return responseUtils.sendJson(response, cusOrd);
    }

    // Create new order
    if (method.toUpperCase() === "POST") {
      if (!isJson(request)) {
        return responseUtils.badRequest(response, "Bad Request");
      }

      if (currentUser.role === "admin") {
        return responseUtils.forbidden(response);
      }

      const data = await parseBodyJson(request);
      if (data.items.length === 0 || data.items === []) {
        return responseUtils.badRequest(response, "Bad Request");
      }

      const {items: order} = data;
      const { product, quantity: productQuantity } = order[0];
      if (productQuantity === undefined || product === undefined || product._id === undefined || product.name === undefined || product.price === undefined) {
        return responseUtils.badRequest(response, "Bad Request");
      }
      const ordData = {
        customerId: currentUser._id,
        items: [
          {
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              description: product.description
            },
            quantity: productQuantity
          }
        ]
      };

      const newOrd = new Order(ordData);
      await newOrd.save();
      return responseUtils.createdResource(response, newOrd);      
    }
  }

  if (matchOrderId(filePath) && method.toUpperCase() === 'GET') {
    const headerCheck = await checkHeader(request, response, false);
    if (headerCheck !== null) {
      return headerCheck;
    }

    const order = await Order.findById(id).exec();
    if (order === null) {
      return responseUtils.notFound(response);
    }

    if (currentUser.role === "admin") {
      return responseUtils.sendJson(response, order);
    }

    if (String(order.customerId) !== String(currentUser._id)) {
      return responseUtils.notFound(response);
    }

    return responseUtils.sendJson(response, order);
  }
};
module.exports = {handleRequest};