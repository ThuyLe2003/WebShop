const responseUtils = require("../utils/responseUtils");
const http = require("http");
const User = require("../models/user");
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
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response
 * @returns {http.ServerResponse} The response contains all users in JSON format.
 */
const getAllUsers = async response => {
  const users = await User.find({});
  try {
    return responseUtils.sendJson(response, users);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const deleteUser = async(response, userId, currentUser) => {
  const userToDelete = await User.findById(userId).exec();
  if (userToDelete === null) {
    return responseUtils.notFound(response);
  }
  if (String(userId) === String(currentUser["_id"])) {
    return responseUtils.badRequest(response, "Bad Request");
  }
  await User.deleteOne({ _id: userId }).exec();
  return responseUtils.sendJson(response, userToDelete);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 * @param {Object} userData JSON data from request body
 */
const updateUser = async(response, userId, currentUser, userData) => {
  const userToUpdate = await User.findById(userId);
  if (userToUpdate === null) {
    return responseUtils.notFound(response);
  }

  if (String(userId) === String(currentUser["_id"])) {
    return responseUtils.badRequest(response, "Updating own data is not allowed");
  }

  if (userData["role"] === undefined) {
    return responseUtils.badRequest(response, "Bad Request");
  }

  if (!roles.includes(userData["role"])) {
    return responseUtils.badRequest(response, "Bad Request");
  }

  userToUpdate["role"] = userData["role"];
  await userToUpdate.save();
  return responseUtils.sendJson(response, userToUpdate);
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const viewUser = async(response, userId, currentUser) => {
  const user = await User.findById(userId);
  if (user === null) {
    return responseUtils.notFound(response);
  }

  return responseUtils.sendJson(response, user);
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} userData JSON data from request body
 */
const registerUser = async(response, userData) => {
  const errors = validateUser(userData);
  const validEmail = await User.findOne({email: userData.email}).exec();
  if (errors.length !== 0) {
    return responseUtils.badRequest(response, 'Missing information');
  }
  
  if (validEmail) {
    return responseUtils.badRequest(response, 'Email is already in use');
  }
  
  // Create a new user
  const newUser = new User(userData);
  newUser.role = "customer";
  await newUser.save();

  return responseUtils.createdResource(response, newUser);
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };