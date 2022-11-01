const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson, getCredentials } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { emailInUse, getAllUsers, saveNewUser, validateUser, getUser, getUserById, updateUserRole, deleteUserById } = require('./utils/users');
const { getCurrentUser } = require('./auth/auth');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET']
};

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

const handleRequest = async(request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }

  if (matchUserId(filePath)) {
    // TODO: 8.6 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    // If the HTTP method of a request is OPTIONS you can use sendOptions(filePath, response) function from this module
    // If there is no currently logged in user, you can use basicAuthChallenge(response) from /utils/responseUtils.js to ask for credentials
    //  If the current user's role is not admin you can use forbidden(response) from /utils/responseUtils.js to send a reply
    // Useful methods here include:
    // - getUserById(userId) from /utils/users.js
    // - notFound(response) from  /utils/responseUtils.js 
    // - sendJson(response,  payload)  from  /utils/responseUtils.js can be used to send the requested data in JSON format
    const id = url.split("/")[3];
    const authheader = request.headers.authorization;

    if (! authheader) {
    return responseUtils.basicAuthChallenge(response);
    } else {
      const info = getCredentials(request);
      const user = getUser(info[0], info[1]);
      if (user === undefined) {
        return responseUtils.basicAuthChallenge(response);
      } else {
        const view = getUserById(id);
        if (view === undefined) {
          return responseUtils.notFound(response);
        };

        if (user.role !== "admin") {
          return responseUtils.forbidden(response);
        };

        if (method.toUpperCase() === 'GET') {
            return responseUtils.sendJson(response, view);
        
        } else if (method.toUpperCase() === 'PUT') {
           const userChangeRole = await parseBodyJson(request);
           const roleToChange = userChangeRole.role;
           if ((roleToChange === "customer" | roleToChange === "admin")) {
            updateUserRole(id, roleToChange);
            return responseUtils.sendJson(response, getUserById(id));
           } else {
            return responseUtils.badRequest(response, 'Missing or unvalid role');
           }
          
        } else if (method.toUpperCase() === 'DELETE') {
          const userDeleted = deleteUserById(id);
          if (userDeleted == null) {
            return responseUtils.notFound(response);
          } else {
            return responseUtils.sendJson(response, userDeleted);
          }
          
        } else if (method.toUpperCase() === "OPTIONS") {
            return sendOptions(filePath, response);
          }
      }
    }
    
    // throw new Error('Not Implemented');
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
    // TODO: 8.5 Add authentication (only allowed to users with role "admin")
    const authheader = request.headers.authorization;
    if (! authheader | authheader == "") {
      return responseUtils.basicAuthChallenge(response);
    } else {
        const info = getCredentials(request);
        if (info.length !== 2) {
          return responseUtils.basicAuthChallenge(response);
        } else {
          const user = getUser(info[0], info[1]);
          if (user === undefined) {
            return responseUtils.basicAuthChallenge(response);
          } else if (user.role !== "admin") {
            return responseUtils.forbidden(response);
          } else {
          return responseUtils.sendJson(response, getAllUsers());
          }
        }
      }
    }
  

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // TODO: 8.4 Implement registration
    // You can use parseBodyJson(request) method from utils/requestUtils.js to parse request body.
    // Useful methods here include:
    // - validateUser(user) from /utils/users.js 
    // - emailInUse(user.email) from /utils/users.js
    // - badRequest(response, message) from /utils/responseUtils.js
    parseBodyJson(request).then(body => {
      const errors = validateUser(body);
      const validEmail = emailInUse(body.email);
      if (errors.length !== 0) {
        return responseUtils.badRequest(response, 'Missing information');
      } else if (validEmail) {
        return responseUtils.badRequest(response, 'Email is already in use');
      } else {
        body.role = "customer";
        const user = saveNewUser(body);
        response.writeHead(201, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(user));
      }
    });
    // throw new Error('Not Implemented');
  }
};

module.exports = { handleRequest };