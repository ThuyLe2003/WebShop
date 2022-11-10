const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson, getCredentials } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const User = require('./models/user');
const http = require("http");

const roles = ["customer", "admin"];

/**
 * Validate user object (Very simple and minimal validation)
 *
 * This function can be used to validate that user has all required
 * fields before saving it.
 *
 * @param {Object} user user object to be validated
 * @returns {Array<string>} Array of error messages or empty array if user is valid. 
 */
 const validateUser = user => {
  const errors = [];

  if (!user.name) errors.push('Missing name');
  if (!user.email) errors.push('Missing email');
  if (!user.password) errors.push('Missing password');
  if (user.role && !roles.includes(user.role)) errors.push('Unknown role');

  return errors;
};

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET', 'PUT', 'DELETE'],
  '/api/products': ['GET'],
  '/api/cart' : ['GET']
};

/**
 * Use this object to store products
 */
const products = require('./products.json').map(product => ({...product }));

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response
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
 * @param {string} prefix
 * @returns {boolean}
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
 * @returns {boolean}
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
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
  const authorizationHeader = request.headers["authorization"];
  const currentUser = await getCurrentUser(request);
  // response with basic auth challenge & 401 Unauthorized if auth header is missing
  if (!authorizationHeader) {
    response.setHeader("WWW-Authenticate", "Basic");
    return responseUtils.unauthorized(response);
  }
  if (authorizationHeader === undefined || authorizationHeader === " ") {
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

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }

  if (matchUserId(filePath)) {
    // Implement view, update and delete a single user by ID (GET, PUT, DELETE)
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    // If the HTTP method of a request is OPTIONS you can use sendOptions(filePath, response) function from this module
    // If there is no currently logged in user, you can use basicAuthChallenge(response) from /utils/responseUtils.js to ask for credentials
    //  If the current user's role is not admin you can use forbidden(response) from /utils/responseUtils.js to send a reply
    const id = url.split("/")[3];
    const headerCheck = await checkHeader(request, response, true);
    if (headerCheck !== null) {
      return headerCheck;
    }
    const view = await User.findById(id).exec();
    if (view === null) {
      return responseUtils.notFound(response);
    }

    if (method.toUpperCase() === 'GET') {
      return responseUtils.sendJson(response, view);
        
    } else if (method.toUpperCase() === 'PUT') {
      const userChangeRole = await parseBodyJson(request);
      const roleToChange = userChangeRole.role;
      if (roles.includes(roleToChange)) {
        view.role = roleToChange;
        await view.save();
        return responseUtils.sendJson(response, view);
      } else {
        return responseUtils.badRequest(response, 'Missing or unvalid role');
      }
          
    } else if (method.toUpperCase() === 'DELETE') {
      await User.deleteOne({_id: id});
      return responseUtils.sendJson(response, view);
          
    } else if (method.toUpperCase() === "OPTIONS") {
      return sendOptions(filePath, response);
    }
  }
    
  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // GET all users
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    // Add authentication (only allowed to users with role "admin")
    const users = await User.find({});

    getCurrentUser(request).then(user => {
      if (user === null) {
        return responseUtils.basicAuthChallenge(response);
      } else if (user.role !== "admin") {
              return responseUtils.forbidden(response);
            } else {
              return responseUtils.sendJson(response, users);
            }
          }
    );
  }  

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // Implement registration
    // You can use parseBodyJson(request) method from utils/requestUtils.js to parse request body.
    const body = await parseBodyJson(request);
    const errors = validateUser(body);
    const validEmail = await User.findOne({email: body.email}).exec();
    if (errors.length !== 0) {
      return responseUtils.badRequest(response, 'Missing information');
    } else if (validEmail) {
      return responseUtils.badRequest(response, 'Email is already in use');
    } else {
      // Create a new user
      const userData = {
        name: body.name,
        email: body.email,
        password: body.password,
        role: "customer",
      };

      const newUser = new User(userData);
      await newUser.save();
      return responseUtils.createdResource(response, newUser);
    }
  }

  // GET all products (only allowed for authenticated user)
  if ((filePath === '/api/products' | filePath === '/api/cart') && method === 'GET') {
    getCurrentUser(request).then(user => {
      if (user === null) {
        return responseUtils.basicAuthChallenge(response);
      } else {
        return responseUtils.sendJson(response, products);
      }
    })
    }
};

module.exports = { handleRequest };