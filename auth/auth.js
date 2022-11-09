const {getCredentials} = require('../utils/requestUtils.js');
const {getUser} = require('../utils/users.js');


/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // TODO: 8.5 Implement getting current user based on the "Authorization" request header

  // NOTE: You can import two methods which can be useful here: // - getCredentials(request) function from utils/requestUtils.js
  // - getUser(email, password) function from utils/users.js to get the currently logged in user
  const authheader = request.headers.authorization;
  if (! authheader | authheader === "") {
      return null;
  } else {
      const info = getCredentials(request);
      const user = getUser(info[0], info[1]);
      if (user === undefined) {
        return null;
      } else {
        return user;
      }
    }
  
  // throw new Error('Not Implemented');
};

module.exports = { getCurrentUser };