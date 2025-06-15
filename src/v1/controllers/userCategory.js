const UserCategory = require('../models/userCategory');
const Organization = require('../models/organization');
const UserCategoryTwo = require('../models/userCategoryTwo');
const {
  goodResponse,
  goodResponseDoc,
  badResponse,
} = require('../utils/response');

exports.createUserCategoryOne = async (req, res, next) => {
  try {
    const { name, status, description, organization } = req.body;
    if (!organization) {
      return badResponse(res, 'Provide Organization id');
    }
    const checkOrganization = await Organization.findById(organization);
    if (!checkOrganization)
      return badResponse(res, 'Organization does not exist');

    if (!name) {
      return badResponse(res, 'Provide User Category name');
    }
    // if (!description) {
    //   return badResponse(res, 'Provide User Category description');
    // }

    const userCategory = await UserCategory.create({
      name,
      status,
      description,
      organization: checkOrganization._id,
    });
    if (!userCategory) {
      return badResponse(res, 'Failed to create user category');
    }
    return goodResponseDoc(
      res,
      'User Category created successfully',
      201,
      userCategory
    );
  } catch (error) {
    next(error);
  }
};

exports.getUserCategoryByOrganization = async (req, res, next) => {
  try {
    const { organization } = req.params;
    if (!organization) {
      return badResponse(res, 'Provide Organization id');
    }
    const checkOrganization = await Organization.findById(organization);
    if (!checkOrganization)
      return badResponse(res, 'Organization does not exist');

    const userCategory = await UserCategory.find({
      organization: checkOrganization._id,
    });
    if (!userCategory) {
      return badResponse(res, 'User Category not found');
    }
    return goodResponseDoc(
      res,
      'User Category retrieved successfully',
      200,
      userCategory
    );
  } catch (error) {
    next(error);
  }
};

exports.getUserCategoryTwoByOrganization = async (req, res, next) => {
  try {
    const { organization } = req.params;
    if (!organization) {
      return badResponse(res, 'Provide Organization id');
    }
    const checkOrganization = await Organization.findById(organization);
    if (!checkOrganization)
      return badResponse(res, 'Organization does not exist');

    const userCategoryTwo = await UserCategoryTwo.find({
      organization: checkOrganization._id,
    }).populate({ path: 'userCategory' });
    if (!userCategoryTwo) {
      return badResponse(res, 'User Category not found');
    }
    return goodResponseDoc(
      res,
      'User Category retrieved successfully',
      200,
      userCategoryTwo
    );
  } catch (error) {
    next(error);
  }
};

exports.getUserCategoryTwoByCategoryOne = async (req, res, next) => {
  try {
    const { category } = req.params;
    if (!category) {
      return badResponse(res, 'Provide User Category id');
    }
    const checkUserCategory = await UserCategory.findById(category);
    if (!checkUserCategory)
      return badResponse(res, 'User Category does not exist');

    const userCategoryTwo = await UserCategoryTwo.find({
      userCategory: checkUserCategory._id,
    });
    if (!userCategoryTwo) {
      return badResponse(res, 'User Category not found');
    }
    return goodResponseDoc(
      res,
      'User Category retrieved successfully',
      200,
      userCategoryTwo
    );
  } catch (error) {
    next(error);
  }
};

exports.getAUserCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide category Id');
    const category = await UserCategory.findById(id);
    if (!category) return badResponse(res, 'Category does not exist');

    goodResponseDoc(res, 'category found', 200, category);
  } catch (error) {
    next(error);
  }
};
exports.getAUserCategoryTwo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide category Id');
    const category = await UserCategoryTwo.findById(id).populate({
      path: 'userCategory',
    });
    if (!category) return badResponse(res, 'Category does not exist');

    goodResponseDoc(res, 'category found', 200, category);
  } catch (error) {
    next(error);
  }
};

exports.getAllUserCategory = async (req, res, next) => {
  try {
    const userCategory = await UserCategory.find().populate('organization');
    if (!userCategory) {
      return badResponse(res, 'User Category not found');
    }
    return goodResponseDoc(
      res,
      'User Category retrieved successfully',
      200,
      userCategory
    );
  } catch (error) {
    next(error);
  }
};

