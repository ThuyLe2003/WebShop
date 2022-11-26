const {getCredentials} = require('../utils/requestUtils');
const User = require('../models/user');


/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request request from server
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // Implement getting current user based on the "Authorization" request header
  const authheader = request.headers.authorization;
  // Return null if Authorization header is missing/empty
  if (authheader === undefined || authheader === "") {
    return null;
    }

  // Return null if Authorization header is not Basic
  if (authheader.split(" ")[0] !== "Basic") {
    return null;
  }

  // Get credentials
  const info = getCredentials(request);
  const email = info[0];
  const password = info[1];
  if (info.length === 0) {
    return null;
  }

  // Check email
  const currentUser = await User.findOne({email: email}).exec();
  if (currentUser === null) {
    return null;
  }

  // Check password
  const isPasswordCorrect = await currentUser.checkPassword(password);
  if (!isPasswordCorrect) {
    return null;
  }

  return currentUser;
};

module.exports = { getCurrentUser };