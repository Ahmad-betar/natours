const User = require('../models/userModel');
const {
  deleteDocument,
  updateDocument,
  getOneDocument,
  getDocuments,
} = require('./handleFactory');

exports.GetAllUsers = getDocuments(User);

exports.getUserById = getOneDocument(User);

exports.UpdateUser = updateDocument(User);

exports.DeleteUser = deleteDocument(User);