exports.getAllUserCategoryTwo = async (req, res, next) => {
  try {
    const userCategory = await UserCategoryTwo.find()
      .populate({ path: 'organization' })
      .populate({ path: 'userCategory' });
    if (!userCategory) {
      return badResponse(res, 'User Category not found');
    }
    return goodResponseDoc(
      res,
      'User Category retrieved successfully',
      200,
      userCategory
    );
  } catch (error) {
    next(error);
  }
};

exports.updateUserCategory = (Model) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status, description } = req.body;
    const userCategory = await Model.findByIdAndUpdate(
      id,
      {
        name,
        status,
        description,
      },
      {
        new: true,
        runValidators: false,
      }
    );
    if (!userCategory) {
      return badResponse(res, 400, 'Failed to update user category');
    }
    return goodResponseDoc(
      res,
      'User Category updated successfully',
      200,
      userCategory
    );
  } catch (error) {
    next(error);
  }
};
exports.updateUserCategoryTwo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status, description, userCategory } = req.body;
    const userCategoryTwo = await UserCategoryTwo.findByIdAndUpdate(
      id,
      {
        name,
        status,
        description,
        userCategory,
      },
      {
        new: true,
        runValidators: false,
      }
    );
    if (!userCategoryTwo) {
      return badResponse(res, 400, 'Failed to update user category');
    }
    return goodResponseDoc(
      res,
      'User Category updated successfully',
      200,
      userCategoryTwo
    );
  } catch (error) {
    next(error);
  }
};

exports.disableUserCategory = (Model) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const userCategory = await Model.findByIdAndUpdate()(
      id,
      {
        status: false,
      },
      {
        new: true,
        runValidators: false,
      }
    );
    if (!userCategory) {
      return badResponse(res, 400, 'Failed to disable user category');
    }
    return goodResponseDoc(
      res,
      'User Category disabled successfully',
      200,
      userCategory
    );
  } catch (error) {
    next(error);
  }
};

exports.enableUserCategoryOne = (Model) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const userCategory = await Model.findByIdAndUpdate()(
      id,
      {
        status: true,
      },
      {
        new: true,
        runValidators: false,
      }
    );
    if (!userCategory) {
      return badResponse(res, 'Failed to disable user category');
    }
    return goodResponseDoc(
      res,
      'User Category disabled successfully',
      200,
      userCategory
    );
  } catch (error) {
    next(error);
  }
};

exports.createUserCategoryTwo = async (req, res, next) => {
  try {
    const { name, status, description, userCategory, organization } = req.body;
    if (!organization) {
      return badResponse(res, 'Provide Organization id');
    }
    if (!userCategory) {
      return badResponse(res, 'Provide a category id');
    }
    const checkOrganization = await Organization.findById(organization);
    if (!checkOrganization)
      return badResponse(res, 'Organization does not exist');
    const checkUserCategory = await UserCategory.findById(userCategory);
    if (!checkUserCategory)
      return badResponse(res, 'User Category does not exist');

    if (!name) {
      return badResponse(res, 'Provide User Category name');
    }
    // if (!description) {
    //   return badResponse(res, 'Provide User Category description');
    // }

    const userCategoryTwo = await UserCategoryTwo.create({
      name,
      status,
      description,
      userCategory: checkUserCategory._id,
      organization: checkOrganization._id,
    });
    if (!userCategoryTwo) {
      return badResponse(res, 'Failed to create user category');
    }
    return goodResponseDoc(
      res,
      'User Category created successfully',
      201,
      userCategoryTwo
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteUserCategory = (Model) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const userCategory = await Model.findByIdAndDelete(id);

    if (!userCategory) return badResponse(res, 'This category does not exist');

    goodResponse(res, 'Category deleted successfully');
    // const userCategory = await
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide category Id');
    console.log({ id });
    await UserCategoryTwo.deleteMany({ userCategory: id });
    const userCategory = await UserCategory.findByIdAndDelete(id);

    if (!userCategory) return badResponse(res, 'This category does not exist');

    goodResponse(res, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
