const express = require('express');
const UserCategory = require('../models/userCategory');
const UserCategoryTwo = require('../models/userCategoryTwo');
const Admin = require('../models/admins');
const {
  createUserCategoryOne,
  createUserCategoryTwo,
  deleteUserCategory,
  getAllUserCategory,
  getAllUserCategoryTwo,
  getAUserCategory,
  updateUserCategory,
  getUserCategoryByOrganization,
  getUserCategoryTwoByCategoryOne,
  getUserCategoryTwoByOrganization,
  deleteCategory,
  getAUserCategoryTwo,
  updateUserCategoryTwo,
} = require('../controllers/userCategory');
const { protect } = require('../middlewares/protectRoute');

const Router = express.Router();

// Router.use(protect(Admin));

Router.route('/category-one-by-organization/:organization').get(
  getUserCategoryByOrganization
);

Router.route('/category-two-by-organization/:organization').get(
  getUserCategoryTwoByOrganization
);

Router.route('/category-two-by-category-one/:category').get(
  getUserCategoryTwoByCategoryOne
);

Router.route('/category-one')
  .post(createUserCategoryOne)
  .get(getAllUserCategory);

Router.route('/category-two')
  .post(createUserCategoryTwo)
  .get(getAllUserCategoryTwo);

Router.route('/category-one/:id')
  .patch(updateUserCategory(UserCategory))
  .get(getAUserCategory)
  .delete(deleteCategory);

Router.route('/category-two/:id')
  .patch(updateUserCategoryTwo)
  .get(getAUserCategoryTwo)
  .delete(deleteUserCategory(UserCategoryTwo));

module.exports = Router;
