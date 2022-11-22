const responseUtils = require("../utils/responseUtils");
const http = require("http");
const User = require("../models/user");
const roles = ["customer", "admin"];

/**
 * Verify the email match with normal email pattern sth@sth.sth (sth is something)
 *
 * @param {string} email The email to validate.
 * @returns {boolean} True if the email match the requirement, false otherwise.
 */
 const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

/**
 * Validate (authenticate) the user match with user in the database including: email, name, password
 *
 * @param {object} user The user we need to validate.
 * @returns {boolean} True if the user match the structure and exist in the database, false otherwise.
 */
const validateUser = (user) => {
  const errors = [];

  if (!validateEmail(user.email)) errors.push("Invalid email");
  if (user.email === undefined) errors.push("Missing email");
  if (user.name === undefined) errors.push("Missing name");
  if (user.password === undefined) {
    errors.push("Missing password");
  }
  if (String(user.password).length < 10) errors.push("Password too short");

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
  if (String(userId) === String(currentUser._id)) {
    return responseUtils.badRequest(response, "Bad Request");
  }
  await User.deleteOne({ _id: userId });
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
  const userToUpdate = await User.findById(userId).exec();
  if (userToUpdate === null) {
    return responseUtils.notFound(response);
  }

  if (String(userId) === String(currentUser._id)) {
    return responseUtils.badRequest(response, "Updating own data is not allowed");
  }

  if (userData.role === undefined) {
    return responseUtils.badRequest(response, "Bad Request");
  }

  if (!roles.includes(userData.role) || userData.role === undefined) {
    return responseUtils.badRequest(response, "Bad Request");
  }

  userToUpdate.role = userData.role;
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
  const user = await User.findById(userId).exec();
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